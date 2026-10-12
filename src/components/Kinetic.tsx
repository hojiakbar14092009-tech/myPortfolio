import { AnimatePresence, animate, motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EXPO, QUART } from '../animations/ease';
import { scrollDirection, scrollVelocity } from '../animations/store';
import { useMagnetic } from '../animations/useMagnetic';

/** Title that rolls letter-by-letter to a duplicate on hover of its `group` parent. */
export function TextRoll({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block overflow-hidden align-bottom ${className}`}>
      <span className="sr-only">{text}</span>
      {[0, 1].map((row) => (
        <span key={row} aria-hidden className={`flex ${row ? 'absolute inset-0' : ''}`}>
          {[...text].map((c, i) => (
            <span
              key={i}
              className={`inline-block transition-transform duration-500 ease-expo motion-reduce:transition-none ${
                row ? 'translate-y-full group-hover:translate-y-0' : 'group-hover:-translate-y-full'
              }`}
              style={{ transitionDelay: `${i * 18}ms` }}
            >
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/';

/** Decode effect for small mono labels: runs once in view, or whenever `play`/text changes. */
export function Scramble({ text, play, className }: { text: string; play?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const [out, setOut] = useState(text);
  const go = play ?? inView;
  useEffect(() => {
    if (!go || reduce) { setOut(text); return; }
    let f = 0;
    const total = 16;
    const id = setInterval(() => {
      f++;
      setOut([...text].map((c, i) => (c === ' ' || i < (f / total) * text.length ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(''));
      if (f >= total) { clearInterval(id); setOut(text); }
    }, 32);
    return () => clearInterval(id);
  }, [text, go, reduce]);
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{out}</span>
    </span>
  );
}

/** A key word that swaps from the display face into serif italic as it enters (and back on hover). */
export function SwapWord({ word, className = '' }: { word: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -4% 0px' });
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const serif = reduce ? true : inView !== hover;
  return (
    <span ref={ref} className={`relative inline-grid overflow-hidden align-bottom ${className}`} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <span className="sr-only">{word}</span>
      <motion.span aria-hidden className="col-start-1 row-start-1" animate={{ y: serif ? '-140%' : '0%' }} transition={{ duration: 0.8, ease: QUART, delay: inView && !hover ? 0.5 : 0 }}>
        {word}
      </motion.span>
      <motion.span aria-hidden className="serif-i col-start-1 row-start-1" initial={false} animate={{ y: serif ? '0%' : '140%' }} transition={{ duration: 0.8, ease: QUART, delay: inView && !hover ? 0.5 : 0 }}>
        {word}
      </motion.span>
    </span>
  );
}

export function Counter({ to, prefix = '', suffix = '', className }: { to: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration: 1.8, ease: EXPO, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduce, to]);
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{`${prefix}${to}${suffix}`}</span>
      <span aria-hidden className="tabular-nums">{`${prefix}${n}${suffix}`}</span>
    </span>
  );
}

/** Infinite marquee that speeds up with scroll velocity and reverses with scroll direction. */
export function Marquee({ items, className = '', reverse = false, base = 60 }: { items: string[]; className?: string; reverse?: boolean; base?: number }) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap);
  const x = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    if (reduce || !inView || !track.current) return;
    const w = track.current.scrollWidth / 2;
    const dir = scrollDirection.get() * (reverse ? -1 : 1);
    const speed = (base + Math.min(Math.abs(scrollVelocity.get()) * 30, 900)) * dir;
    const next = x.get() - (speed * Math.min(delta, 50)) / 1000;
    x.set((((next % w) + w) % w) - w);
  });
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((s) => (
        <li key={s} className="flex items-center whitespace-nowrap">
          <span className="px-[0.5em]">{s}</span>
          <span aria-hidden className="text-accent">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div ref={wrap} className={`flex overflow-hidden ${className}`}>
      <motion.div ref={track} className="flex shrink-0 will-change-transform" style={{ x }}>
        {row(false)}
        {row(true)}
      </motion.div>
    </div>
  );
}

type MagProps = { children: ReactNode; href?: string; onClick?: () => void; className?: string; external?: boolean; label?: string; cursor?: string };

/** Magnetic button with elastic return and an ink fill that grows from the click point. */
export function MagneticButton({ children, href, onClick, className = '', external, label, cursor }: MagProps) {
  const { ref, x, y } = useMagnetic<HTMLDivElement>(0.45, true);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const fill = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((s) => [...s, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((s) => s.filter((p) => p.id !== id)), 900);
  };
  const inner = `group relative inline-flex items-center justify-center overflow-hidden rounded-full ${className}`;
  const content = (
    <>
      {ripples.map((p) => (
        <motion.span key={p.id} aria-hidden className="absolute h-10 w-10 rounded-full bg-accent" style={{ left: p.x - 20, top: p.y - 20 }} initial={{ scale: 0, opacity: 0.9 }} animate={{ scale: 14, opacity: 0 }} transition={{ duration: 0.9, ease: EXPO }} />
      ))}
      <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-accent transition-transform duration-500 ease-expo group-hover:scale-y-100" />
      <span className="relative">{children}</span>
    </>
  );
  return (
    <motion.div ref={ref} style={{ x, y }} className="inline-block">
      {href ? (
        <a href={href} aria-label={label} data-cursor={cursor} className={inner} onPointerDown={fill} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
          {content}
        </a>
      ) : (
        <button type="button" aria-label={label} data-cursor={cursor} onClick={onClick} onPointerDown={fill} className={inner}>
          {content}
        </button>
      )}
    </motion.div>
  );
}

/** Each digit flips on change, like a split-flap clock. */
export function FlipText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`inline-flex tabular-nums [perspective:400px] ${className}`}>
      <span className="sr-only">{text}</span>
      {[...text].map((c, i) => (
        <span key={i} aria-hidden className="relative inline-block overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={c}
              className="inline-block origin-bottom"
              initial={{ rotateX: -90, y: '-40%', opacity: 0 }}
              animate={{ rotateX: 0, y: '0%', opacity: 1 }}
              exit={{ rotateX: 90, y: '40%', opacity: 0 }}
              transition={{ duration: 0.45, ease: EXPO }}
            >
              {c}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
