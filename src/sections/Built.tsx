import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';

const LINE = "And here's what I've built.";

/*
  The climax. 0 → .35: words light up one by one. .45 → .85: the line grows and its letters
  fly apart. .7 → 1: a circle of the inverted colour swallows the screen — the Works section
  continues in that inverted theme.
*/
function Letter({ c, i, n, p }: { c: string; i: number; n: number; p: MotionValue<number> }) {
  const words = LINE.slice(0, i).split(' ').length - 1;
  const w = LINE.split(' ').length;
  const lit = useTransform(p, [(words / w) * 0.35, ((words + 1) / w) * 0.35], [0, 1]);
  const spread = (i - n / 2) / (n / 2);
  const jitter = Math.sin(i * 12.9898) * 0.5 + 0.5; // deterministic scatter
  const x = useTransform(p, [0.45, 0.85], ['0vw', `${spread * 70}vw`]);
  const y = useTransform(p, [0.45, 0.85], ['0vh', `${(jitter - 0.5) * 90}vh`]);
  const rotate = useTransform(p, [0.45, 0.85], [0, (jitter - 0.5) * 160]);
  const blur = useTransform(p, [0.5, 0.85], ['blur(0px)', `blur(${4 + jitter * 8}px)`]);
  const fade = useTransform(p, [0.7, 0.85], [1, 0]);
  // Unlit letters sit in the muted colour (AA); the lit copy fades in on top.
  return (
    <motion.span className="relative inline-block text-muted will-change-transform" style={{ x, y, rotate, opacity: fade, filter: blur }}>
      {c}
      <motion.span className="absolute inset-0 text-fg" style={{ opacity: lit }}>{c}</motion.span>
    </motion.span>
  );
}

export function Built() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const scale = useTransform(scrollYProgress, [0.4, 0.85], [1, 1.6]);
  const circle = useTransform(scrollYProgress, [0.68, 1], ['circle(0% at 50% 55%)', 'circle(75% at 50% 55%)']);

  if (reduce) {
    return (
      <section className="wrap py-[var(--section)]" aria-label="Transition to projects">
        <p className="display text-[clamp(2.75rem,9vw,10rem)]">{LINE}</p>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[260vh]" aria-label="Transition to projects" data-section="built" data-section-label="The climax">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.p style={{ scale }} className="display wrap text-center text-[clamp(2.5rem,8.5vw,10rem)]">
          <span className="sr-only">{LINE}</span>
          <span aria-hidden>
            {LINE.split(' ').map((word, w, words) => {
              const start = words.slice(0, w).join(' ').length + (w ? 1 : 0);
              return (
                <span key={w} className="inline-block whitespace-nowrap">
                  {[...word].map((c, k) => <Letter key={k} c={c} i={start + k} n={LINE.length} p={scrollYProgress} />)}
                  {w < words.length - 1 && ' '}
                </span>
              );
            })}
          </span>
        </motion.p>
        <motion.div aria-hidden className="absolute inset-0 bg-fg" style={{ clipPath: circle }} />
      </div>
    </section>
  );
}
