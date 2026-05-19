// TerminalPage.tsx
// Assembles the macOS desktop: wallpaper, menu bar, dock, terminal window.

import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallpaper } from '@/components/macos/Wallpaper';
import { MenuBar } from '@/components/macos/MenuBar';
import { Dock } from '@/components/macos/Dock';
import { WindowFrame } from '@/components/macos/WindowFrame';
import { Terminal } from '@/components/terminal/Terminal';
import { usePortfolio } from '@/services/portfolioStore';

export const TerminalPage = () => {
  const { t } = useTranslation();
  const state = usePortfolio();
  const bundle = state.status === 'ready' ? state.bundle : null;
  const triggerRef = useRef<((cmd: string) => void) | null>(null);

  const userHandle = useMemo(() => {
    if (!bundle?.profile?.name) return 'loic';
    return bundle.profile.name.split(' ').pop()?.toLowerCase() ?? 'loic';
  }, [bundle]);

  const title = t('terminal.title', { user: userHandle });

  const onCommand = (cmd: string) => triggerRef.current?.(cmd);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Wallpaper />
      <MenuBar />
      <div className="absolute inset-0 pt-10 pb-24 px-4 flex items-center justify-center">
        {state.status === 'error' ? (
          <div
            className="px-4 py-3 rounded-lg"
            style={{ color: 'var(--color-term-error)', background: 'rgba(0,0,0,0.4)' }}
          >
            {t('errors.load')}
          </div>
        ) : (
          <WindowFrame title={title}>
            <Terminal bundle={bundle} initialCommandRef={triggerRef} />
          </WindowFrame>
        )}
      </div>
      <Dock onCommand={onCommand} />
    </div>
  );
};
