// Dock.tsx
// Bottom macOS-style dock. Icons trigger terminal-equivalent actions or
// open external links in a new tab.

import { useTranslation } from 'react-i18next';
import { Terminal as TerminalIcon, Folder, Mail, Github, Linkedin, FileText } from 'lucide-react';
import type { ComponentType } from 'react';
import { api } from '@/services/api';
import { usePortfolio } from '@/services/portfolioStore';

type DockItem = {
  key: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  active?: boolean;
  onClick: () => void;
};

export const Dock = ({ onCommand }: { onCommand: (cmd: string) => void }) => {
  const { t } = useTranslation();
  const state = usePortfolio();
  const profile = state.status === 'ready' ? state.bundle.profile : null;

  const items: DockItem[] = [
    { key: 'terminal', label: t('dock.terminal'), icon: TerminalIcon, active: true, onClick: () => onCommand('help') },
    { key: 'finder', label: t('dock.finder'), icon: Folder, onClick: () => onCommand('ls') },
    { key: 'mail', label: t('dock.mail'), icon: Mail, onClick: () => onCommand('contact') },
    {
      key: 'github',
      label: t('dock.github'),
      icon: Github,
      onClick: () => profile?.socials.github && window.open(profile.socials.github, '_blank'),
    },
    {
      key: 'linkedin',
      label: t('dock.linkedin'),
      icon: Linkedin,
      onClick: () => profile?.socials.linkedin && window.open(profile.socials.linkedin, '_blank'),
    },
    { key: 'cv', label: t('dock.cv'), icon: FileText, onClick: () => window.open(api.cvUrl(), '_blank') },
  ];

  return (
    <div className="fixed bottom-3 inset-x-0 flex justify-center z-40 pointer-events-none">
      <div
        className="pointer-events-auto flex items-end gap-2 px-3 py-2 rounded-2xl"
        style={{
          background: 'var(--color-dock-bg)',
          border: '1px solid var(--color-dock-border)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        }}
      >
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={it.onClick}
            title={it.label}
            aria-label={it.label}
            className="group relative flex flex-col items-center justify-end transition-transform duration-150 ease-out hover:-translate-y-1 hover:scale-110"
          >
            <span
              className="w-12 h-12 rounded-xl grid place-items-center"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--color-menubar-fg)',
              }}
            >
              <it.icon size={26} />
            </span>
            {it.active && (
              <span
                aria-hidden
                className="mt-1 h-1 w-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.7)' }}
              />
            )}
            <span
              className="pointer-events-none absolute -top-7 px-2 py-0.5 text-[11px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'rgba(0,0,0,0.65)',
                color: '#fff',
                whiteSpace: 'nowrap',
              }}
            >
              {it.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
