// Placeholder for Authorization based on role of the users for Front-End APP

import type { Response, NextFunction } from 'express';
import type { AuthRequest, Role } from '../auth/types.js';

export function requireRole(...allowed: Role[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({error: 'Not authenticated'});
            return;
        }
        if (!allowed.includes(req.user.role)) {
            res.status(403).json({error: 'Do not have permissions'});
            return;
        }
        next();
    };
}