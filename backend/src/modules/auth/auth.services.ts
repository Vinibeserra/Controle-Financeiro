import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../../shared/jwt";
import jwt from "jsonwebtoken";

export class AuthService {
    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });

        return {
            accessToken, refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }

        };
    }

    async register(name: string, email: string, password: string) {

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            throw new Error("Email already in use");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name
        };
    }

    async refresh(refreshToken: string) {
        try {
           const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { sub: string };

            const userId = payload.sub;

            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (!user || !user.refreshToken) {
                throw new Error("Invalid refresh token");
            }

            if (user.refreshToken !== refreshToken) {
                throw new Error("Refresh token does not match");
            }

            const newAccessToken = generateAccessToken(userId);
            const newRefreshToken = generateRefreshToken(userId);

            await prisma.user.update({
                where: { id: userId },
                data: { refreshToken: newRefreshToken }
            });

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new Error("Invalid refresh token");
        }
    }
}


