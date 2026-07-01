// JWT Token generations
import jwt from 'jsonwebtoken';
import type { JwtPayload, Role } from './types.js';

// Safe-Guarding if import order is mess up and if the JSON_SECRET does not exist
const getSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('MISSING JWT SECRET');
    return secret;
};

const TTL = '15m';

export function signToken(sub: string, role: Role): string {
    return jwt.sign({ role }, getSecret(), {
        subject: sub,
        expiresIn: TTL,
    });
}

export function verifyToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === "string" || !decoded.sub || !('role' in decoded)) {
        throw new Error('Invalid JWT Token');
    }
    return {subject: decoded.sub as string, role: decoded.role as Role};
}