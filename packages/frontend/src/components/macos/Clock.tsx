// Clock.tsx
// Live HH:MM clock for the menu bar, localized.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const format = (d: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);

export const Clock = () => {
  const { i18n } = useTranslation();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums" style={{ color: 'var(--color-menubar-fg)' }}>
      {format(now, i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
    </span>
  );
};
