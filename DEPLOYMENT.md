# DEPLOYMENT — Hostinger VPS, Nginx Proxy Manager, sub-domain

This guide deploys the Portfolio on the same VPS that already runs other projects behind **Nginx Proxy Manager** (NPM). The app is mounted on its own **sub-domain**.

Final URL: **`https://portfolio.printmarksgraphics.cloud/`**

---

## 0. Architecture

```
Internet ──HTTPS:443──► Nginx Proxy Manager (Docker container)
                          │
                          ├─ printmarksgraphics.cloud         → other project (untouched)
                          └─ portfolio.printmarksgraphics.cloud
                                ├─ /        → portfolio-web (Docker container, static SPA)
                                └─ /api/    → portfolio-api (Docker container, Express)
                                              │
                                              └─► portfolio-db (Postgres, internal only)
```

All app containers (`portfolio-web`, `portfolio-api`, `portfolio-db`) share an internal bridge network. `portfolio-web` and `portfolio-api` **additionally** join the NPM external network so NPM can reach them by container name. **Nothing is published on host ports** — only NPM listens on 80/443.

Persistent state lives in two Docker named volumes:

| Volume | Mounted on | Purpose |
|---|---|---|
| `portfolio-db` | `portfolio-db:/var/lib/postgresql/data` | Postgres data (profile, experiences, …). |
| `portfolio-storage` | `portfolio-api:/app/packages/backend/storage` | Admin-uploaded CV PDF (`cv.pdf`). Survives `docker compose up -d --build`. |

---

## 1. Prerequisites

- VPS already running NPM (Hostinger Ubuntu 24.04).
- DNS: an `A` record `portfolio.printmarksgraphics.cloud → <VPS_IP>` (TTL ~5 min).
- SSH access to the VPS as a non-root user (`portfolio` works well).
- **Local: run `pnpm --filter @portfolio/backend prisma:migrate` at least
  once before deploying** — this creates `packages/backend/prisma/migrations/`
  which must be committed to git. `prod:migrate` only **applies** existing
  migrations; it does not generate them.

---

## 2. Find the NPM Docker network

```bash
docker network ls
docker ps --format 'table {{.Names}}\t{{.Networks}}'
```

Identify the network used by the NPM container. Common names:
- `nginx-proxy-manager_default`
- `npm_default`
- `proxy` (custom)

Note this name — you will paste it into `.env` below.

---

## 3. Pull the code on the VPS

```bash
ssh portfolio@<VPS_IP>
cd ~
git clone <repo-url> portfolio
cd portfolio
```

---

## 4. Configure `.env`

```bash
cp .env.example .env
nano .env
```

Critical keys:

| Key | Value | Notes |
|---|---|---|
| `NPM_NETWORK` | (the name from step 2) | Must match exactly |
| `VITE_BASE_PATH` | `/` | Sub-domain root, no prefix |
| `VITE_API_BASE_URL` | `/api` | Browser-visible API URL |
| `CORS_ORIGINS` | `https://portfolio.printmarksgraphics.cloud` | Public origin |
| `POSTGRES_USER` | `portfolio` | DB user |
| `POSTGRES_PASSWORD` | (strong random) | Generate with `openssl rand -base64 24` |
| `POSTGRES_DB` | `portfolio` | DB name |
| `DATABASE_URL` | `postgresql://portfolio:<password>@portfolio-db:5432/portfolio?schema=public` | Used by Prisma at runtime |
| `JWT_SECRET` | (strong random) | `openssl rand -base64 48` |
| `ADMIN_EMAIL` | `you@example.com` | Seed admin user |
| `ADMIN_PASSWORD` | (strong) | Used only on first seed; rotate via admin UI later |
| `NODE_ENV` | `production` | |
| `LOG_LEVEL` | `info` | |

> ⚠️ Never commit `.env`. Only `.env.example` is in git.

---

## 5. Start the containers

```bash
docker compose up -d --build
docker compose ps
```

Expected: `portfolio-web`, `portfolio-api`, `portfolio-db` all `Up` (healthy).

Verify the web + api joined the NPM network:

```bash
docker network inspect $(grep '^NPM_NETWORK=' .env | cut -d= -f2) \
  | grep -E '"Name":|portfolio-'
```

You should see `portfolio-web` and `portfolio-api` listed. `portfolio-db` should **not** be on the NPM network — only on the internal `portfolio` bridge.

---

## 6. Run migrations + seed (first deploy only)

```bash
docker compose exec api pnpm prod:migrate
docker compose exec api pnpm prod:seed
```

> The `prod:*` scripts do **not** wrap the command in `dotenv-cli` — they
> rely on the env vars already injected by `docker compose` via `env_file`.

The seed creates:
- The singleton `Profile` (from the CV).
- All `Experience`, `Project`, `Skill`, `Education`, `Interest` rows.
- One admin `User` from `ADMIN_EMAIL` + `ADMIN_PASSWORD`.

If you re-run the seed it is idempotent (uses `upsert` on stable keys).

Smoke test from the NPM container:

```bash
docker exec <npm-container-name> wget -qO- http://portfolio-api:3001/api/health
# → {"ok":true}
docker exec <npm-container-name> wget -qO- -S http://portfolio-web:80/ 2>&1 | head -5
# → HTTP/1.1 200 OK
```

---

## 7. Configure the Proxy Host in Nginx Proxy Manager

1. Open the NPM admin UI (usually `http://<VPS_IP>:81`).
2. **Hosts → Proxy Hosts → Add Proxy Host**.
3. **Details** tab:
   - Domain Names: `portfolio.printmarksgraphics.cloud`
   - Scheme: `http`
   - Forward Hostname / IP: `portfolio-web`
   - Forward Port: `80`
   - Block Common Exploits: **on**
   - Websockets Support: **on** (harmless, future-proof)
4. **SSL** tab:
   - SSL Certificate: **Request a new SSL Certificate** (Let's Encrypt)
   - Force SSL: **on**
   - HTTP/2: **on**
   - HSTS: optional (recommend on once you've verified the cert)
   - Email + accept ToS.
5. **Advanced** tab — paste the snippet from `infra/nginx-proxy-manager.advanced.conf` (routes `/api/` to `portfolio-api:3001`).
6. **Save**.

NPM provisions the cert and reloads. If it errors, the most likely cause is a typo or that `portfolio-web` / `portfolio-api` aren't on the NPM network — fix step 5 and save again.

---

## 8. Smoke test from a browser

1. Open `https://portfolio.printmarksgraphics.cloud/` → the macOS desktop boots, terminal prompt appears.
2. DevTools → Network → confirm `/assets/*` returns 200 and `/api/profile` returns 200 with JSON.
3. Type `help`, `about`, `experience`, `projects`, `skills`, `contact`, `lang en`, `theme light`, `download cv` — each should respond correctly.
4. Refresh — language, theme, and history must persist.
5. Visit `/admin/login`, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, edit a field in any section, save → `GET /api/<section>` should reflect the change. Upload a CV under **CV** → `download cv` in the terminal should serve the new PDF.

---

## 9. Update & redeploy

```bash
cd ~/portfolio
git pull
docker compose up -d --build
docker compose exec api pnpm prod:migrate   # if new migrations
docker image prune -f
```

No NPM change needed — the Proxy Host keeps pointing to `portfolio-web` / `portfolio-api` by name.

---

## 10. Backups

```bash
# Off-host Postgres dump (run from your laptop)
ssh portfolio@<VPS_IP> 'docker compose -f ~/portfolio/docker-compose.yml exec -T db pg_dump -U portfolio portfolio' \
  > ~/backups/portfolio-$(date +%F).sql

# Off-host CV backup (admin-uploaded PDF)
ssh portfolio@<VPS_IP> 'docker compose -f ~/portfolio/docker-compose.yml exec -T api cat /app/packages/backend/storage/cv.pdf' \
  > ~/backups/cv-$(date +%F).pdf
```

Also worth keeping safe off-host:
- `~/portfolio/.env`
- A screenshot or export of the NPM Proxy Host's Advanced config.

> The CV uploaded through `/admin → CV` lives in the `portfolio-storage`
> Docker volume. `docker compose down` keeps it; only `docker compose down -v`
> wipes it.

A weekly cron on the VPS can persist dumps into a host-mounted volume:

```cron
0 3 * * 0 cd /home/portfolio/portfolio && docker compose exec -T db pg_dump -U portfolio portfolio | gzip > /home/portfolio/backups/portfolio-$(date +\%F).sql.gz
```

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `502 Bad Gateway` on `/` | `portfolio-web` not on NPM network | Check `NPM_NETWORK` in `.env`, `docker compose up -d` |
| Blank page, `Failed to load module script` from `/assets/...` | `VITE_BASE_PATH` not set at build time | Rebuild: `docker compose up -d --build` after fixing `.env` |
| `/api/health` returns 404 | NPM Advanced snippet missing or wrong `proxy_pass` | Re-paste `infra/nginx-proxy-manager.advanced.conf`, verify trailing `/` |
| `CORS error` in browser | `CORS_ORIGINS` does not include the public origin | Edit `.env`, `docker compose up -d` |
| API exits with `P1001` (Prisma) | DB not ready / wrong `DATABASE_URL` | `docker compose logs db`, check creds match `.env` |
| `prisma migrate deploy` fails | Migrations folder missing in image | Rebuild — migrations must be copied into the api image |
| Cert provisioning fails in NPM | DNS not propagated | `dig portfolio.printmarksgraphics.cloud +short` — wait, then retry |

---

## 12. Decommission

1. NPM UI → delete the `portfolio.printmarksgraphics.cloud` Proxy Host.
2. On the VPS:
   ```bash
   cd ~/portfolio
   docker compose down -v   # ⚠️ -v drops the Postgres volume
   rm -rf ~/portfolio
   ```
3. (Optional) remove the DNS record.
