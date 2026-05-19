# DESIGN SYSTEM — Mac Terminal

The portfolio mimics Apple's **Terminal.app** on macOS Sonoma/Sequoia. Two color profiles are supported:

- **Pro** (default, dark) — matches the reference `My_terminal.png`.
- **Basic** (light).

All tokens are defined in `packages/frontend/src/styles/tokens.css` via Tailwind 4 `@theme`.

---

## Palette — Pro (dark, default)

| Token | Hex | Usage |
|---|---|---|
| `--color-term-bg` | `#1E1E1E` | Terminal body background |
| `--color-term-bg-translucent` | `rgba(30,30,30,0.86)` | With backdrop-blur, like Terminal.app |
| `--color-term-fg` | `#E5E5E5` | Default text |
| `--color-term-muted` | `#8E8E93` | Secondary text, timestamps |
| `--color-term-prompt-user` | `#7EE787` | `loic@…` user/host in prompt (matches macOS green) |
| `--color-term-prompt-path` | `#79C0FF` | `~/portfolio` path in prompt (cyan/blue) |
| `--color-term-prompt-arrow` | `#A371F7` | `➜` arrow (purple) |
| `--color-term-prompt-git` | `#F2CC60` | `git:(main)` branch (yellow) |
| `--color-term-prompt-dirty` | `#F85149` | `✗` dirty marker (red, used only here and in errors) |
| `--color-term-link` | `#79C0FF` | Inline links |
| `--color-term-accent` | `#FFA657` | Highlights (project names, headings) |
| `--color-term-success` | `#7EE787` | Success outputs |
| `--color-term-warn` | `#F2CC60` | Warnings |
| `--color-term-error` | `#F85149` | Errors and `sudo` jokes |
| `--color-term-selection` | `rgba(121,192,255,0.30)` | Text selection |

### Window chrome

| Token | Hex | Usage |
|---|---|---|
| `--color-window-titlebar` | `#3A3A3C` | Title bar background |
| `--color-window-titlebar-fg` | `#D1D1D6` | Title text |
| `--color-window-border` | `rgba(255,255,255,0.08)` | 1px hairline around the window |
| `--color-traffic-close` | `#FF5F57` | Red dot |
| `--color-traffic-min` | `#FEBC2E` | Yellow dot |
| `--color-traffic-zoom` | `#28C840` | Green dot |
| `--color-traffic-idle` | `#595959` | Dots when window not focused |

### Desktop chrome

| Token | Hex | Usage |
|---|---|---|
| `--color-menubar-bg` | `rgba(30,30,30,0.6)` | Top menu bar (backdrop-blur) |
| `--color-menubar-fg` | `#F2F2F7` | Menu bar text |
| `--color-dock-bg` | `rgba(50,50,50,0.45)` | Dock background with blur |
| `--color-dock-border` | `rgba(255,255,255,0.12)` | Dock 1px border |
| `--color-wallpaper-from` | `#1B2A4E` | Wallpaper gradient start (night-ish) |
| `--color-wallpaper-to` | `#5E3B76` | Wallpaper gradient end |

---

## Palette — Basic (light)

| Token | Hex | Usage |
|---|---|---|
| `--color-term-bg` | `#FFFFFF` | Terminal body background |
| `--color-term-fg` | `#1D1D1F` | Default text (never `#000000`) |
| `--color-term-muted` | `#6E6E73` | Secondary text |
| `--color-term-prompt-user` | `#1A7F37` | User/host |
| `--color-term-prompt-path` | `#0969DA` | Path |
| `--color-term-prompt-arrow` | `#8250DF` | Arrow |
| `--color-term-prompt-git` | `#9A6700` | Branch |
| `--color-term-prompt-dirty` | `#CF222E` | Dirty marker |
| `--color-term-link` | `#0969DA` | Inline links |
| `--color-term-accent` | `#BC4C00` | Highlights |
| `--color-term-success` | `#1A7F37` | Success |
| `--color-term-warn` | `#9A6700` | Warning |
| `--color-term-error` | `#CF222E` | Error |
| `--color-window-titlebar` | `#E8E8ED` | Title bar |
| `--color-window-titlebar-fg` | `#1D1D1F` | Title text |
| `--color-window-border` | `rgba(0,0,0,0.08)` | Hairline |
| `--color-menubar-bg` | `rgba(245,245,247,0.7)` | Menu bar |
| `--color-menubar-fg` | `#1D1D1F` | Menu bar text |
| `--color-dock-bg` | `rgba(255,255,255,0.55)` | Dock |
| `--color-wallpaper-from` | `#A2D2FF` | Wallpaper start |
| `--color-wallpaper-to` | `#FFC8DD` | Wallpaper end |

Traffic-light colors are identical in both themes (Apple does not invert them).

---

## Typography

- **Terminal text**: `SF Mono`, `Menlo`, `Monaco`, `Cascadia Code`, `Consolas`, `monospace`. Loaded as a system stack — no webfont required.
- **Window chrome / menu bar / dock**: `-apple-system`, `BlinkMacSystemFont`, `"SF Pro Text"`, `"Segoe UI"`, `Helvetica`, `Arial`, `sans-serif`.
- Base terminal font size: `14px` desktop, `13px` mobile. Line-height `1.55`.
- Bold sparingly — headings only.

---

## Prompt anatomy

Default (Pro):

```
➜  ~/portfolio git:(main) ✗
│  │           │         │
│  │           │         └ dirty marker (color: prompt-dirty)
│  │           └ branch (color: prompt-git)
│  └ working dir (color: prompt-path)
└ arrow (color: prompt-arrow)
```

The username/host segment (`loic@portfolio`) is rendered in `--color-term-prompt-user` and used only in the **title bar**, mirroring how zsh + powerlevel10k typically present things in macOS Terminal.

---

## Window

- Border radius: `10px`.
- Drop shadow: `0 24px 60px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.25)`.
- Title bar height: `28px`.
- Traffic lights: `12px` diameter, `8px` spacing, `12px` left padding from the window edge.
- Backdrop blur (Pro only): `backdrop-filter: blur(24px) saturate(180%)`.

---

## Dock

- Height: `64px`; icon size: `48px` at rest, scales to `64px` on hover (CSS transform).
- Magnification mimicked by `transform: scale()` on hover with `transition: transform 180ms ease-out`.
- Active app indicator: small `4px` white dot below the icon (`opacity: 0.6`).
- Border: `1px solid var(--color-dock-border)`, `12px` border radius, `16px` horizontal padding.

---

## Menu bar

- Height: `24px`, fixed top, full width.
- Backdrop blur identical to dock.
- Items: `Apple `, `Terminal` (bold), `File`, `Edit`, `View`, `Window`, `Help` (left). Right cluster: language switcher chip (`FR` / `EN`), clock `HH:MM`.

---

## Motion

- Boot animation: type-on at `20ms` per character; total boot under `1.2s`.
- Theme transitions: `200ms` on backgrounds and text colors. No transition on the prompt arrow.
- Traffic-light hover: cross-fade `120ms`.
- Avoid layout-shift animations during input — the prompt must never jump.

---

## Accessibility

- Focus ring on any focusable element: `2px solid var(--color-term-prompt-path)`, `2px offset`.
- Keyboard-first: everything reachable with Tab and Enter; the terminal input owns focus by default.
- Color contrast: every text token against its background ≥ WCAG AA (4.5:1).
- `prefers-reduced-motion`: disables the boot type-on animation and the matrix easter egg.

---

## Forbidden combinations

- **Never** use pure black `#000000` for text — use `--color-term-fg`.
- **Never** use red (`--color-term-error`) outside errors, `sudo` jokes, or the dirty-marker glyph.
- **Never** use white text on the light theme's wallpaper gradient — readability fails on the pink end.
- **Never** introduce a font outside the documented stacks.
