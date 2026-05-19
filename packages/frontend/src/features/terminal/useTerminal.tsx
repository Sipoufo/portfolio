// useTerminal.tsx
// Owns terminal state: input, history, output buffer, autocomplete.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Lang, PortfolioBundle } from '@portfolio/shared';
import { applyTheme, getStoredTheme, type Theme } from '@/services/theme';
import { commandNames, resolveCommand } from './commands';
import { parse } from './parser';
import { line } from './render';
import { listEntries, root } from './filesystem';
import type { OutputLine } from './types';

const HISTORY_KEY = 'portfolio:history';
const MAX_HISTORY = 200;

type EasterEgg = 'matrix' | null;

const loadHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const saveHistory = (h: string[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-MAX_HISTORY)));
  } catch {
    // ignore quota
  }
};

type UseTerminalArgs = {
  bundle: PortfolioBundle | null;
  lang: Lang;
  setLang: (l: Lang) => void;
};

export const useTerminal = ({ bundle, lang, setLang }: UseTerminalArgs) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const [cwd, setCwd] = useState('~/portfolio');
  const [easterEgg, setEasterEgg] = useState<EasterEgg>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
  }, []);

  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  const append = useCallback((lines: OutputLine[]) => {
    setOutput((prev) => [...prev, ...lines]);
  }, []);

  const exec = useCallback(
    async (raw: string) => {
      const parsed = parse(raw);
      if (!parsed) return;

      const promptEcho = line(
        <span>
          <span style={{ color: 'var(--color-term-prompt-arrow)' }}>{'➜  '}</span>
          <span style={{ color: 'var(--color-term-prompt-path)' }}>{cwd}</span>{' '}
          <span style={{ color: 'var(--color-term-prompt-git)' }}>git:(</span>
          <span style={{ color: 'var(--color-term-success)' }}>main</span>
          <span style={{ color: 'var(--color-term-prompt-git)' }}>)</span> {raw}
        </span>,
        'system',
      );
      append([promptEcho]);

      const cmd = resolveCommand(parsed.cmd);
      if (!cmd) {
        append([
          line(
            <span style={{ color: 'var(--color-term-error)' }}>
              zsh: command not found: {parsed.cmd}
            </span>,
            'stderr',
          ),
        ]);
        return;
      }

      const ctx = {
        args: parsed.args,
        raw: parsed.raw,
        bundle,
        lang,
        cwd,
        setCwd,
        setLang,
        setTheme,
        triggerEasterEgg: (id: 'matrix') => setEasterEgg(id),
      };

      const result = await cmd.run(ctx);
      if (Array.isArray(result)) {
        append(result);
      } else {
        if (result.clear) setOutput([]);
        if (result.lines.length) append(result.lines);
      }
    },
    [append, bundle, cwd, lang, setLang, setTheme],
  );

  const submit = useCallback(() => {
    const value = input;
    if (value.trim()) {
      const next = [...history, value].slice(-MAX_HISTORY);
      setHistory(next);
      saveHistory(next);
    }
    setHistoryCursor(null);
    setInput('');
    void exec(value);
  }, [exec, history, input]);

  const navigateHistory = useCallback(
    (dir: -1 | 1) => {
      if (!history.length) return;
      setHistoryCursor((c) => {
        const cur = c ?? history.length;
        const next = Math.max(0, Math.min(history.length, cur + dir));
        setInput(next === history.length ? '' : (history[next] ?? ''));
        return next;
      });
    },
    [history],
  );

  const completions = useMemo(() => commandNames(), []);

  const autocomplete = useCallback(() => {
    const value = input;
    if (!value) return;
    const parts = value.split(/\s+/);
    if (parts.length === 1) {
      const prefix = parts[0]!;
      const matches = completions.filter((n) => n.startsWith(prefix));
      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        append([line(<span>{matches.join('   ')}</span>, 'system')]);
      }
      return;
    }
    // For `cat` and `ls`, complete on virtual filesystem entries.
    const cmd = parts[0]!.toLowerCase();
    if (cmd !== 'cat' && cmd !== 'ls') return;
    const prefix = parts[parts.length - 1] ?? '';
    const entries = listEntries(root);
    const matches = entries.filter((e) => e.startsWith(prefix));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0]!;
      setInput(parts.join(' '));
    } else if (matches.length > 1) {
      append([line(<span>{matches.join('   ')}</span>, 'system')]);
    }
  }, [append, completions, input]);

  const dismissEasterEgg = useCallback(() => setEasterEgg(null), []);

  return {
    input,
    setInput,
    output,
    submit,
    history,
    navigateHistory,
    autocomplete,
    inputRef,
    cwd,
    easterEgg,
    dismissEasterEgg,
    append,
    clear: () => setOutput([]),
  };
};

export type { OutputLine };
