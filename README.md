# Portfolio — Mac Terminal

Interactive personal portfolio rendered as a macOS Terminal window. Visitors type commands (`help`, `about`, `experience`, `projects`, `skills`, `contact`, `cat about.md`, …) and discover the profile like a real shell session. A separate admin UI (macOS *System Settings* style) lets the owner edit every section and replace the CV PDF without redeploying.

Live target: **<https://portfolio.printmarksgraphics.cloud/>**

---

## Stack

- **Frontend** — React 19 · Vite 6 · TypeScript · Tailwind 4 · i18next (FR/EN) · framer-motion · react-hook-form + Zod (admin).
- **Backend** — Node 20 · Express 5 · TypeScript · Prisma · PostgreSQL 16 · JWT (httpOnly cookie) · Multer (CV upload).
- **Shared** — `@portfolio/shared` package: types + Zod validators consumed by both apps.
- **Infra** — pnpm workspaces · Docker Compose (web + api + db) · Nginx Proxy Manager (existing on the VPS).

---

## Project layout

```
portfolio/
├── packages/
│   ├── shared/      # types + Zod schemas
│   ├── frontend/    # React + Vite SPA
│   └── backend/     # Express + Prisma API
├── prisma/          # → packages/backend/prisma
├── infra/           # nginx.conf, NPM advanced snippet
├── docker-compose.yml
├── .env.example
├── CLAUDE.md
├── PROJECT.md
├── DESIGN_SYSTEM.md
├── DEPLOYMENT.md
└── README.md
```

See `CLAUDE.md` for the full tree and conventions.

---

## Quick start (local dev)

```bash
# 1) Install deps
pnpm install

# 2) Configure env
cp .env.example .env
# Edit .env: set POSTGRES_PASSWORD, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD,
# and align DATABASE_URL's password with POSTGRES_PASSWORD.

# 3) Start Postgres (host port 5432 → container)
docker compose up -d db

# 4) Migrate + seed
pnpm --filter @portfolio/backend prisma:migrate    # first time: creates packages/backend/prisma/migrations/
pnpm --filter @portfolio/backend prisma:seed       # creates the admin user from .env + portfolio data

# 5) Run both apps in parallel
pnpm dev
```

- Public terminal: **<http://localhost:5173/>**
- Admin login: **<http://localhost:5173/admin/login>** (use `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

> Don't forget to **commit `packages/backend/prisma/migrations/`** after the first `prisma:migrate` — the production deploy applies them with `prisma migrate deploy`.

---

## Commands

Run from the repo root unless noted.

| Command | Description |
|---|---|
| `pnpm dev` | Run frontend (`:5173`) and backend (`:3001`) in parallel. |
| `pnpm build` | Build all packages. |
| `pnpm lint` | Lint all packages. |
| `pnpm type-check` | TypeScript check across the workspace. |
| `pnpm format` | Prettier write. |
| `pnpm --filter @portfolio/backend prisma:migrate` | Create + apply a new migration (dev). |
| `pnpm --filter @portfolio/backend prisma:seed` | Seed the DB from `prisma/seed.ts`. |
| `pnpm --filter @portfolio/backend prisma:studio` | Open Prisma Studio. |
| `docker compose up -d` | Bring up `db` + `api` + `web` locally. |

---

## Terminal commands (public surface)

`help`, `about`, `whoami`, `skills`, `experience`, `projects`, `education`, `interests`, `contact`, `ls [path]`, `cat <file>`, `pwd`, `clear`, `lang fr|en`, `theme dark|light`, `download cv`, `open github|linkedin|mail`, `date`, `echo <text>`.

Easter eggs (hidden from `help`): `sudo`, `neofetch`, `matrix`, `coffee`, `vim`, `rm`.

Shell affordances: `↑/↓` history, `Tab` autocomplete (commands + `cat` filenames), `Ctrl+L` clear, drag-friendly window chrome, traffic lights, live menu-bar clock, dock with Terminal / Finder / Mail / GitHub / LinkedIn / CV.

---

## Admin

Path: `/admin` (protected, JWT cookie). Sections:

- **Profile** — name, bilingual title/summary/location, email, phone, socials.
- **Experience** — company, bilingual role/location, dates, bullets (FR/EN), tech list.
- **Projects** — name, bilingual role/description, dates, tech, custom links.
- **Skills** — category + name + order.
- **Education** — school + bilingual degree/location + dates.
- **Interests** — bilingual labels.
- **CV** — upload a new PDF (max 5 MB). Persisted in the `portfolio-storage` Docker volume; `GET /api/cv` (and the `download cv` terminal command) immediately serves it.

Auth uses an httpOnly cookie set by `POST /api/auth/login`. The token never reaches JS-land. Use `POST /api/admin/password` to rotate the admin password.

---

## Documentation

| File | Purpose |
|---|---|
| `CLAUDE.md` | Project rules + conventions + prohibitions (read first when contributing or pairing with Claude Code). |
| `PROJECT.md` | Product context, command catalog, content rules, API surface. |
| `DESIGN_SYSTEM.md` | Mac Terminal tokens (Pro/Basic), window chrome, dock, motion, accessibility. |
| `DEPLOYMENT.md` | Hostinger VPS + NPM step-by-step (sub-domain, certs, backups, troubleshooting). |

---

## Deployment

Sub-domain `portfolio.printmarksgraphics.cloud` behind the existing Nginx Proxy Manager on the VPS. See **`DEPLOYMENT.md`** for the full guide. Quick recap:

```bash
# On the VPS
ssh portfolio@<VPS_IP>
git clone <repo> ~/portfolio && cd ~/portfolio
cp .env.example .env && nano .env             # set secrets + NPM_NETWORK
docker compose up -d --build
docker compose exec api pnpm prod:migrate
docker compose exec api pnpm prod:seed
```

Then add a Proxy Host in NPM pointing to `portfolio-web:80` and paste `infra/nginx-proxy-manager.advanced.conf` into the **Advanced** tab to route `/api/*` to `portfolio-api:3001`.

---

## License

Personal project — all rights reserved unless stated otherwise.
