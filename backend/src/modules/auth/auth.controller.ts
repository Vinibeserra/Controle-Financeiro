import { Request, Response } from "express";
import { AuthService } from "./auth.services";

const authService = new AuthService();

export class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            return res.status(200).json(result);
        } catch (error) {
            return res.status(401).json({ message: (error as Error).message });
        }
    }

    async register(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;

            const user = await authService.register(name, email, password);

            return res.status(201).json(user);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    }

    async refresh(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ message: "Refresh token is required" });
            }

            const result = await authService.refresh(refreshToken);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(401).json({ message: (error as Error).message });
        }
    }
}