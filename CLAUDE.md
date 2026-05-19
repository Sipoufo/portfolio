# Project: Portfolio — Mac Terminal Experience

> React 19 SPA (Vite) + Node/Express API + PostgreSQL — an interactive portfolio rendered as a macOS Terminal window.
> See @PROJECT.md for full project context, content rules, and command catalog.
> See @DESIGN_SYSTEM.md for UI/UX tokens (Mac Terminal palette, typography, dock, window chrome).
> See @DEPLOYMENT.md for VPS deployment via Nginx Proxy Manager on the sub-domain `portfolio.printmarksgraphics.cloud`.

---

# Tech Stack

## Frontend (`packages/frontend`)
- Framework: **React 19** (function components + hooks)
- Build tool: **Vite 6**
- Language: **TypeScript** (strict)
- Styling: **Tailwind CSS 4** (CSS-first config via `@theme`, tokens in `styles/tokens.css`)
- Routing: **react-router-dom**
- Forms (admin only): **react-hook-form + Zod**
- i18n: **i18next + react-i18next** (FR default, EN)
- Animations: **framer-motion** (boot/typing, theme transitions)
- Icons: **lucide-react** (used sparingly — dock, menu bar)
- HTTP: **fetch** wrapped in `services/api.ts`

## Backend (`packages/backend`)
- Runtime: **Node 20**
- Framework: **Express 5**
- Language: **TypeScript** (strict)
- ORM: **Prisma**
- Database: **PostgreSQL 16**
- Validation: **Zod**
- Auth: **JWT** (cookie httpOnly) + **bcrypt** for admin password
- Logging: **pino**

## Shared (`packages/shared`)
- Single source of truth for portfolio types and Zod schemas.
- Imported by both `frontend` and `backend` via pnpm workspace (`workspace:*`).

## Infra
- **pnpm workspaces** (monorepo)
- **Docker Compose** (services: `web` Nginx-static, `api` Node, `db` Postgres, all on the NPM external network)
- **Nginx Proxy Manager** (already running on the VPS) terminates HTTPS and proxies by container name.
- Target host: **Hostinger VPS, Ubuntu 24.04**, sub-domain `portfolio.printmarksgraphics.cloud`.

---

# Project Structure

```
portfolio/
├── packages/
│   ├── shared/                    # @portfolio/shared
│   │   └── src/
│   │       ├── types.ts           # Profile, Experience, Project, Skill, Education, Interest, LocalizedString
│   │       ├── schemas.ts         # Zod validators
│   │       └── index.ts
│   │
│   ├── frontend/                  # @portfolio/frontend (React + Vite)
│   │   └── src/
│   │       ├── components/
│   │       │   ├── macos/         # MenuBar, Dock, WindowFrame (traffic lights), Wallpaper, Clock
│   │       │   ├── terminal/      # Terminal, Prompt, OutputLine, Cursor, BootSequence
│   │       │   └── ui/            # Button, Input, Card (admin primitives)
│   │       ├── features/
│   │       │   ├── terminal/
│   │       │   │   ├── useTerminal.ts        # history, autocomplete, exec
│   │       │   │   ├── parser.ts             # tokenize input
│   │       │   │   ├── filesystem.ts         # virtual ~/about.md, ~/experience/*, ~/projects/*
│   │       │   │   └── commands/             # one file per command (help, about, ls, cat, theme, lang, sudo, neofetch, matrix, …)
│   │       │   ├── i18n/                     # i18next setup + locales (fr.json, en.json)
│   │       │   └── admin/                    # login + dashboard CRUD (later iteration)
│   │       ├── pages/             # TerminalPage, AdminLogin, AdminDashboard
│   │       ├── services/api.ts
│   │       ├── styles/tokens.css  # Mac Terminal palette (Pro dark + Basic light)
│   │       ├── styles/globals.css
│   │       └── main.tsx
│   │
│   └── backend/                   # @portfolio/backend (Express + Prisma)
│       └── src/
│           ├── routes/
│           │   ├── public.ts      # GET /api/profile, /api/experiences, /api/projects, /api/skills, /api/education, /api/interests
│           │   ├── auth.ts        # POST /api/auth/login, /logout, GET /me
│           │   └── admin.ts       # CRUD protected by JWT (later iteration)
│           ├── middleware/        # auth.ts, error.ts, requestLogger.ts
│           ├── services/          # prisma.ts, seed.ts
│           ├── validation/        # Zod input schemas
│           └── index.ts
│
├── prisma/
│   ├── schema.prisma              # Profile, Experience, Project, Skill, Education, Interest, User(admin)
│   └── migrations/
├── infra/
│   ├── nginx.conf                 # static SPA serving for the web container
│   └── nginx-proxy-manager.advanced.conf  # snippet for NPM
├── docker-compose.yml
├── .env.example
├── DEPLOYMENT.md
├── PROJECT.md
├── DESIGN_SYSTEM.md
└── CLAUDE.md
```

---

# Conventions

- Components: `PascalCase` (e.g. `WindowFrame.tsx`, `TrafficLights.tsx`)
- Hooks: `camelCase` prefixed with `use` (e.g. `useTerminal.ts`)
- Services / utils: `camelCase`
- Types/Interfaces: `PascalCase` with purpose suffix (e.g. `TerminalCommand`, `ExperienceDTO`)
- Files & folders: `kebab-case` for folders, `PascalCase.tsx` for components, `camelCase.ts` for non-component modules
- Constants: `SCREAMING_SNAKE_CASE`
- Always function components with hooks — **no class components**
- Never use `any` — type explicitly or use `unknown` + narrowing
- All code comments in **English**
- JSDoc for exported functions, services, and complex hooks:

```ts
/**
 * Executes a terminal command and returns the rendered output lines.
 * @param input - Raw user input (with arguments)
 * @returns Promise resolving to the lines to append to the terminal buffer
 */
export const exec = (input: string): Promise<OutputLine[]> => ...
```

- Top-level comment on each component file describing its purpose:

```tsx
// WindowFrame.tsx
// macOS-style window chrome with traffic lights and dynamic title bar.
```

---

# i18n Rules

- **All user-facing UI chrome** (menu bar items, dock tooltips, admin labels, error messages, command help text) must use `t()` from `useTranslation()`.
- **Portfolio content** (experiences, projects, skills, etc.) is bilingual at the data level: every text field is stored as `{ fr: string, en: string }` (`LocalizedString`) in Postgres (JSONB) and resolved by the active language at render time.
- Supported languages: `fr` (default), `en`
- UI locale files: `packages/frontend/src/features/i18n/locales/fr.json` and `en.json`
- When adding a UI key, always add it to **both** locale files in the same commit.
- Language toggle: terminal command `lang fr` / `lang en`, also accessible from the menu bar; persisted in `localStorage` (`portfolio:lang`).

---

# Commands

Run from repo root.

## Development
- Install: `pnpm install`
- Dev (both apps in parallel): `pnpm dev`
- Frontend only: `pnpm --filter @portfolio/frontend dev`
- Backend only: `pnpm --filter @portfolio/backend dev`
- DB migrate (dev): `pnpm --filter @portfolio/backend prisma:migrate`
- DB seed: `pnpm --filter @portfolio/backend prisma:seed`
- Prisma Studio: `pnpm --filter @portfolio/backend prisma:studio`

## Build
- `pnpm build` (builds all packages)

## Code Quality
- `pnpm lint`
- `pnpm type-check`
- `pnpm format`

## Docker / Deploy
- Local up: `docker compose up --build`
- See `DEPLOYMENT.md` for VPS deployment.

---

# Project Rules

## 1. Plan Before Coding
- Before any non-trivial change, write a short plan (steps, files, risks) and wait for explicit validation.

## 2. Shared schema is the source of truth
- Every shared type and Zod validator lives in `packages/shared/src/`.
- Frontend (rendering, admin form validation) and backend (input validation, response shaping) consume it. **Never duplicate.**

## 3. Brand fidelity (macOS Terminal)
- Every visual element of the public site (window chrome, dock, menu bar, prompt) must use only the tokens defined in `DESIGN_SYSTEM.md`.
- Default theme = **Pro** (dark, matches the reference screenshot). Secondary theme = **Basic** (light).
- Do not introduce colors outside the documented palette.

## 4. Always Test Before Shipping
- Run `pnpm lint && pnpm type-check` before any commit.
- Manually walk every terminal command in FR and EN at least once before declaring a feature done.

## 5. Autonomous Bug Fixing
- Analyze root cause before fixing.
- After fixing, validate with lint + type-check.

---

# Prohibitions

- NEVER hardcode UI chrome strings — always use i18next.
- NEVER inline styles — Tailwind utility classes only (with tokens defined in `tokens.css`).
- NEVER call `fetch` directly in a component — always go through `services/api.ts`.
- NEVER use `any` in TypeScript.
- NEVER use class components.
- NEVER duplicate types or Zod schemas in `frontend` or `backend` — always import from `@portfolio/shared`.
- NEVER commit with TypeScript errors or ESLint violations.
- NEVER expose JWT secrets, SMTP creds, or DB credentials to the frontend — secrets stay in the backend `.env`.
- NEVER introduce a color outside the Mac Terminal palette (see DESIGN_SYSTEM.md).
- NEVER use pure black (`#000000`) for terminal background — use the documented Pro/Basic backgrounds.
- NEVER write comments in French — English only.
- NEVER write obvious comments that restate the code.
