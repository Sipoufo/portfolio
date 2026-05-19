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
  run: (ctx) => {
    const visible = Object.values(COMMANDS).filter((c) => !c.hidden);
    return [
      line(
        <span style={{ color: 'var(--color-term-success)' }}>
          {ctx.lang === 'fr' ? 'Commandes disponibles :' : 'Available commands:'}
        </span>,
      ),
      ...visible.map((c) =>
        line(
          <span>
            <span style={{ color: 'var(--color-term-prompt-path)', display: 'inline-block', minWidth: 110 }}>
              {c.name}
            </span>
            <Muted>{HELP_DESCRIPTIONS[c.name]?.[ctx.lang] ?? c.descriptionKey}</Muted>
          </span>,
        ),
      ),
      blank(),
      line(
        <Muted>
          {ctx.lang === 'fr'
            ? "Astuce : ↑/↓ pour l'historique, Tab pour l'autocomplétion."
            : 'Tip: use ↑/↓ for history and Tab for autocompletion.'}
        </Muted>,
      ),
    ];
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
  neofetch: { fr: 'Infos système (clin d’œil)', en: 'System info (wink)' },
  matrix: { fr: 'Mode matrix', en: 'Matrix mode' },
  coffee: { fr: 'Pause café', en: 'Coffee break' },
};

const about: TerminalCommand = {
  name: 'about',
  descriptionKey: 'about',
  run: aboutLines,
};

const whoami: TerminalCommand = {
  name: 'whoami',
  descriptionKey: 'whoami',
  run: (ctx) => {
    const p = ctx.bundle?.profile;
    if (!p) return [text('guest')];
    return [line(<Success>{`${p.name} — ${tr(p.title, ctx.lang)}`}</Success>)];
  },
};

const skills: TerminalCommand = { name: 'skills', descriptionKey: 'skills', run: skillsLines };
const experience: TerminalCommand = {
  name: 'experience',
  descriptionKey: 'experience',
  aliases: ['xp', 'work'],
  run: experienceLines,
};
const projects: TerminalCommand = { name: 'projects', descriptionKey: 'projects', run: projectsLines };
const education: TerminalCommand = { name: 'education', descriptionKey: 'education', run: educationLines };
const interests: TerminalCommand = { name: 'interests', descriptionKey: 'interests', run: interestsLines };
const contact: TerminalCommand = { name: 'contact', descriptionKey: 'contact', run: contactLines };

const ls: TerminalCommand = {
  name: 'ls',
  descriptionKey: 'ls',
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
  run: (ctx) => [text(ctx.cwd)],
};

const clear: TerminalCommand = {
  name: 'clear',
  descriptionKey: 'clear',
  run: () => ({ lines: [], clear: true }),
};

const lang: TerminalCommand = {
  name: 'lang',
  descriptionKey: 'lang',
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
  run: () => [text(new Date().toString())],
};

const echo: TerminalCommand = {
  name: 'echo',
  descriptionKey: 'echo',
  run: (ctx) => [text(ctx.args.join(' '))],
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
