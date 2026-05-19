// MenuBar.tsx
// Fixed macOS-style top menu bar. Items are visual chrome; the only
// interactive controls are the language switcher and the live clock.

import { useTranslation } from 'react-i18next';
import { Apple, Battery, Wifi } from 'lucide-react';
import { Clock } from './Clock';

const Item = ({ children, bold = false }: { children: string; bold?: boolean }) => (
  <span
    className={`px-2 py-0.5 rounded-md hover:bg-white/10 cursor-default ${bold ? 'font-semibold' : ''}`}
  >
    {children}
  </span>
);

export const MenuBar = () => {
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === 'fr' ? 'en' : 'fr';
    void i18n.changeLanguage(next);
  };

  return (
    <div
      className="fixed top-0 inset-x-0 h-7 flex items-center justify-between px-3 text-xs select-none z-50"
      style={{
        background: 'var(--color-menubar-bg)',
        color: 'var(--color-menubar-fg)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--color-window-border)',
      }}
    >
      <div className="flex items-center gap-1">
        <span className="px-2 py-0.5 rounded-md hover:bg-white/10 cursor-default">
          <Apple size={14} aria-hidden />
        </span>
        <Item bold>{t('menu.app')}</Item>
        <Item>{t('menu.file')}</Item>
        <Item>{t('menu.edit')}</Item>
        <Item>{t('menu.view')}</Item>
        <Item>{t('menu.window')}</Item>
        <Item>{t('menu.help')}</Item>
      </div>

      <div className="flex items-center gap-3">
        <Battery size={14} aria-hidden />
        <Wifi size={14} aria-hidden />
        <button
          type="button"
          onClick={toggleLang}
          className="px-2 py-0.5 rounded-md hover:bg-white/10 uppercase tracking-wider"
          aria-label="Toggle language"
        >
          {i18n.language === 'fr' ? 'FR' : 'EN'}
        </button>
        <Clock />
      </div>
    </div>
  );
};
