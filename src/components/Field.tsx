import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { onSmoothScroll } from '../animations/smooth';
import { fieldStore, scrollVelocity, useField } from '../animations/store';
import { hasImage, imageSet } from '../data/images';
import { cfgOf, type Colors, type In, type Out } from '../field/config';
import { createRenderer } from '../field/renderer';

/*
  The Chapter Field — one fixed layer behind every page.
  Each section declares data-field="<chapter>"; the innermost one under the viewport centre wins.
  WebGL (one context, rendered in a worker on an OffscreenCanvas — see field/renderer.ts): two photo slots,
  double-buffered so the old chapter stays until the new texture is decoded and fully covers it;
  a sport-specific transition mask; Ken Burns; a procedural motion layer per chapter; particles that part
  around the cursor. Low-end / software GL / reduced motion: static crossfading photos.
*/

const imgOf = (k: string) => {
  const name = cfgOf(k).img;
  return name && hasImage(name) ? name : undefined;
};
const boostOf = (el: HTMLElement | null) => Number(el?.dataset.fieldBoost ?? 1);

/* ---------- Scanner: which chapter is under the viewport centre ---------- */

const boost = { value: 1 };

function useFieldScan() {
  useEffect(() => {
    // An observer on a 1%-tall band at the viewport centre: no layout reads on scroll.
    const inside = new Set<HTMLElement>();
    const seen = new WeakSet<Element>();
    const pick = () => {
      let best: HTMLElement | null = null;
      inside.forEach((el) => {
        if (!el.isConnected) { inside.delete(el); return; }
        // Later in document order = innermost, so nested sub-chapters override their parent.
        if (!best || best.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) best = el;
      });
      boost.value = boostOf(best);
      fieldStore.set((best as HTMLElement | null)?.dataset.field ?? 'none');
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? inside.add(e.target as HTMLElement) : inside.delete(e.target as HTMLElement)));
      pick();
    }, { rootMargin: '-49.5% 0px -49.5% 0px' });
    // Sections mount lazily and routes swap them out: pick up new ones (cheap: no layout).
    let timer = 0;
    const add = () => {
      timer = 0;
      document.querySelectorAll('[data-field]').forEach((el) => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
      pick();
    };
    add();
    const mo = new MutationObserver(() => { if (!timer) timer = window.setTimeout(add, 150); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); clearTimeout(timer); };
  }, []);
}

/* ---------- Renderer bridge: a worker with an OffscreenCanvas, or the main thread as a fallback ---------- */

const rgb = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim().split(/\s+/).map((v) => Number(v) / 255);
const colors = (): Colors => ({ bg: rgb('--bg'), fg: rgb('--fg'), ac: rgb('--accent'), dark: document.documentElement.dataset.theme !== 'light' });

function startField(canvas: HTMLCanvasElement, onReady: () => void, onFail: () => void) {
  const touch = matchMedia('(hover: none)').matches;
  const dims = () => {
    const dpr = Math.min(devicePixelRatio || 1, touch ? 1 : 1.5);
    return { w: Math.round(innerWidth * dpr), h: Math.round(innerHeight * dpr) };
  };
  const onOut = (o: Out) => (o.type === 'ready' ? onReady() : onFail());
  let post: (m: In) => void;
  let worker: Worker | null = null;
  try {
    if (!('transferControlToOffscreen' in canvas)) throw new Error('no OffscreenCanvas');
    const off = canvas.transferControlToOffscreen();
    worker = new Worker(new URL('../field/field.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<Out>) => onOut(e.data);
    worker.onerror = onFail;
    worker.postMessage({ type: 'init', canvas: off, ...dims(), touch, colors: colors() } satisfies In, [off]);
    post = (m) => worker!.postMessage(m);
  } catch {
    post = createRenderer(canvas, { ...dims(), touch, colors: colors() }, onOut);
  }

  // Pick the texture width for this screen once.
  const wanted = innerWidth * Math.min(devicePixelRatio || 1, 1.5);
  const urlOf = (key: string) => {
    const name = imgOf(key);
    if (!name) return undefined;
    const widths = imageSet(name as never).webp.split(', ').map((x) => Number(x.split(' ')[1].slice(0, -1)));
    return `/img/${name}-${widths.find((x) => x >= wanted * 0.75) ?? widths[widths.length - 1]}.webp`;
  };
  const sendTarget = () => { const key = fieldStore.get(); post({ type: 'target', key, url: urlOf(key), str: cfgOf(key).str * boost.value }); };
  sendTarget();
  const offTarget = fieldStore.subscribe(sendTarget);

  // Warm the textures of chapters near the viewport so a switch never waits on the network.
  const sent = new Set<string>();
  let pending = 0;
  const prefetch = () => {
    if (pending) return;
    pending = requestAnimationFrame(() => {
      pending = 0;
      document.querySelectorAll<HTMLElement>('[data-field]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const url = urlOf(el.dataset.field!);
        if (url && !sent.has(url) && r.top < innerHeight * 3 && r.bottom > -innerHeight) { sent.add(url); post({ type: 'prefetch', url }); }
      });
    });
  };
  prefetch();
  const offScroll = onSmoothScroll(prefetch);
  addEventListener('scroll', prefetch, { passive: true });

  const move = (e: PointerEvent) => post({ type: 'mouse', x: e.clientX / innerWidth, y: 1 - e.clientY / innerHeight });
  addEventListener('pointermove', move, { passive: true });
  const offVel = scrollVelocity.on('change', (v) => post({ type: 'vel', v }));
  const resize = () => post({ type: 'resize', ...dims() });
  addEventListener('resize', resize);
  const vis = () => post({ type: 'hidden', hidden: document.hidden });
  document.addEventListener('visibilitychange', vis);
  const mo = new MutationObserver(() => post({ type: 'colors', colors: colors() }));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return () => {
    post({ type: 'stop' });
    worker?.terminate();
    offTarget();
    offScroll();
    offVel();
    removeEventListener('scroll', prefetch);
    removeEventListener('pointermove', move);
    removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', vis);
    mo.disconnect();
  };
}

/* ---------- Learning: floating subject labels over the paper ---------- */

const LABELS = [
  { t: 'Русский', l: '8%', y: '18%', d: '0s' },
  { t: 'English', l: '64%', y: '12%', d: '-3s' },
  { t: 'Math ∑', l: '78%', y: '58%', d: '-6s' },
  { t: 'History', l: '14%', y: '70%', d: '-2s' },
  { t: 'Law ⚖', l: '46%', y: '82%', d: '-5s' },
];

function LearningDrift() {
  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
      {LABELS.map((x) => (
        <span key={x.t} className="serif-i absolute text-[clamp(2.5rem,6vw,6rem)] text-fg/[0.06] animate-[float_9s_ease-in-out_infinite]" style={{ left: x.l, top: x.y, animationDelay: x.d }}>
          {x.t}
        </span>
      ))}
    </motion.div>
  );
}

/* ---------- Static fallback (reduced motion, no WebGL, low-end devices) ---------- */

function StaticField({ reduce }: { reduce: boolean }) {
  const key = useField();
  const name = imgOf(key);
  return (
    <AnimatePresence initial={false}>
      {name && (
        <motion.img
          key={name}
          src={imageSet(name as never).src.replace('.jpg', '.webp')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover grayscale"
          initial={{ opacity: 0 }}
          animate={{ opacity: cfgOf(key).str * 1.4 * boost.value }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.8 }}
        />
      )}
    </AnimatePresence>
  );
}

const lowEnd = () => {
  const n = navigator as Navigator & { deviceMemory?: number };
  return (n.hardwareConcurrency ?? 8) <= 2 || (n.deviceMemory ?? 8) <= 2;
};

export default function Field() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [gl, setGl] = useState(() => !reduce && !lowEnd());
  const key = useField();
  useFieldScan();

  useEffect(() => {
    if (!gl || !canvas.current) return;
    let stop = () => {};
    let alive = true;
    // Start once the page has loaded and gone idle, so the field never competes with the first paint.
    const go = () => { if (alive && canvas.current) stop = startField(canvas.current, () => { if (canvas.current) canvas.current.style.opacity = '1'; }, () => setGl(false)); };
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 1200 }) : setTimeout(go, 200));
    if (document.readyState === 'complete') idle();
    else addEventListener('load', idle, { once: true });
    return () => { alive = false; removeEventListener('load', idle); stop(); };
  }, [gl]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {gl ? <canvas ref={canvas} className="h-full w-full opacity-0 transition-opacity duration-[1200ms]" /> : <StaticField reduce={reduce} />}
      <AnimatePresence>{gl && key === 'learning' && <LearningDrift key="learning" />}</AnimatePresence>
    </div>
  );
}
