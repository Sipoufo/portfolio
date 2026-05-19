# PROJECT — Portfolio (Mac Terminal)

## Mission

An interactive personal portfolio for **SIPOUFO DJIODOM Loïc Yvan** rendered as a **macOS Terminal** window. Visitors discover the profile by typing commands — much like a real shell session. A separate backend (Express + Postgres) stores the content so it can be edited at any time without redeploying the frontend.

Reference of the interaction model: <https://terminal.iabhinav.me/>
Visual reference: the macOS Terminal app (see `My_terminal.png` at the repo root).

## Public surface

Single page (`/`) that boots a macOS desktop:

- **Wallpaper** (dynamic, day/night aware).
- **Menu bar** (top): Apple logo, app name (`Terminal`), File / Edit / View / Window / Help, right side = clock + language switcher.
- **Dock** (bottom): Terminal (active), Finder (opens `ls`), Mail (opens `contact`), Safari → GitHub, Safari → LinkedIn, Preview → CV.
- **Terminal window** (centered, draggable, resizable feel): traffic lights, dynamic title (`loic@portfolio — -zsh — 120×30`), zsh-style prompt.

## Command catalog (v1)

| Command | Description |
|---|---|
| `help` | List all commands with short descriptions. |
| `about` | Profile summary (FR/EN). |
| `whoami` | One-line identity. |
| `skills` | Technical skills grouped by category. |
| `experience` | Work history (most recent first). |
| `projects` | Side projects / freelance projects. |
| `education` | Degrees + school. |
| `interests` | Personal interests. |
| `contact` | Email, phone, LinkedIn, GitHub. |
| `ls [path]` | List virtual filesystem entries (`~`, `~/experience`, `~/projects`). |
| `cat <file>` | Print a virtual file (e.g. `cat about.md`). |
| `pwd` | Print current virtual path. |
| `clear` | Clear the screen. |
| `lang fr\|en` | Switch interface + content language. |
| `theme dark\|light` | Switch between Pro (dark) and Basic (light) themes. |
| `download cv` | Trigger download of the latest CV PDF. |
| `open <target>` | Open a link in a new tab: `github`, `linkedin`, `mail`. |
| `date` | Current date/time. |
| `echo <text>` | Echo text back. |

### Easter eggs

| Command | Effect |
|---|---|
| `sudo <anything>` | Replies with the classic xkcd `sudo make me a sandwich` reference, then runs the command. |
| `neofetch` | ASCII art logo + system info card (fake but cute). |
| `matrix` | Falling green chars overlay until any key is pressed. |
| `coffee` | ASCII coffee cup. |
| `vim` | `^C` to exit joke. |
| `rm -rf /` | Refuses gracefully. |

### Shell affordances

- **History**: ↑ / ↓ navigate previous commands, persisted in `localStorage`.
- **Autocomplete**: `Tab` completes command names and `cat` filenames.
- **Reverse search**: `Ctrl+R` (stretch).
- **Boot sequence**: a brief typed-out `Last login: …` line and a one-line tagline before the first prompt.

## Content (seed from CV)

The seed reads from a structured `seed.ts` file (transcribed from `CV_SIPOUFO_DJIODOM_Loic_Yvan.pdf`):

- **Profile**: name, title (`Mobile Developer & Project Manager | Full Stack`), summary FR/EN, email `sipoufoknj@gmail.com`, phone `+237 6 95 91 49 26`, location `Douala, Cameroon`, GitHub `Sipoufo`, LinkedIn `yvansipoufo29`.
- **Skills** (categories): Mobile, Backend, Frontend, Databases, DevOps & Tools, Project Management, Languages.
- **Experiences**: Zeney App, AfroDiet, COCOONIN, T'S Consulting (Software Developer), ChapChapTickets, CRM Forage; plus three internships.
- **Projects**: same as experiences when freelance/personal; can be enriched later via the admin UI.
- **Education**: UCAC-ICAM Engineering degree, Bac TI.
- **Interests**: Basketball, Swimming, Reading, Personal development.

All textual fields are bilingual (`{ fr, en }`). The seed writes both; later, admin updates can target one language at a time.

## API surface (public)

| Method | Path | Returns |
|---|---|---|
| GET | `/api/health` | `{ ok: true }` |
| GET | `/api/profile` | The singleton profile. |
| GET | `/api/experiences` | Ordered list. |
| GET | `/api/projects` | Ordered list. |
| GET | `/api/skills` | Grouped by category. |
| GET | `/api/education` | Ordered list. |
| GET | `/api/interests` | Ordered list. |
| GET | `/api/cv` | Streams the CV PDF (read from disk / volume). |

Admin routes (`/api/auth/*`, `/api/admin/*`) are scaffolded but **not enabled in the public iteration**. They will be exposed in a follow-up iteration.

## Caching

- The frontend fetches `/api/profile` + all collections once on boot and keeps them in memory; the terminal commands read from this in-memory store. No SWR / TanStack Query needed in v1.
- Backend sets `Cache-Control: public, max-age=60` on public GETs.

## Out of scope (v1)

- Admin UI (next iteration).
- Multi-tenant. Always a single profile.
- Analytics. Add later if needed.
- Server-side rendering. SPA is fine for the use case.
