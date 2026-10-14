import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { finePointer } from '../animations/ease';
import { Reveal } from '../animations/useSplitReveal';

/*
  "No risk, no story." — 300vh section, 200vh of it pinned, everything scrubbed by scroll:
  0 → .7    four scattered ghost words fly home out of depth, de-blurring; on landing a hairline draws
            under each and the crisp letters slide up through it one by one; the full stop lands last.
  .7 → .85  hold: a silver light sweeps the block once; the light behind slowly zooms.
  .85 → 1   the letters leave upward through their masks and the section hands over to the footer.
*/

const WORDS = [
  { t: 'NO', line: 0, x: -38, y: -30, z: -1400, r: -18, depth: 8 },
  { t: 'RISK', line: 0, x: 34, y: -38, z: -900, r: 14, depth: 5 },
  { t: 'NO', line: 1, x: -46, y: 36, z: -1200, r: 10, depth: 6 },
  { t: 'STORY', line: 1, x: 30, y: 42, z: -1700, r: -12, depth: 4 },
];
const QUART = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const travelEnd = (k: number) => 0.34 + k * 0.07;

function Letter({ c, k, j, n, p }: { c: string; k: number; j: number; n: number; p: MotionValue<number> }) {
  const a = travelEnd(k) + j * 0.012;
  const out = 0.86 + n * 0.006;
  const y = useTransform(p, (v) => `${(105 * (1 - QUART(seg(v, a, a + 0.05))) - 110 * QUART(seg(v, out, out + 0.06))).toFixed(1)}%`);
  return (
    <span className="relative inline-block overflow-hidden pb-[0.06em] align-bottom">
      <motion.span className="block" style={{ y }}>
        {/* hover: the letter rolls to an accent copy */}
        <span className="block transition-transform duration-500 ease-expo group-hover:-translate-y-full" style={{ transitionDelay: `${j * 30}ms` }}>
          {c}
          <span className="absolute left-0 top-full text-accent">{c}</span>
        </span>
      </motion.span>
    </span>
  );
}

function Word({ w, k, p, mx, my, base }: { w: (typeof WORDS)[number]; k: number; p: MotionValue<number>; mx: MotionValue<number>; my: MotionValue<number>; base: number }) {
  const end = travelEnd(k);
  const start = k * 0.06;
  const ghost = useTransform(p, (v) => {
    const t = QUART(seg(v, start, end));
    return `translate3d(${(w.x * (1 - t)).toFixed(2)}vw, ${(w.y * (1 - t)).toFixed(2)}vh, ${(w.z * (1 - t)).toFixed(0)}px) rotate(${(w.r * (1 - t)).toFixed(1)}deg)`;
  });
  const gBlur = useTransform(p, [start, start + (end - start) * 0.6], ['blur(12px)', 'blur(0px)']);
  const gOp = useTransform(p, [start, end - 0.04, end + 0.02, end + 0.08], [0.12, 0.45, 0.45, 0]);
  const line = useTransform(p, [end - 0.02, end + 0.03], [0, 1]);
  const lineO = useTransform(p, [end + 0.1, end + 0.14], [1, 0]);
  const px = useTransform(mx, (v) => v * w.depth);
  const py = useTransform(my, (v) => v * w.depth);
  return (
    <motion.span className="group relative inline-block [transform-style:preserve-3d]" style={{ x: px, y: py }}>
      <motion.span aria-hidden className="pointer-events-none absolute inset-0 whitespace-nowrap" style={{ transform: ghost, filter: gBlur, opacity: gOp }}>{w.t}</motion.span>
      {[...w.t].map((c, j) => <Letter key={j} c={c} k={k} j={j} n={base + j} p={p} />)}
      <motion.span aria-hidden className="absolute inset-x-0 bottom-[0.08em] h-px origin-left bg-[#F4F2EE]/60" style={{ scaleX: line, opacity: lineO }} />
    </motion.span>
  );
}

export function NoRisk() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18 });
  const smy = useSpring(my, { stiffness: 60, damping: 18 });

  const dotS = useTransform(p, [0.6, 0.65, 0.68], [3, 0.85, 1]);
  const dotO = useTransform(p, [0.6, 0.63, 0.88, 0.92], [0, 1, 1, 0]);
  const dotY = useTransform(p, [0.6, 0.65], ['-40vh', '0vh']);
  const rule = useTransform(p, [0.65, 0.72], [0, 1]);
  const ruleO = useTransform(p, [0.86, 0.92], [1, 0]);
  const sweep = useTransform(p, [0.7, 0.85], ['-110%', '330%']);
  const sweepO = useTransform(p, [0.69, 0.72, 0.83, 0.86], [0, 1, 1, 0]);
  const zoom = useTransform(p, [0, 1], [1, 1.35]);
  const glow = useTransform(p, [0.3, 0.7, 0.95], [0.2, 1, 0.4]);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !finePointer()) return;
    mx.set(e.clientX / innerWidth - 0.5);
    my.set(e.clientY / innerHeight - 0.5);
  };

  const type = 'display uppercase text-[clamp(3rem,12vw,11rem)] !leading-[0.9] !tracking-[0.02em] text-[#F4F2EE]';

  if (reduce) {
    return (
      <section ref={ref} aria-label="No risk, no story" data-field="cover" className="relative flex min-h-[100svh] items-center justify-center bg-[#0B0B0C] py-[var(--section)] text-center">
        <Reveal><h2 className={type}>No risk<br />no story<span className="text-[#C9B48A]">.</span></h2></Reveal>
      </section>
    );
  }

  let n = 0;
  return (
    <section ref={ref} aria-label="No risk, no story" data-field="cover" data-section="norisk" data-section-label="No risk, no story" className="relative h-[300vh] bg-[#0B0B0C]" onPointerMove={onMove}>
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden [perspective:1200px]">
        {/* Slow Ken Burns of the light behind the words, under a soft vignette. */}
        <motion.div aria-hidden className="absolute inset-[-10%] bg-[radial-gradient(60%_50%_at_50%_50%,rgb(244_242_238/0.09),transparent_70%)]" style={{ scale: zoom, opacity: glow }} />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_50%,transparent_45%,rgb(0_0_0/0.7))]" />

        <h2 className={`relative text-center ${type}`}>
          <span className="sr-only">No risk, no story.</span>
          <span aria-hidden className="block [transform-style:preserve-3d]">
            {[0, 1].map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {WORDS.map((w, k) => {
                  if (w.line !== line) return null;
                  const base = n;
                  n += w.t.length;
                  return (
                    <span key={k}>
                      {k % 2 === 1 && ' '}
                      <Word w={w} k={k} p={p} mx={smx} my={smy} base={base} />
                    </span>
                  );
                })}
                {line === 1 && (
                  <motion.span className="inline-block text-[#C9B48A]" style={{ scale: dotS, opacity: dotO, y: dotY }}>.</motion.span>
                )}
              </span>
            ))}
            <motion.span className="mx-auto mt-6 block h-px w-[min(70vw,48rem)] origin-center bg-[#F4F2EE]/50" style={{ scaleX: rule, opacity: ruleO }} />
          </span>
          {/* one silver sweep across the assembled block */}
          <motion.span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent mix-blend-overlay" style={{ x: sweep, opacity: sweepO }} />
        </h2>
      </div>
    </section>
  );
}
