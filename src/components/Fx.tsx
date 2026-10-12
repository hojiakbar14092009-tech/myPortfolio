import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EXPO, QUART, finePointer } from '../animations/ease';
import { thump, tick } from '../animations/sound';
import { sectionStore } from '../animations/store';
import { Scramble } from './Kinetic';
import { HSHLogo } from './logo/HSHLogo';
import { COMPACT } from './logo/logoPaths';

/* ---------- Cursor 2.0: inertia ring, magnetic snap, contextual labels, image previews ---------- */

const INTERACTIVE = 'a,button,[role="button"],[role="tab"],[role="radio"],[data-cursor],summary,input,textarea,select';

export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [img, setImg] = useState<string | null>(null);
  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const tx = useMotionValue(-100);
  const ty = useMotionValue(-100);
  const rx = useSpring(tx, { stiffness: 170, damping: 20, mass: 0.6 });
  const ry = useSpring(ty, { stiffness: 170, damping: 20, mass: 0.6 });
  const target = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (reduce || !finePointer()) return;
    setEnabled(true);
    document.documentElement.classList.add('has-cursor');
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = target.current;
      // Magnetic snap: small controls pull the ring toward their centre.
      if (t && !t.dataset.cursor) {
        const r = t.getBoundingClientRect();
        if (r.width < 240) {
          tx.set(e.clientX + (r.left + r.width / 2 - e.clientX) * 0.45);
          ty.set(e.clientY + (r.top + r.height / 2 - e.clientY) * 0.45);
        } else { tx.set(e.clientX); ty.set(e.clientY); }
      } else { tx.set(e.clientX); ty.set(e.clientY); }
      setVisible(true);
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest<HTMLElement>(INTERACTIVE) ?? null;
      if (t !== target.current && t) tick();
      target.current = t;
      setHot(!!t);
      setLabel(t?.dataset.cursor ?? null);
      setImg(t?.dataset.cursorImg ?? null);
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    const leave = () => setVisible(false);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    document.addEventListener('pointerleave', leave);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      document.removeEventListener('pointerleave', leave);
    };
  }, [reduce, x, y, tx, ty]);

  if (!enabled) return null;
  const size = img ? 180 : label ? 88 : hot ? 56 : 34;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]" style={{ opacity: visible ? 1 : 0, transition: 'opacity .2s' }}>
      <motion.div className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" style={{ x, y }} animate={{ scale: hot ? 0 : 1 }} />
      <motion.div
        className={`absolute left-0 top-0 flex items-center justify-center overflow-hidden rounded-full ${label || img ? 'bg-accent' : 'border border-[#F4F2EE] mix-blend-difference'}`}
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{ width: size, height: size, scale: down ? 0.82 : 1 }}
        transition={{ duration: 0.35, ease: EXPO }}
      >
        <AnimatePresence>
          {img && (
            <motion.img key={img} src={img} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EXPO }} />
          )}
          {label && (
            <motion.span key={label} className="relative text-[11px] font-medium tracking-wide text-[#0B0B0C]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ---------- Scroll progress + chapter indicator (also feeds the section store) ---------- */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [label, setLabel] = useState('Intro');

  useEffect(() => {
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        sectionStore.set(el.dataset.section!);
        setLabel(el.dataset.sectionLabel ?? el.dataset.section!);
      }),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    // Sections mount lazily, so pick up new ones as they appear.
    const scan = () => document.querySelectorAll('[data-section]').forEach((el) => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
    scan();
    const id = setInterval(scan, 1200);
    return () => { clearInterval(id); io.disconnect(); };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed right-2.5 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-3 text-[#F4F2EE] mix-blend-difference lg:flex">
      <span className="label rotate-180 !text-[#F4F2EE]/70 [writing-mode:vertical-rl]"><Scramble text={label} play /></span>
      <span className="relative block h-[28vh] w-px bg-[#F4F2EE]/20">
        <motion.span className="absolute inset-0 origin-top bg-[#F4F2EE]" style={{ scaleY }} />
      </span>
    </div>
  );
}

/* ---------- Easter egg: type “hsh” ---------- */

export function EasterEgg() {
  const [on, setOn] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    let buf = '';
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOn(false); return; }
      const t = e.target as Element | null;
      if (t?.closest?.('input,textarea,[contenteditable]') || e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-3);
      if (buf === 'hsh') { buf = ''; setOn(true); thump(); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  useEffect(() => {
    if (!on) return;
    const id = setTimeout(() => setOn(false), reduce ? 1500 : 4200);
    return () => clearTimeout(id);
  }, [on, reduce]);

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          className="fixed inset-0 z-[85] flex flex-col items-center justify-center gap-10 bg-[#0B0B0C] text-[#F4F2EE]"
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
          animate={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{ clipPath: 'circle(0% at 50% 50%)' }}
          transition={{ duration: 0.8, ease: QUART }}
          onClick={() => setOn(false)}
          role="dialog"
          aria-label="HSH"
        >
          <motion.div className="w-[min(70vw,560px)]" initial={{ rotate: -8, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: 1.2, ease: EXPO }}>
            <HSHLogo className="w-full" mode="intro" alive interactive={false} />
          </motion.div>
          <p className="label !text-[#96938C]"><Scramble text="Discipline. Same ring, new rules." play /></p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Tab: animated favicon + “Come back” title ---------- */

export function TabFx() {
  useEffect(() => {
    const original = { title: document.title };
    const onVis = () => {
      if (document.hidden) { original.title = document.title; document.title = 'Come back 👊 — HSH'; }
      else document.title = original.title;
    };
    document.addEventListener('visibilitychange', onVis);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => document.removeEventListener('visibilitychange', onVis);

    // Champagne plate reads on both light and dark tab strips; the S swings half a turn every few seconds.
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const stems = COMPACT.stems.map((d) => new Path2D(d));
    const spine = new Path2D(COMPACT.spine);
    const frame = (angle: number) => {
      g.clearRect(0, 0, 64, 64);
      g.save();
      g.scale(64 / 72, 64 / 72);
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#C9B48A';
      g.beginPath();
      g.roundRect(0, 0, 72, 72, 12);
      g.fill();
      g.globalCompositeOperation = 'destination-out';
      g.lineWidth = COMPACT.cut;
      g.lineCap = 'square';
      stems.forEach((p) => g.stroke(p));
      g.translate(36, 36);
      g.rotate(angle);
      g.translate(-36, -36);
      g.stroke(spine);
      g.restore();
      if (link) link.href = c.toDataURL('image/png');
    };
    let t0 = 0;
    let timer = 0;
    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      const cycle = t % 4; // spin during the first 0.8s of each 4s cycle
      const p = Math.min(1, cycle / 0.8);
      const ease = p < 0.5 ? 8 * p ** 4 : 1 - Math.pow(-2 * p + 2, 4) / 2;
      frame(Math.PI * ease + Math.PI * Math.floor(t / 4));
      timer = window.setTimeout(loop, cycle < 0.8 ? 80 : 4000 - cycle * 1000);
    };
    t0 = performance.now();
    timer = window.setTimeout(loop, 2500);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  return null;
}

/* ---------- Route curtain with logo flash (every navigation except the card morph) ---------- */

// The very first route of a visit has nothing to transition from.
export const routeFx = { skipNext: true };

export function RouteCurtain() {
  const reduce = useReducedMotion();
  const [show] = useState(() => {
    const skip = routeFx.skipNext;
    routeFx.skipNext = false;
    return !skip && !reduce;
  });
  if (!show) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[75] flex items-center justify-center bg-fg text-bg"
      initial={{ clipPath: 'inset(0% 0 0% 0)' }}
      animate={{ clipPath: 'inset(0% 0 100% 0)' }}
      transition={{ duration: 0.9, ease: QUART, delay: 0.35 }}
    >
      <motion.div className="w-28" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: [0.7, 1, 1.15], opacity: [0, 1, 0] }} transition={{ duration: 0.8, ease: EXPO }}>
        <HSHLogo className="w-full" mode="static" alive={false} interactive={false} />
      </motion.div>
    </motion.div>
  );
}
