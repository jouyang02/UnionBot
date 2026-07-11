import type { Request, Response, NextFunction } from 'express';

// Handles error when response header has already been sent.
// Catches double response from server, preventing server from a double response.
export function errorHandler(
    err: unknown,
    _req: Request, 
    res: Response, 
    _next: NextFunction): void {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error('[Error]', message);
        if (res.headersSent) return;
        res.status(500).json({error: 'Internal server error'});
    }