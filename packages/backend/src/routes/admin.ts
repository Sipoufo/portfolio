// admin.ts
// Authenticated CRUD endpoints. Profile is a singleton (PUT only). All other
// collections expose POST / PUT / DELETE keyed by id.

import { Router } from 'express';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import multer from 'multer';
import {
  educationInputSchema,
  experienceInputSchema,
  interestInputSchema,
  profileInputSchema,
  projectInputSchema,
  skillInputSchema,
} from '@portfolio/shared';
import { prisma } from '../services/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import { uploadedPath } from './cv.js';

const router = Router();

router.use(requireAuth);

// ── Profile (singleton) ──────────────────────────────────────────────────
router.put('/profile', async (req, res, next) => {
  try {
    const input = profileInputSchema.parse(req.body);
    const existing = await prisma.profile.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!existing) {
      const created = await prisma.profile.create({ data: input });
      res.json(created);
      return;
    }
    const updated = await prisma.profile.update({ where: { id: existing.id }, data: input });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Generic collection helper ────────────────────────────────────────────
type CollectionModel =
  | typeof prisma.experience
  | typeof prisma.project
  | typeof prisma.skill
  | typeof prisma.education
  | typeof prisma.interest;

const collectionRoutes = <I,>(
  base: string,
  model: CollectionModel,
  parse: (body: unknown) => I,
) => {
  router.post(base, async (req, res, next) => {
    try {
      const data = parse(req.body) as never;
      const created = await (model as { create: (a: { data: never }) => Promise<unknown> }).create({ data });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  router.put(`${base}/:id`, async (req, res, next) => {
    try {
      const data = parse(req.body) as never;
      const updated = await (model as {
        update: (a: { where: { id: string }; data: never }) => Promise<unknown>;
      }).update({ where: { id: req.params.id }, data });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  router.delete(`${base}/:id`, async (req, res, next) => {
    try {
      await (model as { delete: (a: { where: { id: string } }) => Promise<unknown> }).delete({
        where: { id: req.params.id },
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });
};

collectionRoutes('/experiences', prisma.experience, (b) => experienceInputSchema.parse(b));
collectionRoutes('/projects', prisma.project, (b) => projectInputSchema.parse(b));
collectionRoutes('/skills', prisma.skill, (b) => skillInputSchema.parse(b));
collectionRoutes('/education', prisma.education, (b) => educationInputSchema.parse(b));
collectionRoutes('/interests', prisma.interest, (b) => interestInputSchema.parse(b));

// ── CV upload ────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new HttpError(400, 'Only PDF files are accepted'));
      return;
    }
    cb(null, true);
  },
});

router.post('/cv', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, 'Missing file');
    const dest = uploadedPath();
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, req.file.buffer);
    res.json({ ok: true, size: req.file.size, updatedAt: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

// ── Change password ──────────────────────────────────────────────────────
router.post('/password', async (req, res, next) => {
  try {
    const body = req.body as { current?: string; next?: string };
    if (!body.current || !body.next || body.next.length < 8) {
      throw new HttpError(400, 'Invalid payload');
    }
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw new HttpError(404, 'User not found');
    const bcrypt = await import('bcryptjs');
    const ok = await bcrypt.default.compare(body.current, user.passwordHash);
    if (!ok) throw new HttpError(401, 'Current password is wrong');
    const passwordHash = await bcrypt.default.hash(body.next, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
