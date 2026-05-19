// cv.ts
// Streams the latest CV PDF. Priority:
//   1) Admin-uploaded copy at $CV_STORAGE_DIR/cv.pdf
//   2) Bundled fallback at packages/backend/assets/CV_*.pdf

import { Router } from 'express';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../env.js';

const router = Router();

const BUNDLED_FILENAME = 'CV_SIPOUFO_DJIODOM_Loic_Yvan.pdf';
const UPLOADED_FILENAME = 'cv.pdf';

const here = fileURLToPath(new URL('.', import.meta.url));
const packageRoot = resolve(here, '..', '..');

const uploadedPath = (): string =>
  resolve(packageRoot, env.CV_STORAGE_DIR, UPLOADED_FILENAME);

const bundledCandidates = [
  resolve(packageRoot, 'assets', BUNDLED_FILENAME),
  resolve(process.cwd(), 'assets', BUNDLED_FILENAME),
  resolve(process.cwd(), '..', '..', BUNDLED_FILENAME),
];

const findCv = async (): Promise<string | null> => {
  try {
    await stat(uploadedPath());
    return uploadedPath();
  } catch {
    // fall through to bundled
  }
  for (const path of bundledCandidates) {
    try {
      await stat(path);
      return path;
    } catch {
      // try next
    }
  }
  return null;
};

router.get('/cv', async (_req, res, next) => {
  try {
    const path = await findCv();
    if (!path) {
      res.status(404).json({ error: 'CV not found on server' });
      return;
    }
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${BUNDLED_FILENAME}"`);
    res.set('Cache-Control', 'public, max-age=60');
    createReadStream(path).pipe(res);
  } catch (err) {
    next(err);
  }
});

export { findCv, uploadedPath };
export default router;
