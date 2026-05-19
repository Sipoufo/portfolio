// index.ts
// Express 5 entry point. Public API only in this iteration; auth/admin routes
// are scaffolded and will be mounted in a follow-up.

import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { corsOrigins, env } from './env.js';
import { errorHandler, notFound } from './middleware/error.js';
import publicRouter from './routes/public.js';
import cvRouter from './routes/cv.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(pinoHttp({ level: env.LOG_LEVEL }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', publicRouter);
app.use('/api', cvRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[portfolio-api] listening on :${env.PORT}`);
});

const shutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`[portfolio-api] received ${signal}, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
