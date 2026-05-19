// Prompt.tsx
// Renders the zsh-style prompt line: arrow + path + git segment.

type Props = { cwd: string; branch?: string };

export const Prompt = ({ cwd, branch = 'main' }: Props) => (
  <span aria-hidden>
    <span style={{ color: 'var(--color-term-prompt-arrow)' }}>{'➜  '}</span>
    <span style={{ color: 'var(--color-term-prompt-path)' }}>{cwd}</span>{' '}
    <span style={{ color: 'var(--color-term-prompt-git)' }}>git:(</span>
    <span style={{ color: 'var(--color-term-success)' }}>{branch}</span>
    <span style={{ color: 'var(--color-term-prompt-git)' }}>) </span>
  </span>
);
