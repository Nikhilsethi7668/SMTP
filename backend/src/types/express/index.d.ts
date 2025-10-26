import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email?: string;
                role?: string;
            }
        }
    }
}

export interface TypedRequestBody<T> extends Request {
    body: T
}

export interface TypedRequestQuery<T> extends Request {
    query: T
}

export interface TypedRequest<T extends Record<string, any>, U extends Record<string, any>> extends Request {
    body: T;
    query: U;
}