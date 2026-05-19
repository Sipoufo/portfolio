# Single-stage build for the Express + Prisma API.
# Built from the repo root: `docker build -f packages/backend/Dockerfile .`
# The API runs via `tsx` (TS at runtime) — simpler than maintaining a TSC
# build step across the workspace (shared package imports stay TS-only).

FROM node:20-alpine
RUN apk add --no-cache libc6-compat openssl tini
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

# Manifests first to maximise the dep-install layer cache.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/

# Install with devDependencies so prisma, tsx and types are available at
# build/runtime (the API runs on tsx, not on compiled JS).
RUN pnpm install --frozen-lockfile=false --prod=false

# Source.
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend

# Prisma client must be generated against the runtime libc.
RUN pnpm --filter @portfolio/backend exec prisma generate

# CV asset served by GET /api/cv
COPY CV_SIPOUFO_DJIODOM_Loic_Yvan.pdf ./packages/backend/assets/CV_SIPOUFO_DJIODOM_Loic_Yvan.pdf

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app/packages/backend
EXPOSE 3001
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["pnpm", "start"]
