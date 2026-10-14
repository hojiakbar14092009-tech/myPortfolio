import { motion, useAnimationControls, useMotionValue, useMotionValueEvent, useTransform, type MotionStyle } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { QUART } from '../animations/ease';
import { whoosh } from '../animations/sound';
import { introStore } from '../animations/store';
import { HSHLogo } from './logo/HSHLogo';

/*
  Intro, in three acts:
  1. Story (~3.5s, timed): chess → pitch → water → ropes → cursor snap into the HSH plate.
  2. Lock: the plate stays centred, breathing, a light sweep crossing it, the S swaying; the field behind is alive.
     Nothing moves on by itself.
  3. Opening (scrubbed 1:1 by wheel / swipe / arrow keys, ~4–6s of scrolling, reversible): the plate dissolves
     into light, the H's swing outward, the S unfolds, the page curtain lifts; the mark then re-forms small and
     FLIP-flies into the header. "Skip intro" / Enter plays the same opening on its own.
  Reduced motion: static plate, click / tap / Enter / scroll fades straight in.
*/

const STEMS_L = ['M14 12V60', 'M38 12V60', 'M14 48H38'];
const S_PATH = ['M38 48H54A12 12 0 1 0 66 36A12 12 0 1 1 78 24H94'];
const STEMS_R = ['M94 12V60', 'M118 12V60', 'M94 24H118'];
const ALL = [...STEMS_L, ...S_PATH, ...STEMS_R];
const PAPER = '#F4F2EE';

function Strokes({ d, className, style }: { d: string[]; className?: string; style?: MotionStyle }) {
  return (
    <motion.svg viewBox="0 0 132 72" overflow="visible" aria-hidden className={`absolute inset-0 h-full w-full ${className ?? ''}`} style={style}>
      <g stroke={PAPER} strokeWidth={8} fill="none" strokeLinecap="square">
        {d.map((p) => <path key={p} d={p} />)}
      </g>
    </motion.svg>
  );
}

const setCurtain = (c: number) => {
  const s = document.documentElement.style;
  s.setProperty('--curtain', String(c));
  s.setProperty('--curtain-y', `${Math.round((1 - c) * innerHeight)}px`);
};

export function Preloader({ onReveal, onDone, reduce }: { onReveal: () => void; onDone: () => void; reduce: boolean }) {
  const [phase, setPhase] = useState<'story' | 'lock' | 'fly'>(reduce ? 'lock' : 'story');
  const [touch] = useState(() => matchMedia('(hover: none)').matches);
  const box = useRef<HTMLDivElement>(null);
  const fly = useAnimationControls();
  const fade = useAnimationControls();
  const p = useMotionValue(0);
  const target = useRef(0);
  const auto = useRef(false);
  const revealed = useRef(false);
  const done = useRef(false);
  const end = useRef(0.5);

  useEffect(() => {
    introStore.set('playing');
    setCurtain(0);
    scrollTo(0, 0);
  }, []);

  // Size the header-sized end state once (the mark shrinks to the header slot before it flies there).
  useEffect(() => {
    const t = document.querySelector('[data-header-logo]')?.getBoundingClientRect();
    const b = box.current?.getBoundingClientRect();
    if (t && b) end.current = t.width / b.width;
  }, [phase]);

  const finish = async () => {
    if (done.current) return;
    done.current = true;
    setPhase('fly');
    const t = document.querySelector('[data-header-logo]')?.getBoundingClientRect();
    const b = box.current?.getBoundingClientRect();
    if (t && b && !reduce) {
      await fly.start(
        { x: t.left + t.width / 2 - (b.left + b.width / 2), y: t.top + t.height / 2 - (b.top + b.height / 2) },
        { duration: 0.9, ease: QUART },
      );
    }
    setCurtain(1);
    introStore.set('done');
    onDone();
  };

  const enterReduced = async () => {
    if (done.current) return;
    done.current = true;
    onReveal();
    setCurtain(1);
    await fade.start({ opacity: 0 }, { duration: 0.15 });
    introStore.set('done');
    onDone();
  };

  const play = () => {
    if (reduce) return enterReduced();
    if (phase === 'story') setPhase('lock');
    auto.current = true;
    whoosh();
  };

  // Scroll input drives the opening while locked.
  useEffect(() => {
    if (phase !== 'lock') return;
    if (reduce) {
      const go = (e: Event) => { e.preventDefault(); enterReduced(); };
      const key = (e: KeyboardEvent) => { if (['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) go(e); };
      addEventListener('wheel', go, { passive: false });
      addEventListener('touchmove', go, { passive: false });
      addEventListener('keydown', key);
      return () => { removeEventListener('wheel', go); removeEventListener('touchmove', go); removeEventListener('keydown', key); };
    }
    const dist = Math.max(2600, innerHeight * 4.2);
    const push = (px: number) => { if (!auto.current) target.current = Math.min(1, Math.max(0, target.current + px / dist)); };
    const wheel = (e: WheelEvent) => { e.preventDefault(); push(e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1)); };
    let ty = 0;
    const tstart = (e: TouchEvent) => { ty = e.touches[0].clientY; };
    const tmove = (e: TouchEvent) => { e.preventDefault(); const y = e.touches[0].clientY; push((ty - y) * 2.4); ty = y; };
    const key = (e: KeyboardEvent) => {
      const step = { ArrowDown: 160, ArrowUp: -160, PageDown: 600, PageUp: -600, ' ': 600 }[e.key];
      if (step) { e.preventDefault(); push(step); }
      if (e.key === 'Enter' && !(e.target as Element | null)?.closest?.('button')) { e.preventDefault(); play(); }
    };
    addEventListener('wheel', wheel, { passive: false });
    addEventListener('touchstart', tstart, { passive: true });
    addEventListener('touchmove', tmove, { passive: false });
    addEventListener('keydown', key);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (auto.current) target.current = Math.min(1, target.current + dt / 2.6);
      const cur = p.get();
      const next = cur + (target.current - cur) * (1 - Math.exp(-dt * 4.5));
      p.set(target.current >= 1 && next > 0.996 ? 1 : next);
      if (p.get() >= 1) { finish(); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('wheel', wheel);
      removeEventListener('touchstart', tstart);
      removeEventListener('touchmove', tmove);
      removeEventListener('keydown', key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduce]);

  useMotionValueEvent(p, 'change', (v) => {
    const c = Math.min(1, Math.max(0, (v - 0.45) / 0.5));
    setCurtain(c);
    if (c > 0 && !revealed.current) { revealed.current = true; onReveal(); }
  });

  /* Opening choreography, all derived from p */
  const bloomS = useTransform(p, [0, 0.4, 0.75], [0.2, 2.6, 4]);
  const bloomO = useTransform(p, [0, 0.12, 0.4, 0.75], [0, 0.6, 0.85, 0]);
  const plateO = useTransform(p, [0.06, 0.3, 0.62, 0.74], [1, 0, 0, 1]);
  const plateS = useTransform(p, [0.06, 0.32, 0.62, 0.74], [1, 1.3, 1.3, 1]);
  const plateBlur = useTransform(p, [0.06, 0.3, 0.62, 0.74], ['blur(0px)', 'blur(14px)', 'blur(14px)', 'blur(0px)']);
  const lettersO = useTransform(p, [0.03, 0.16, 0.62, 0.74], [0, 1, 1, 0]);
  const swing = useTransform(p, [0.18, 0.45, 0.52, 0.72], [0, 1, 1, 0]);
  const lx = useTransform(swing, [0, 1], ['0%', '-62%']);
  const rx = useTransform(swing, [0, 1], ['0%', '62%']);
  const ly = useTransform(swing, [0, 1], [0, -68]);
  const ry = useTransform(swing, [0, 1], [0, 68]);
  const sR = useTransform(p, [0.18, 0.45, 0.72], [0, -180, -360]);
  const sS = useTransform(swing, [0, 1], [1, 1.55]);
  const groupS = useTransform(p, [0, 0.45, 0.55, 0.8], [1, 1.12, 1.12, 1]);
  // The mark re-forms, then shrinks to the header slot's size while the curtain finishes lifting.
  const scale = useTransform([groupS, p], ([g, v]: number[]) => g * (1 + (end.current - 1) * Math.min(1, Math.max(0, (v - 0.55) / 0.25))));
  const uiO = useTransform(p, [0, 0.12], [1, 0]);
  const edgeY = useTransform(p, (v) => `${(1 - Math.min(1, Math.max(0, (v - 0.45) / 0.5))) * 100}%`);
  const edgeO = useTransform(p, [0.45, 0.5, 0.9, 0.95], [0, 1, 1, 0]);
  const pct = useTransform(p, (v) => String(Math.round(v * 100)).padStart(3, '0'));

  const locked = phase !== 'story';
  return (
    <motion.div
      className="fixed inset-0 z-[80] select-none text-[#F4F2EE]"
      data-field="intro"
      role="dialog"
      aria-modal="true"
      aria-label="Intro — scroll to enter"
      animate={fade}
      onClick={reduce ? enterReduced : undefined}
    >
      {/* Before the field is ready the intro still sits on ink, never a white flash. */}
      <motion.div aria-hidden className="absolute inset-0 bg-[#0B0B0C]" animate={{ opacity: locked ? 0 : 1 }} transition={{ duration: 1.6 }} />
      {/* curtain edge */}
      <motion.span aria-hidden className="absolute inset-x-0 h-px bg-[#F4F2EE] shadow-[0_0_24px_4px_rgb(201_180_138/0.5)]" style={{ top: edgeY, opacity: edgeO }} />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-10">
        <motion.div animate={fly} className="relative">
          <motion.div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] rounded-full bg-[radial-gradient(circle,rgb(244_242_238/0.55),rgb(201_180_138/0.12)_38%,transparent_68%)]" style={{ x: '-50%', y: '-50%', scale: bloomS, opacity: bloomO }} />
          <motion.div ref={box} className="relative aspect-[132/72] w-[clamp(11rem,26vw,20rem)] [perspective:900px]" style={{ scale }}>
            {!locked ? (
              <HSHLogo className="absolute inset-0 h-full w-full" mode="intro" alive={false} interactive={false} onIntroDone={() => setPhase('lock')} />
            ) : (
              <div className="absolute inset-0 animate-[breathe_4.5s_ease-in-out_infinite] motion-reduce:animate-none">
                <motion.svg viewBox="0 0 132 72" overflow="visible" aria-hidden className="absolute inset-0 h-full w-full" style={{ opacity: plateO, scale: plateS, filter: plateBlur }}>
                  <defs>
                    <mask id="intro-cut" maskUnits="userSpaceOnUse" x={-20} y={-20} width={172} height={112}>
                      <rect width={132} height={72} rx={10} fill="#fff" />
                      <g stroke="#000" strokeWidth={8} fill="none" strokeLinecap="square">{ALL.map((d) => <path key={d} d={d} />)}</g>
                    </mask>
                    <linearGradient id="intro-sweep" x1="0" x2="1">
                      <stop offset="0" stopColor="#C9B48A" stopOpacity="0" />
                      <stop offset=".5" stopColor="#C9B48A" stopOpacity=".9" />
                      <stop offset="1" stopColor="#C9B48A" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <g mask="url(#intro-cut)">
                    <rect width={132} height={72} rx={10} fill={PAPER} />
                    {!reduce && <rect className="intro-sweep" width={46} height={72} fill="url(#intro-sweep)" />}
                  </g>
                </motion.svg>
                <motion.div className="absolute inset-0" style={{ opacity: lettersO }}>
                  <Strokes d={STEMS_L} style={{ x: lx, y: 0, rotateY: ly, transformOrigin: '19.7% 50%' }} />
                  <div className="absolute inset-0 animate-[sway_5s_ease-in-out_infinite] motion-reduce:animate-none">
                    <Strokes d={S_PATH} style={{ rotate: sR, scale: sS }} />
                  </div>
                  <Strokes d={STEMS_R} style={{ x: rx, rotateY: ry, transformOrigin: '80.3% 50%' }} />
                </motion.div>
              </div>
            )}
          </motion.div>
        </motion.div>

        <motion.div className="label flex w-[clamp(11rem,26vw,20rem)] items-center justify-between tabular-nums !text-[#A09D96]" style={{ opacity: uiO }}>
          {locked ? (
            <span className="flex items-center gap-3">
              <span className="relative block h-6 w-px overflow-hidden bg-[#F4F2EE]/20" aria-hidden>
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollhint_1.8s_ease-in-out_infinite] bg-[#F4F2EE] motion-reduce:animate-none" />
              </span>
              {reduce ? (touch ? 'Tap to enter' : 'Click to enter') : touch ? 'Swipe up to enter' : 'Scroll to enter'}
            </span>
          ) : (
            <span>From the ring</span>
          )}
          <motion.span aria-hidden>{locked && !reduce ? pct : 'HSH'}</motion.span>
        </motion.div>
      </div>

      <motion.button
        type="button"
        className="label absolute bottom-6 right-[var(--gutter)] rounded-sm px-2 py-3 !text-[#A09D96] hover:!text-[#F4F2EE]"
        style={{ opacity: uiO }}
        onClick={(e) => { e.stopPropagation(); play(); }}
      >
        {reduce ? 'Enter site' : 'Skip intro'}
      </motion.button>
    </motion.div>
  );
}
