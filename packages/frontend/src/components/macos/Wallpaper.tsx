// Wallpaper.tsx
// Animated gradient backdrop that fills the viewport behind the desktop.

export const Wallpaper = () => (
  <div
    aria-hidden
    className="absolute inset-0 -z-10"
    style={{
      background:
        'linear-gradient(135deg, var(--color-wallpaper-from), var(--color-wallpaper-to))',
      transition: 'background 300ms ease',
    }}
  />
);
