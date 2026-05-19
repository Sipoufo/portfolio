// types.ts
// Shared types for the terminal feature.

import type { ReactNode } from 'react';
import type { PortfolioBundle } from '@portfolio/shared';

export type OutputKind = 'stdout' | 'stderr' | 'system';

export type OutputLine = {
  id: string;
  kind: OutputKind;
  content: ReactNode;
};

export type CommandContext = {
  args: string[];
  raw: string;
  bundle: PortfolioBundle | null;
  lang: 'fr' | 'en';
  cwd: string;
  setCwd: (next: string) => void;
  setLang: (next: 'fr' | 'en') => void;
  setTheme: (next: 'dark' | 'light') => void;
  triggerEasterEgg: (id: 'matrix') => void;
};

export type CommandResult = OutputLine[] | { lines: OutputLine[]; clear?: boolean };

export type TerminalCommand = {
  name: string;
  /** Short, one-line description (i18n key path). */
  descriptionKey: string;
  /** Localized tip describing what the command does and how to use it. */
  tip?: { fr: string; en: string };
  /** Hidden from `help` if true (used for easter eggs and aliases). */
  hidden?: boolean;
  /** Aliases that resolve to this command. */
  aliases?: string[];
  /** Execute the command. */
  run: (ctx: CommandContext) => CommandResult | Promise<CommandResult>;
};
