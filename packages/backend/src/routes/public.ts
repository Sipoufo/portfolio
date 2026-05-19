// public.ts
// Public read-only API. Cached briefly (60s) by upstream proxies.

import { Router } from 'express';
import { prisma } from '../services/prisma.js';

const router = Router();

router.use((_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60');
  next();
});

router.get('/profile', async (_req, res, next) => {
  try {
    const profile = await prisma.profile.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.get('/experiences', async (_req, res, next) => {
  try {
    const rows = await prisma.experience.findMany({ orderBy: [{ order: 'asc' }, { startDate: 'desc' }] });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/projects', async (_req, res, next) => {
  try {
    const rows = await prisma.project.findMany({ orderBy: [{ order: 'asc' }, { startDate: 'desc' }] });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/skills', async (_req, res, next) => {
  try {
    const rows = await prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }, { name: 'asc' }] });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/education', async (_req, res, next) => {
  try {
    const rows = await prisma.education.findMany({ orderBy: [{ order: 'asc' }, { startDate: 'desc' }] });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/interests', async (_req, res, next) => {
  try {
    const rows = await prisma.interest.findMany({ orderBy: [{ order: 'asc' }] });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
