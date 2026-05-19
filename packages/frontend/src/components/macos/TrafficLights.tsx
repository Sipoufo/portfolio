// TrafficLights.tsx
// The three macOS window buttons. Close is wired to a no-op (the terminal
// is the whole app); the others are decorative for now.

const Dot = ({ color, idle }: { color: string; idle: boolean }) => (
  <span
    className="inline-block w-3 h-3 rounded-full"
    style={{
      background: idle ? 'var(--color-traffic-idle)' : color,
      boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.25)',
      transition: 'background 120ms ease',
    }}
  />
);

export const TrafficLights = ({ focused = true }: { focused?: boolean }) => (
  <div className="flex items-center gap-2" aria-hidden>
    <Dot color="var(--color-traffic-close)" idle={!focused} />
    <Dot color="var(--color-traffic-min)" idle={!focused} />
    <Dot color="var(--color-traffic-zoom)" idle={!focused} />
  </div>
);
