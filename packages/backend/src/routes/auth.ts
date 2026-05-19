// auth.ts
// Auth endpoints: login, logout, current-user.

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@portfolio/shared';
import { prisma } from '../services/prisma.js';
import { env } from '../env.js';
import { HttpError } from '../middleware/error.js';
import { COOKIE_MAX_AGE, COOKIE_NAME, requireAuth, signSession } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, 'Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, 'Invalid credentials');

    const token = signSession({ sub: user.id, email: user.email });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user ?? null);
});

export default router;
