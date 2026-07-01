import type { Request } from 'express';

// The three different roles the server want to handle requests for.
export type Role = 'user' | 'admin' | 'service';

// JWT payloads
export interface JwtPayload {
    subject: string;
    role: Role;
}

// An extended Request type with an additional optional property user, which will allowing us to identify an user
// if middleware attaches it
export interface AuthRequest extends Request {
    user?: JwtPayload;
}