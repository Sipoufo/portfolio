// Terminal.tsx
// The terminal body: scrollable output buffer, prompt + input row, and the
// boot sequence that runs once on mount.

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Banner } from './Banner';
import { useTranslation } from 'react-i18next';
import type { PortfolioBundle, Lang } from '@portfolio/shared';
import { useTerminal } from '@/features/terminal/useTerminal';
import { Prompt } from './Prompt';
import { MatrixOverlay } from './MatrixOverlay';

type Props = {
  bundle: PortfolioBundle | null;
  initialCommandRef: React.MutableRefObject<((cmd: string) => void) | null>;
};

export const Terminal = ({ bundle, initialCommandRef }: Props) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language === 'en' ? 'en' : 'fr') as Lang;
  const setLang = (l: Lang) => void i18n.changeLanguage(l);

  const t = useTerminal({ bundle, lang, setLang });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [booted, setBooted] = useState(false);
  const [focused, setFocused] = useState(true);

  // Boot sequence runs once when bundle is available.
  useEffect(() => {
    if (booted || !bundle) return;
    const now = new Date();
    const stamp = now.toString().slice(0, 24);
    t.append([
      {
        id: `boot-banner-${Date.now()}`,
        kind: 'system',
        content: <Banner />,
      },
      {
        id: `boot-${Date.now()}`,
        kind: 'system',
        content: <span style={{ color: 'var(--color-term-muted)' }}>{`Last login: ${stamp} on ttys001`}</span>,
      },
      {
        id: `boot-2-${Date.now()}`,
        kind: 'system',
        content: (
          <span style={{ color: 'var(--color-term-muted)' }}>
            {lang === 'fr'
              ? "Bienvenue. Tape `help` pour voir les commandes disponibles."
              : 'Welcome. Type `help` to list available commands.'}
          </span>
        ),
      },
    ]);
    setBooted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle, booted]);

  // Wire the external "trigger command" ref used by the Dock.
  useEffect(() => {
    initialCommandRef.current = (cmd: string) => {
      t.setInput('');
      void (async () => {
        const submit = t.submit;
        t.setInput(cmd);
        // Defer one tick so React commits the input before submit.
        setTimeout(() => submit(), 0);
      })();
    };
    return () => {
      initialCommandRef.current = null;
    };
  }, [initialCommandRef, t]);

  // Always scroll to bottom on output change.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [t.output]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      t.submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      t.navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      t.navigateHistory(1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      t.autocomplete();
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      t.clear();
    }
  };

  return (
    <div
      className="term-scroll h-full overflow-y-auto px-4 py-3 leading-relaxed text-[13.5px] md:text-sm"
      style={{
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-term-fg)',
        background: 'transparent',
      }}
      onClick={() => t.inputRef.current?.focus()}
      ref={scrollRef}
    >
      {t.output.map((l) => (
        <div key={l.id} className="whitespace-pre-wrap break-words">
          {l.content}
        </div>
      ))}

      {/* Active prompt */}
      <div className="flex items-baseline gap-0 whitespace-pre relative">
        <Prompt cwd={t.cwd} />
        <span className="relative flex-1 inline-flex items-baseline">
          <input
            ref={t.inputRef}
            value={t.input}
            onChange={(e) => t.setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="term-input flex-1 bg-transparent"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-term-fg)',
              width: '100%',
            }}
            aria-label="terminal input"
          />
          <span
            aria-hidden
            className={`term-cursor ${focused ? '' : 'is-idle'}`}
            style={{
              position: 'absolute',
              left: `${t.input.length}ch`,
              top: 0,
            }}
          />
        </span>
      </div>

      {t.easterEgg === 'matrix' && <MatrixOverlay onExit={t.dismissEasterEgg} />}
    </div>
  );
};
