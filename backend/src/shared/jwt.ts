import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const jwt_refresh_secret = process.env.JWT_REFRESH_SECRET as string;

export function generateAccessToken(userId: string): string {
    return jwt.sign({sub: userId}, 
        JWT_SECRET, {expiresIn: '15m'
     });
}

export function generateRefreshToken(userId: string) {
    return jwt.sign({sub: userId}, 
        jwt_refresh_secret, {expiresIn: '7d'
     });
}

console.log('JWT_SECRET:', JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', jwt_refresh_secret);