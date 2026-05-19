// MatrixOverlay.tsx
// Falling-character overlay shown by the `matrix` easter egg. Press any key
// or click to dismiss.

import { useEffect, useRef } from 'react';

type Props = { onExit: () => void };

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナ0123456789ABCDEF';

export const MatrixOverlay = ({ onExit }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 16;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = new Array<number>(columns).fill(1);

    const onResize = () => {
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array<number>(columns).fill(1);
    };
    window.addEventListener('resize', onResize);

    let raf = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#7EE787';
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx.fillText(ch ?? '0', i * fontSize, (drops[i] ?? 0) * fontSize);
        if ((drops[i] ?? 0) * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] = (drops[i] ?? 0) + 1;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onKey = () => onExit();
    window.addEventListener('keydown', onKey, { once: true });
    window.addEventListener('click', onKey, { once: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onKey);
    };
  }, [onExit]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] cursor-pointer"
      style={{ background: '#000' }}
      aria-label="Matrix overlay (press any key to exit)"
    />
  );
};
