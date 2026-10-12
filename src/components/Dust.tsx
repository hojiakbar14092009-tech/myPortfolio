import { useEffect, useRef } from 'react';

/*
  Monochrome particle dust that drifts and parts around the cursor. Desktop + fine pointer only,
  ~30fps, paused when the tab is hidden. Loaded lazily after first paint.
*/
export default function Dust() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext('2d')!;
    const dpr = Math.min(devicePixelRatio, 1.5);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = innerWidth;
      h = innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const N = 90;
    const ps = Array.from({ length: N }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: 0.5 + Math.random() * 1.3, s: Math.random() * 1000 }));
    const mouse = { x: -999, y: -999 };
    const move = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    let rgb = '244,242,238';
    const readColor = () => { rgb = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim().split(/\s+/).join(','); };
    readColor();
    const mo = new MutationObserver(readColor);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let id = 0;
    let last = 0;
    const loop = (t: number) => {
      id = requestAnimationFrame(loop);
      if (t - last < 33) return;
      last = t;
      g.clearRect(0, 0, w, h);
      g.fillStyle = `rgba(${rgb},0.28)`;
      for (const p of ps) {
        // slow curl-ish drift
        const a = Math.sin((p.y + t * 0.02 + p.s) * 0.004) + Math.cos((p.x - t * 0.015) * 0.003);
        p.vx += Math.cos(a) * 0.012;
        p.vy += Math.sin(a) * 0.012 - 0.004;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140) {
          const f = (1 - Math.sqrt(d2) / 140) * 0.6;
          p.vx += (dx / 140) * f;
          p.vy += (dy / 140) * f;
        }
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;
        g.beginPath();
        g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        g.fill();
      }
    };
    id = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      mo.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
