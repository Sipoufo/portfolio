// auth.ts
// JWT cookie-based auth middleware. The token lives in an httpOnly cookie
// named `portfolio_session` set by POST /api/auth/login.

import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { HttpError } from './error.js';

export const COOKIE_NAME = 'portfolio_session';
export const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

export type AuthPayload = { sub: string; email: string };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const signSession = (payload: AuthPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });

export const verifySession = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = (req.cookies as Record<string, string | undefined>)[COOKIE_NAME];
  if (!token) {
    next(new HttpError(401, 'Unauthorized'));
    return;
  }
  const payload = verifySession(token);
  if (!payload) {
    next(new HttpError(401, 'Unauthorized'));
    return;
  }
  req.user = payload;
  next();
};
