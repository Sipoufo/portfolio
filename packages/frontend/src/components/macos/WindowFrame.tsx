// WindowFrame.tsx
// macOS-style window: titlebar with traffic lights and dynamic title,
// rounded corners and big drop shadow.

import type { ReactNode } from 'react';
import { TrafficLights } from './TrafficLights';

type Props = {
  title: string;
  children: ReactNode;
};

export const WindowFrame = ({ title, children }: Props) => (
  <div
    className="w-full max-w-[1100px] h-[78vh] min-h-[480px] mx-auto rounded-xl overflow-hidden flex flex-col"
    style={{
      background: 'var(--color-term-bg-translucent)',
      border: '1px solid var(--color-window-border)',
      boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.25)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    }}
  >
    <div
      className="h-7 flex items-center px-3 select-none"
      style={{
        background: 'var(--color-window-titlebar)',
        color: 'var(--color-window-titlebar-fg)',
        borderBottom: '1px solid var(--color-window-border)',
      }}
    >
      <TrafficLights />
      <div className="flex-1 text-center text-xs font-medium tracking-tight truncate px-4">
        {title}
      </div>
      <div className="w-12" aria-hidden />
    </div>
    <div className="flex-1 min-h-0">{children}</div>
  </div>
);
