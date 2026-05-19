// render.tsx
// Small helpers to produce styled output lines.

import type { ReactNode } from 'react';
import type { OutputKind, OutputLine } from './types';

let counter = 0;
const nextId = () => `o-${Date.now()}-${counter++}`;

export const line = (content: ReactNode, kind: OutputKind = 'stdout'): OutputLine => ({
  id: nextId(),
  kind,
  content,
});

export const text = (s: string, kind: OutputKind = 'stdout'): OutputLine => line(<span>{s}</span>, kind);

export const blank = (): OutputLine => line(<span> </span>);

export const Accent = ({ children }: { children: ReactNode }) => (
  <span style={{ color: 'var(--color-term-accent)' }}>{children}</span>
);

export const Muted = ({ children }: { children: ReactNode }) => (
  <span style={{ color: 'var(--color-term-muted)' }}>{children}</span>
);

export const Success = ({ children }: { children: ReactNode }) => (
  <span style={{ color: 'var(--color-term-success)' }}>{children}</span>
);

export const Link = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer noopener"
    style={{ color: 'var(--color-term-link)', textDecoration: 'underline' }}
  >
    {children}
  </a>
);
