import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../auth/types.js';
import { verifyToken } from '../auth/token.js';

// Separation between a user request vs a service request (discord bot)

// Bot Request: 
const getServiceToken = (): string => {
    const secret = process.env.SERVICE_SECRET;
    if (!secret) throw new Error('MISSING SERVICE SECRET');
    return secret;
};

export function authenticateService(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): void {
    const headerPresented = req.headers['bot-service-token'];
    if (typeof headerPresented !== 'string' || headerPresented !== getServiceToken()) {
        res.status(401).json({error: 'Invalid service credential'});
        return;
    }
    req.user = {subject: 'service:bot', role: 'service'};
    next();
}
