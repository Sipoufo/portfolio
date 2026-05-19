// theme.ts
// Theme is a document-level attribute. Persisted under `portfolio:theme`.

export type Theme = 'dark' | 'light';

const KEY = 'portfolio:theme';

export const getStoredTheme = (): Theme => {
  const v = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
  return v === 'light' ? 'light' : 'dark';
};

export const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(KEY, theme);
};
