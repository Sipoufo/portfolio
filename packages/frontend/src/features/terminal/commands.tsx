// commands.tsx
// All terminal commands in one place. Each command receives a CommandContext
// and returns React-renderable output lines. New commands are added to the
// COMMANDS map below — autocomplete and `help` pick them up automatically.

import type { ReactNode } from 'react';
import type {
  Education,
  Experience,
  Interest,
  Lang,
  Profile,
  Project,
  Skill,
  SkillCategory,
} from '@portfolio/shared';
import { listEntries, resolve, root, type VFile } from './filesystem';
import { Accent, Link, Muted, Success, blank, line, text } from './render';
import type { CommandContext, CommandResult, OutputLine, TerminalCommand } from './types';

// ─── helpers ───────────────────────────────────────────────────────────────

const tr = <T,>(o: { fr: T; en: T }, lang: Lang): T => o[lang];

const formatPeriod = (start: string, end: string | null, lang: Lang): string => {
  const present = lang === 'fr' ? 'Présent' : 'Present';
  return `${start} → ${end ?? present}`;
};

const SKILL_CATEGORIES: Record<SkillCategory, { fr: string; en: string }> = {
  mobile: { fr: 'Mobile', en: 'Mobile' },
  backend: { fr: 'Backend', en: 'Backend' },
  frontend: { fr: 'Frontend', en: 'Frontend' },
  database: { fr: 'Bases de données', en: 'Databases' },
  devops: { fr: 'DevOps & Outils', en: 'DevOps & Tools' },
  management: { fr: 'Gestion de projet', en: 'Project Management' },
  language: { fr: 'Langues', en: 'Languages' },
};

const renderFileFromName = (name: string, ctx: CommandContext): OutputLine[] | null => {
  const node = resolve(ctx.cwd, name);
  if (!node || node.type !== 'file') return null;
  return renderVirtualFile(node, ctx);
};

const renderVirtualFile = (file: VFile, ctx: CommandContext): OutputLine[] => {
  switch (file.render) {
    case 'about':
      return aboutLines(ctx);
    case 'contact':
      return contactLines(ctx);
    case 'skills':
      return skillsLines(ctx);
    case 'experience':
      return experienceLines(ctx);
    case 'projects':
      return projectsLines(ctx);
    case 'education':
      return educationLines(ctx);
    case 'interests':
      return interestsLines(ctx);
    default:
      return [];
  }
};

// ─── content renderers ─────────────────────────────────────────────────────

const aboutLines = (ctx: CommandContext): OutputLine[] => {
  const p = ctx.bundle?.profile;
  if (!p) return [text('—')];
  return [
    line(<Accent>{p.name}</Accent>),
    line(<Muted>{tr(p.title, ctx.lang)}</Muted>),
    blank(),
    line(<span>{tr(p.summary, ctx.lang)}</span>),
  ];
};

const contactLines = (ctx: CommandContext): OutputLine[] => {
  const p = ctx.bundle?.profile;
  if (!p) return [text('—')];
  const out: OutputLine[] = [
    line(
      <span>
        <Muted>email</Muted>{'    '}
        <Link href={`mailto:${p.email}`}>{p.email}</Link>
      </span>,
    ),
  ];
  if (p.phone) {
    out.push(
      line(
        <span>
          <Muted>phone</Muted>{'    '}
          <Link href={`tel:${p.phone.replace(/\s+/g, '')}`}>{p.phone}</Link>
        </span>,
      ),
    );
  }
  out.push(
    line(
      <span>
        <Muted>location</Muted>{' '}
        {tr(p.location, ctx.lang)}
      </span>,
    ),
  );
  if (p.socials.github)
    out.push(line(<span><Muted>github</Muted>   <Link href={p.socials.github}>{p.socials.github}</Link></span>));
  if (p.socials.linkedin)
    out.push(line(<span><Muted>linkedin</Muted> <Link href={p.socials.linkedin}>{p.socials.linkedin}</Link></span>));
  return out;
};

const skillsLines = (ctx: CommandContext): OutputLine[] => {
  const skills = ctx.bundle?.skills ?? [];
  if (!skills.length) return [text('—')];
  const grouped = new Map<SkillCategory, Skill[]>();
  for (const s of skills) {
    const arr = grouped.get(s.category) ?? [];
    arr.push(s);
    grouped.set(s.category, arr);
  }
  const out: OutputLine[] = [];
  for (const [cat, list] of grouped) {
    out.push(line(<Accent>{tr(SKILL_CATEGORIES[cat], ctx.lang)}</Accent>));
    out.push(line(<span>  {list.map((s) => s.name).join(' · ')}</span>));
    out.push(blank());
  }
  return out;
};

const experienceLines = (ctx: CommandContext): OutputLine[] => {
  const xs = ctx.bundle?.experiences ?? [];
  if (!xs.length) return [text('—')];
  const out: OutputLine[] = [];
  for (const e of xs) {
    out.push(
      line(
        <span>
          <Accent>{e.company}</Accent> — {tr(e.role, ctx.lang)}{' '}
          <Muted>{formatPeriod(e.startDate, e.endDate, ctx.lang)}</Muted>
        </span>,
      ),
    );
    out.push(line(<Muted>{tr(e.location, ctx.lang)}</Muted>));
    for (const b of e.bullets) {
      out.push(line(<span>  • {tr(b, ctx.lang)}</span>));
    }
    if (e.tech.length)
      out.push(line(<Muted>  {ctx.lang === 'fr' ? 'Techno.' : 'Tech'} : {e.tech.join(', ')}</Muted>));
    out.push(blank());
  }
  return out;
};

const projectsLines = (ctx: CommandContext): OutputLine[] => {
  const xs = ctx.bundle?.projects ?? [];
  if (!xs.length) return [text(ctx.lang === 'fr' ? "Aucun projet n'a encore été ajouté." : 'No project added yet.')];
  const out: OutputLine[] = [];
  for (const p of xs) {
    out.push(
      line(
        <span>
          <Accent>{p.name}</Accent> — {tr(p.role, ctx.lang)}{' '}
          <Muted>{formatPeriod(p.startDate, p.endDate, ctx.lang)}</Muted>
        </span>,
      ),
    );
    out.push(line(<span>  {tr(p.description, ctx.lang)}</span>));
    if (p.tech.length) out.push(line(<Muted>  Tech : {p.tech.join(', ')}</Muted>));
    for (const lnk of p.links) {
      out.push(line(<span>  ↳ <Link href={lnk.url}>{lnk.label}</Link></span>));
    }
    out.push(blank());
  }
  return out;
};

const educationLines = (ctx: CommandContext): OutputLine[] => {
  const xs = ctx.bundle?.education ?? [];
  if (!xs.length) return [text('—')];
  return xs.flatMap((e) => [
    line(
      <span>
        <Accent>{e.school}</Accent> — {tr(e.degree, ctx.lang)}{' '}
        <Muted>{formatPeriod(e.startDate, e.endDate, ctx.lang)}</Muted>
      </span>,
    ),
    line(<Muted>  {tr(e.location, ctx.lang)}</Muted>),
    blank(),
  ]);
};

const interestsLines = (ctx: CommandContext): OutputLine[] => {
  const xs = ctx.bundle?.interests ?? [];
  if (!xs.length) return [text('—')];
  return [line(<span>{xs.map((i) => tr(i.label, ctx.lang)).join(' · ')}</span>)];
};

// ─── command implementations ───────────────────────────────────────────────

const help: TerminalCommand = {
  name: 'help',
  descriptionKey: 'List all commands',
  tip: { fr: 'Liste toutes les commandes avec un Tip pour chacune.', en: 'List every command with a Tip for each.' },
  run: (ctx) => {
    const visible = Object.values(COMMANDS).filter((c) => !c.hidden);
    const out: OutputLine[] = [
      line(
        <span style={{ color: 'var(--color-term-success)' }}>
          {ctx.lang === 'fr' ? 'Commandes disponibles :' : 'Available commands:'}
        </span>,
      ),
    ];
    for (const c of visible) {
      out.push(
        line(
          <span>
            <span style={{ color: 'var(--color-term-prompt-path)', display: 'inline-block', minWidth: 110 }}>
              {c.name}
            </span>
            <Muted>{HELP_DESCRIPTIONS[c.name]?.[ctx.lang] ?? c.descriptionKey}</Muted>
          </span>,
        ),
      );
      const tip = c.tip?.[ctx.lang];
      if (tip) {
        out.push(
          line(
            <span style={{ paddingLeft: 110, display: 'inline-block' }}>
              <span style={{ color: 'var(--color-term-prompt-git)' }}>{'  💡 Tip: '}</span>
              <Muted>{tip}</Muted>
            </span>,
          ),
        );
      }
    }
    out.push(blank());
    out.push(
      line(
        <Muted>
          {ctx.lang === 'fr'
            ? "Astuce : ↑/↓ pour l'historique, Tab pour l'autocomplétion."
            : 'Tip: use ↑/↓ for history and Tab for autocompletion.'}
        </Muted>,
      ),
    );
    return out;
  },
};

const HELP_DESCRIPTIONS: Record<string, { fr: string; en: string }> = {
  help: { fr: "Affiche l'aide", en: 'Show this help' },
  about: { fr: 'À propos', en: 'About me' },
  whoami: { fr: 'Identité courte', en: 'Short identity' },
  skills: { fr: 'Compétences techniques', en: 'Technical skills' },
  experience: { fr: 'Expériences pro', en: 'Work experience' },
  projects: { fr: 'Projets', en: 'Projects' },
  education: { fr: 'Formation', en: 'Education' },
  interests: { fr: "Centres d'intérêt", en: 'Interests' },
  contact: { fr: 'Coordonnées', en: 'Contact details' },
  ls: { fr: 'Lister les fichiers', en: 'List files' },
  cat: { fr: 'Afficher un fichier', en: 'Print a file' },
  pwd: { fr: 'Dossier courant', en: 'Current directory' },
  clear: { fr: 'Effacer l’écran', en: 'Clear the screen' },
  lang: { fr: 'Changer de langue (fr|en)', en: 'Switch language (fr|en)' },
  theme: { fr: 'Changer de thème (dark|light)', en: 'Switch theme (dark|light)' },
  download: { fr: 'Télécharger le CV', en: 'Download the CV' },
  open: { fr: 'Ouvrir un lien (github|linkedin|mail)', en: 'Open a link (github|linkedin|mail)' },
  date: { fr: 'Date et heure', en: 'Current date/time' },
  echo: { fr: 'Affiche le texte', en: 'Echo the text' },
  flip: { fr: 'Pile ou face', en: 'Flip a coin' },
  dice: { fr: 'Lancer un dé', en: 'Roll a die' },
  geo: { fr: 'Ma position géographique', en: 'My geographic position' },
  binary: { fr: 'Encoder / décoder du binaire', en: 'Encode / decode binary' },
  hash: { fr: 'Hash SHA-256 du texte', en: 'SHA-256 hash of text' },
  joke: { fr: 'Blague de dev', en: 'Random dev joke' },
  neofetch: { fr: 'Infos système (clin d’œil)', en: 'System info (wink)' },
  matrix: { fr: 'Mode matrix', en: 'Matrix mode' },
  coffee: { fr: 'Pause café', en: 'Coffee break' },
};

const about: TerminalCommand = {
  name: 'about',
  descriptionKey: 'about',
  tip: { fr: 'Affiche un résumé : qui je suis et ce que je fais.', en: 'Show a quick bio: who I am and what I do.' },
  run: aboutLines,
};

const whoami: TerminalCommand = {
  name: 'whoami',
  descriptionKey: 'whoami',
  tip: { fr: 'Identité courte (nom + titre).', en: 'Short identity line (name + title).' },
  run: (ctx) => {
    const p = ctx.bundle?.profile;
    if (!p) return [text('guest')];
    return [line(<Success>{`${p.name} — ${tr(p.title, ctx.lang)}`}</Success>)];
  },
};

const skills: TerminalCommand = {
  name: 'skills',
  descriptionKey: 'skills',
  tip: { fr: 'Liste mes compétences techniques regroupées par catégorie.', en: 'List technical skills grouped by category.' },
  run: skillsLines,
};
const experience: TerminalCommand = {
  name: 'experience',
  descriptionKey: 'experience',
  aliases: ['xp', 'work'],
  tip: { fr: 'Mes expériences pro, de la plus récente à la plus ancienne.', en: 'Work experience, most recent first.' },
  run: experienceLines,
};
const projects: TerminalCommand = {
  name: 'projects',
  descriptionKey: 'projects',
  tip: { fr: 'Projets personnels et freelance avec stack et liens.', en: 'Personal & freelance projects with stack and links.' },
  run: projectsLines,
};
const education: TerminalCommand = {
  name: 'education',
  descriptionKey: 'education',
  tip: { fr: 'Mon parcours académique.', en: 'My academic background.' },
  run: educationLines,
};
const interests: TerminalCommand = {
  name: 'interests',
  descriptionKey: 'interests',
  tip: { fr: "Centres d'intérêt et hobbies.", en: 'Hobbies and interests.' },
  run: interestsLines,
};
const contact: TerminalCommand = {
  name: 'contact',
  descriptionKey: 'contact',
  tip: { fr: 'Mes coordonnées : email, téléphone, GitHub, LinkedIn.', en: 'Contact info: email, phone, GitHub, LinkedIn.' },
  run: contactLines,
};

const ls: TerminalCommand = {
  name: 'ls',
  descriptionKey: 'ls',
  tip: { fr: 'Liste le contenu du dossier virtuel : `ls ~/projects`.', en: 'List entries in a virtual folder, e.g. `ls ~/projects`.' },
  run: (ctx) => {
    const target = ctx.args[0] ?? '~';
    const node = resolve(ctx.cwd, target);
    if (!node) {
      return [
        line(
          <span style={{ color: 'var(--color-term-error)' }}>
            ls: {target}: {ctx.lang === 'fr' ? 'aucun fichier ou dossier de ce nom' : 'No such file or directory'}
          </span>,
          'stderr',
        ),
      ];
    }
    if (node.type === 'file') return [text(target)];
    return [
      line(
        <span>
          {listEntries(node).map((e) => (
            <span key={e} style={{ color: 'var(--color-term-prompt-path)', marginRight: 18 }}>
              {e}
            </span>
          ))}
        </span>,
      ),
    ];
  },
};

const cat: TerminalCommand = {
  name: 'cat',
  descriptionKey: 'cat',
  tip: { fr: 'Affiche un fichier virtuel : `cat about.md`.', en: 'Print a virtual file, e.g. `cat about.md`.' },
  run: (ctx) => {
    if (!ctx.args[0]) {
      return [text(ctx.lang === 'fr' ? 'usage: cat <fichier>' : 'usage: cat <file>', 'stderr')];
    }
    const lines: OutputLine[] = [];
    for (const name of ctx.args) {
      const rendered = renderFileFromName(name, ctx);
      if (!rendered) {
        lines.push(
          line(
            <span style={{ color: 'var(--color-term-error)' }}>
              cat: {name}: {ctx.lang === 'fr' ? 'aucun fichier ou dossier de ce nom' : 'No such file or directory'}
            </span>,
            'stderr',
          ),
        );
        continue;
      }
      lines.push(...rendered);
    }
    return lines;
  },
};

const pwd: TerminalCommand = {
  name: 'pwd',
  descriptionKey: 'pwd',
  tip: { fr: 'Affiche le dossier virtuel courant.', en: 'Print the current virtual directory.' },
  run: (ctx) => [text(ctx.cwd)],
};

const clear: TerminalCommand = {
  name: 'clear',
  descriptionKey: 'clear',
  tip: { fr: "Efface l'écran (raccourci : Ctrl+L).", en: 'Clear the screen (shortcut: Ctrl+L).' },
  run: () => ({ lines: [], clear: true }),
};

const lang: TerminalCommand = {
  name: 'lang',
  descriptionKey: 'lang',
  tip: { fr: "Change la langue de l'interface : `lang fr` ou `lang en`.", en: 'Switch the UI language: `lang fr` or `lang en`.' },
  run: (ctx) => {
    const next = ctx.args[0]?.toLowerCase();
    if (next !== 'fr' && next !== 'en') {
      return [text('usage: lang fr|en', 'stderr')];
    }
    ctx.setLang(next);
    return [line(<Success>{`Language: ${next.toUpperCase()}`}</Success>)];
  },
};

const theme: TerminalCommand = {
  name: 'theme',
  descriptionKey: 'theme',
  tip: { fr: 'Bascule le thème : `theme dark` ou `theme light`.', en: 'Switch theme: `theme dark` or `theme light`.' },
  run: (ctx) => {
    const next = ctx.args[0]?.toLowerCase();
    if (next !== 'dark' && next !== 'light') {
      return [text('usage: theme dark|light', 'stderr')];
    }
    ctx.setTheme(next);
    return [line(<Success>{`Theme: ${next}`}</Success>)];
  },
};

const download: TerminalCommand = {
  name: 'download',
  descriptionKey: 'download',
  tip: { fr: 'Télécharge mon CV au format PDF : `download cv`.', en: 'Download my CV as PDF: `download cv`.' },
  run: (ctx) => {
    if (ctx.args[0] !== 'cv') {
      return [text('usage: download cv', 'stderr')];
    }
    const base = (import.meta.env.VITE_API_BASE_URL ?? '/api') as string;
    const url = `${base}/cv`;
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, 50);
    return [line(<Success>{ctx.lang === 'fr' ? 'Téléchargement du CV…' : 'Downloading CV…'}</Success>)];
  },
};

const open: TerminalCommand = {
  name: 'open',
  descriptionKey: 'open',
  tip: { fr: "Ouvre un lien dans un nouvel onglet : `open github|linkedin|mail`.", en: 'Open a link in a new tab: `open github|linkedin|mail`.' },
  run: (ctx) => {
    const target = ctx.args[0]?.toLowerCase();
    const p = ctx.bundle?.profile;
    if (!p || !target) return [text('usage: open github|linkedin|mail', 'stderr')];
    const map: Record<string, string | undefined> = {
      github: p.socials.github,
      linkedin: p.socials.linkedin,
      mail: `mailto:${p.email}`,
    };
    const url = map[target];
    if (!url) return [text(`open: unknown target '${target}'`, 'stderr')];
    window.open(url, '_blank');
    return [line(<Success>{ctx.lang === 'fr' ? `Ouverture de ${target}…` : `Opening ${target}…`}</Success>)];
  },
};

const dateCmd: TerminalCommand = {
  name: 'date',
  descriptionKey: 'date',
  aliases: ['datetime', 'now', 'time'],
  tip: { fr: 'Affiche la date et heure locale + UTC + fuseau.', en: 'Print local date/time, UTC time and your timezone.' },
  run: (ctx) => {
    const now = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = ctx.lang === 'fr' ? 'fr-FR' : 'en-US';
    const local = now.toLocaleString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return [
      line(<span><Muted>{ctx.lang === 'fr' ? 'Local : ' : 'Local: '}</Muted><Success>{local}</Success></span>),
      line(<span><Muted>{'UTC :   '}</Muted>{now.toUTCString()}</span>),
      line(<span><Muted>{ctx.lang === 'fr' ? 'Fuseau :' : 'Zone:  '}</Muted>{' '}{tz}</span>),
    ];
  },
};

const echo: TerminalCommand = {
  name: 'echo',
  descriptionKey: 'echo',
  tip: { fr: 'Répète le texte saisi : `echo hello world`.', en: 'Echo the given text: `echo hello world`.' },
  run: (ctx) => [text(ctx.args.join(' '))],
};

const flip: TerminalCommand = {
  name: 'flip',
  descriptionKey: 'flip',
  aliases: ['coin', 'coinflip', 'pileface'],
  tip: { fr: 'Lance une pièce à pile ou face. 50/50, promis 🎲.', en: 'Toss a coin — heads or tails. 50/50, promise 🎲.' },
  run: (ctx) => {
    const heads = Math.random() < 0.5;
    const fr = heads ? 'Face' : 'Pile';
    const en = heads ? 'Heads' : 'Tails';
    const label = ctx.lang === 'fr' ? fr : en;
    const emoji = heads ? '🪙' : '⚪';
    return [
      line(<span>{ctx.lang === 'fr' ? 'La pièce tourne…' : 'Flipping the coin…'}</span>),
      line(<Success>{`${emoji}  ${label}!`}</Success>),
    ];
  },
};

const dice: TerminalCommand = {
  name: 'dice',
  descriptionKey: 'dice',
  aliases: ['roll'],
  tip: { fr: 'Lance un dé. Syntaxe : `dice` ou `dice 20` (faces).', en: 'Roll a die. Usage: `dice` or `dice 20` (sides).' },
  run: (ctx) => {
    const sides = Math.max(2, Math.min(1000, Number(ctx.args[0] ?? 6) | 0 || 6));
    const value = 1 + Math.floor(Math.random() * sides);
    return [line(<Success>{`🎲 d${sides} → ${value}`}</Success>)];
  },
};

const GEO_TIMEOUT_MS = 10_000;

const geo: TerminalCommand = {
  name: 'geo',
  descriptionKey: 'geo',
  aliases: ['whereami', 'location'],
  tip: {
    fr: 'Affiche ta position géographique actuelle (autorisation requise).',
    en: 'Show your current geographic position (browser permission required).',
  },
  run: (ctx) =>
    new Promise<CommandResult>((resolveFn) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        resolveFn([
          line(
            <span style={{ color: 'var(--color-term-error)' }}>
              {ctx.lang === 'fr'
                ? 'geo: géolocalisation non disponible dans ce navigateur.'
                : 'geo: geolocation is not available in this browser.'}
            </span>,
            'stderr',
          ),
        ]);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`;
          resolveFn([
            line(<span><Muted>{ctx.lang === 'fr' ? 'Latitude  :' : 'Latitude:  '}</Muted> <Success>{latitude.toFixed(5)}</Success></span>),
            line(<span><Muted>{ctx.lang === 'fr' ? 'Longitude :' : 'Longitude: '}</Muted> <Success>{longitude.toFixed(5)}</Success></span>),
            line(<span><Muted>{ctx.lang === 'fr' ? 'Précision :' : 'Accuracy:  '}</Muted> ~{Math.round(accuracy)} m</span>),
            line(<span>{ctx.lang === 'fr' ? 'Voir sur la carte : ' : 'Open in map: '}<Link href={mapUrl}>OpenStreetMap</Link></span>),
          ]);
        },
        (err) => {
          resolveFn([
            line(
              <span style={{ color: 'var(--color-term-error)' }}>
                geo: {err.message || (ctx.lang === 'fr' ? 'autorisation refusée' : 'permission denied')}
              </span>,
              'stderr',
            ),
          ]);
        },
        { enableHighAccuracy: true, timeout: GEO_TIMEOUT_MS, maximumAge: 60_000 },
      );
    }),
};

const toBinary = (s: string): string =>
  Array.from(new TextEncoder().encode(s))
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');

const fromBinary = (s: string): string => {
  const bits = s.replace(/[^01]/g, '');
  if (bits.length === 0 || bits.length % 8 !== 0) {
    throw new Error('binary: input length must be a multiple of 8 bits');
  }
  const bytes = new Uint8Array(bits.length / 8);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return new TextDecoder().decode(bytes);
};

const binary: TerminalCommand = {
  name: 'binary',
  descriptionKey: 'binary',
  aliases: ['bin'],
  tip: {
    fr: 'Encode/décode du binaire. `binary encode hello` · `binary decode 01101000 ...`',
    en: 'Encode/decode binary. `binary encode hello` · `binary decode 01101000 ...`',
  },
  run: (ctx) => {
    const mode = ctx.args[0]?.toLowerCase();
    const rest = ctx.args.slice(1).join(' ');
    if (mode !== 'encode' && mode !== 'decode') {
      return [text('usage: binary encode <text>  |  binary decode <bits>', 'stderr')];
    }
    if (!rest) {
      return [text(ctx.lang === 'fr' ? 'binary: entrée vide' : 'binary: empty input', 'stderr')];
    }
    try {
      const out = mode === 'encode' ? toBinary(rest) : fromBinary(rest);
      return [
        line(<Muted>{mode === 'encode' ? (ctx.lang === 'fr' ? 'Encodé →' : 'Encoded →') : (ctx.lang === 'fr' ? 'Décodé →' : 'Decoded →')}</Muted>),
        line(<Success>{out}</Success>),
      ];
    } catch (e) {
      return [text(`binary: ${(e as Error).message}`, 'stderr')];
    }
  },
};

const hash: TerminalCommand = {
  name: 'hash',
  descriptionKey: 'hash',
  tip: {
    fr: 'Calcule un hash SHA-256 du texte : `hash hello`.',
    en: 'Compute a SHA-256 hash of the text: `hash hello`.',
  },
  run: async (ctx) => {
    const input = ctx.args.join(' ');
    if (!input) return [text('usage: hash <text>', 'stderr')];
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    const hex = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return [
      line(<Muted>SHA-256 →</Muted>),
      line(<Success>{hex}</Success>),
    ];
  },
};

const JOKES: { fr: string; en: string }[] = [
  {
    fr: "Pourquoi les développeurs détestent la nature ? Trop de bugs.",
    en: 'Why do programmers hate nature? It has too many bugs.',
  },
  {
    fr: 'Il y a 10 sortes de gens : ceux qui comprennent le binaire et les autres.',
    en: 'There are 10 kinds of people: those who understand binary and those who don\'t.',
  },
  {
    fr: 'Un dev passe par un bar. Puis 0 bars. Puis 2. Puis 0. Puis 1...',
    en: 'A SQL query walks into a bar, sees two tables, and asks: "May I join you?"',
  },
  {
    fr: "Pourquoi le JavaScript est-il triste ? Parce qu'il ne sait pas se gérer (undefined feelings).",
    en: 'Why is JavaScript sad? Because it has undefined feelings.',
  },
];

const joke: TerminalCommand = {
  name: 'joke',
  descriptionKey: 'joke',
  tip: { fr: 'Affiche une blague de dev au hasard 😄.', en: 'Tell a random dev joke 😄.' },
  run: (ctx) => {
    const j = JOKES[Math.floor(Math.random() * JOKES.length)] ?? JOKES[0]!;
    return [line(<Accent>{j[ctx.lang]}</Accent>)];
  },
};

const sudo: TerminalCommand = {
  name: 'sudo',
  descriptionKey: 'sudo',
  hidden: true,
  run: (ctx) => [
    line(
      <span style={{ color: 'var(--color-term-error)' }}>
        {ctx.lang === 'fr'
          ? `Désolé, ${ctx.bundle?.profile?.name ?? 'utilisateur'} ne peut pas exécuter cette commande. Cet incident sera signalé.`
          : `Sorry, ${ctx.bundle?.profile?.name ?? 'user'} is not in the sudoers file. This incident will be reported.`}
      </span>,
      'stderr',
    ),
  ],
};

const neofetch: TerminalCommand = {
  name: 'neofetch',
  descriptionKey: 'neofetch',
  hidden: true,
  run: (ctx) => {
    const p = ctx.bundle?.profile;
    const logo = [
      '       .:\'',
      '    __ :\'__',
      ' .\'`__`-\'__``.',
      ":__________.-\'",
      ":_________:",
      ' :_________`-;',
      '  `.__.-.__.\'',
    ];
    const info = [
      `${p?.name ?? 'guest'}@portfolio`,
      '-------------------',
      `OS: macOS (Terminal.app skin)`,
      `Shell: -zsh 5.9`,
      `Title: ${p ? tr(p.title, ctx.lang) : ''}`,
      `Location: ${p ? tr(p.location, ctx.lang) : ''}`,
      `Email: ${p?.email ?? ''}`,
    ];
    const rows: OutputLine[] = [];
    const len = Math.max(logo.length, info.length);
    for (let i = 0; i < len; i++) {
      rows.push(
        line(
          <span>
            <span style={{ color: 'var(--color-term-accent)', display: 'inline-block', width: 220, whiteSpace: 'pre' }}>
              {logo[i] ?? ' '}
            </span>
            <span>{info[i] ?? ''}</span>
          </span>,
        ),
      );
    }
    return rows;
  },
};

const matrix: TerminalCommand = {
  name: 'matrix',
  descriptionKey: 'matrix',
  hidden: true,
  run: (ctx) => {
    ctx.triggerEasterEgg('matrix');
    return [text(ctx.lang === 'fr' ? 'Wake up, Neo… (Échap pour sortir)' : 'Wake up, Neo… (Esc to exit)')];
  },
};

const coffee: TerminalCommand = {
  name: 'coffee',
  descriptionKey: 'coffee',
  hidden: true,
  run: () => [
    line(
      <pre style={{ color: 'var(--color-term-accent)', margin: 0 }}>{`
        (
          )     (
   ___...(-------)-....___
.-""       )    (          ""-.
.-'\`'.-...-'\`\`...-\`...-\`'\`'-.
:                              :
'._                          _.'
   \`\`\`\`--..________..--\`\`\`\`
      `}</pre>,
    ),
  ],
};

const vim: TerminalCommand = {
  name: 'vim',
  descriptionKey: 'vim',
  hidden: true,
  run: (ctx) => [
    text(ctx.lang === 'fr' ? '^C — pour quitter Vim, redémarre la machine 🙂' : '^C — to exit Vim, just reboot 🙂'),
  ],
};

const rm: TerminalCommand = {
  name: 'rm',
  descriptionKey: 'rm',
  hidden: true,
  run: (ctx) => [
    line(
      <span style={{ color: 'var(--color-term-error)' }}>
        {ctx.lang === 'fr' ? 'Bien essayé. Je refuse.' : 'Nice try. Refusing.'}
      </span>,
      'stderr',
    ),
  ],
};

// ─── registry ──────────────────────────────────────────────────────────────

export const COMMANDS: Record<string, TerminalCommand> = Object.fromEntries(
  [
    help,
    about,
    whoami,
    skills,
    experience,
    projects,
    education,
    interests,
    contact,
    ls,
    cat,
    pwd,
    clear,
    lang,
    theme,
    download,
    open,
    dateCmd,
    echo,
    flip,
    dice,
    geo,
    binary,
    hash,
    joke,
    sudo,
    neofetch,
    matrix,
    coffee,
    vim,
    rm,
  ].map((c) => [c.name, c]),
);

export const resolveCommand = (name: string): TerminalCommand | undefined => {
  const direct = COMMANDS[name];
  if (direct) return direct;
  for (const c of Object.values(COMMANDS)) {
    if (c.aliases?.includes(name)) return c;
  }
  return undefined;
};

export const commandNames = (): string[] =>
  Object.values(COMMANDS)
    .filter((c) => !c.hidden)
    .map((c) => c.name)
    .sort();

export type {
  // re-export for convenience
  CommandContext,
  CommandResult,
  Profile,
  Experience,
  Project,
  Skill,
  Education,
  Interest,
  ReactNode,
};
