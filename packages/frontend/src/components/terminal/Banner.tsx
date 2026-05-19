// Banner.tsx
// First-line splash shown on terminal boot: logo image + "GreenShy" ASCII
// art + welcome line.

const ASCII = String.raw`
   ____                       ____  _
  / ___|_ __ ___  ___ _ __   / ___|| |__   _   _
 | |  _| '__/ _ \/ _ \ '_ \  \___ \| '_ \ | | | |
 | |_| | | |  __/  __/ | | |  ___) | | | || |_| |
  \____|_|  \___|\___|_| |_| |____/|_| |_| \__, |
                                            |___/`;

export const Banner = () => (
  <div className="select-none">
    <div className="flex items-center gap-4">
      <img
        src="/logo.png"
        alt="GreenShy"
        className="shrink-0"
        style={{ height: 88, width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
      />
      <pre
        style={{
          margin: 0,
          color: 'var(--color-term-success)',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.05,
          fontSize: '12px',
          textShadow: '0 0 8px rgba(126,231,135,0.35)',
        }}
      >
        {ASCII}
      </pre>
    </div>
    <div
      style={{
        marginTop: 6,
        color: 'var(--color-term-accent)',
        fontStyle: 'italic',
      }}
    >
      Welcome to Green Sky portfolio, enjoy it and be curious.
    </div>
  </div>
);
