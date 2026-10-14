import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useLayoutEffect, useRef } from 'react';
import { HSHLogo } from '../components/logo/HSHLogo';
import { projects } from '../data/projects';

const LINE = "And here's what I've built.";
const WORDS = LINE.split(' ');

/*
  The climax — one pinned, scroll-scrubbed timeline (~5 screens):
  .00–.24  each word rises out of its own depth layer
  .30–.48  the letters burst apart in 3D, blurring
  .48–.60  …and collapse into a single point
  .52–.66  where an orb is born: rays turning, the HSH mark rolling in
  .64–.74  the mark gives way to the first project's name
  .74–1    the orb swallows the screen; the Works section continues in its colour
*/

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const inOut = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);
const easeIn = (t: number) => t * t * t;
const rand = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function Letter({ c, i, p, home }: { c: string; i: number; p: MotionValue<number>; home: React.MutableRefObject<{ x: number; y: number }[]> }) {
  const X = (rand(i, 1) - 0.5) * 110;
  const Y = (rand(i, 2) - 0.5) * 90;
  const Z = rand(i, 3) * 900 - 300;
  const RX = (rand(i, 4) - 0.5) * 260;
  const RY = (rand(i, 5) - 0.5) * 260;
  const transform = useTransform(p, (v) => {
    const s1 = inOut(seg(v, 0.3, 0.48));
    const s2 = easeIn(seg(v, 0.48, 0.6));
    const h = home.current[i] ?? { x: 0, y: 0 };
    // vw/vh while scattering, px while collapsing onto the centre (measured from layout)
    const x = `calc(${(X * s1 * (1 - s2)).toFixed(2)}vw + ${(-h.x * s2).toFixed(1)}px)`;
    const y = `calc(${(Y * s1 * (1 - s2)).toFixed(2)}vh + ${(-h.y * s2).toFixed(1)}px)`;
    return `translate3d(${x}, ${y}, ${(Z * s1 * (1 - s2) - 400 * s2).toFixed(1)}px) rotateX(${(RX * s1).toFixed(1)}deg) rotateY(${(RY * s1).toFixed(1)}deg) scale(${(1 - 0.85 * s2).toFixed(3)})`;
  });
  const filter = useTransform(p, (v) => `blur(${(seg(v, 0.32, 0.48) * (3 + rand(i, 6) * 9) * (1 - seg(v, 0.52, 0.6))).toFixed(1)}px)`);
  const opacity = useTransform(p, [0.5, 0.6], [1, 0]);
  return (
    <motion.span data-l className="inline-block will-change-transform" style={{ transform, filter, opacity }}>
      {c}
    </motion.span>
  );
}

function Word({ w, k, p, start, home }: { w: string; k: number; p: MotionValue<number>; start: number; home: React.MutableRefObject<{ x: number; y: number }[]> }) {
  const a = k * 0.045;
  const z = useTransform(p, [a, a + 0.09, 0.3], [-900, 0, 60]);
  const opacity = useTransform(p, [a, a + 0.07], [0, 1]);
  const filter = useTransform(p, [a, a + 0.09], ['blur(14px)', 'blur(0px)']);
  return (
    <motion.span className="inline-block whitespace-nowrap [transform-style:preserve-3d]" style={{ z, opacity, filter }}>
      {[...w].map((c, j) => <Letter key={j} c={c} i={start + j} p={p} home={home} />)}
    </motion.span>
  );
}

export function Built() {
  const ref = useRef<HTMLElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const orb = useRef<HTMLDivElement>(null);
  const home = useRef<{ x: number; y: number }[]>([]);
  const cover = useRef(4);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  // Each letter's offset from the screen centre, so the collapse lands exactly on the orb.
  useLayoutEffect(() => {
    if (reduce) return;
    // offsetLeft/Top ignore transforms, so the words' depth animation can't skew the measurement.
    // The line is the only in-flow child of the centred sticky box, so its centre is the screen centre.
    const measure = () => {
      const el = line.current;
      if (!el) return;
      el.querySelectorAll<HTMLElement>('[data-l]').forEach((l, i) => {
        home.current[i] = { x: l.offsetLeft + l.offsetWidth / 2 - el.offsetWidth / 2, y: l.offsetTop + l.offsetHeight / 2 - el.offsetHeight / 2 };
      });
      if (orb.current) cover.current = (Math.hypot(innerWidth, innerHeight) / orb.current.offsetWidth) * 1.08;
    };
    measure();
    document.fonts?.ready.then(measure);
    addEventListener('resize', measure);
    return () => removeEventListener('resize', measure);
  }, [reduce]);

  const orbS = useTransform(p, (v) => {
    const born = inOut(seg(v, 0.52, 0.66));
    const grow = inOut(seg(v, 0.74, 0.98));
    return born * (1 + (cover.current - 1) * grow);
  });
  const raysR = useTransform(p, [0.52, 1], [-40, 140]);
  const raysO = useTransform(p, [0.52, 0.6, 0.74, 0.8], [0, 1, 1, 0]);
  const logoR = useTransform(p, [0.54, 0.66], [-200, 0]);
  const logoS = useTransform(p, [0.54, 0.66], [0.4, 1]);
  const logoY = useTransform(p, [0.64, 0.7], ['0%', '-140%']);
  const logoO = useTransform(p, [0.64, 0.69], [1, 0]);
  const nameY = useTransform(p, [0.66, 0.72], ['110%', '0%']);
  const labelO = useTransform(p, [0.66, 0.72], [0, 1]);
  const innerO = useTransform(p, [0.78, 0.84], [1, 0]);

  if (reduce) {
    return (
      <section ref={ref} className="wrap relative py-[var(--section)]" aria-label="Transition to projects" data-field="climax">
        <p className="display text-[clamp(2.75rem,9vw,10rem)]">{LINE}</p>
      </section>
    );
  }

  const first = projects[0];
  return (
    <section ref={ref} className="relative h-[560vh]" aria-label="Transition to projects" data-section="built" data-section-label="The climax" data-field="climax">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden [perspective:1100px]">
        <p ref={line} className="display wrap relative text-center text-[clamp(2.5rem,8.5vw,10rem)] [transform-style:preserve-3d]">
          <span className="sr-only">{LINE}</span>
          <span aria-hidden className="[transform-style:preserve-3d]">
            {WORDS.map((w, k) => {
              const start = WORDS.slice(0, k).join('').length;
              return (
                <span key={k}>
                  <Word w={w} k={k} p={p} start={start} home={home} />
                  {k < WORDS.length - 1 && ' '}
                </span>
              );
            })}
          </span>
        </p>

        {/* The orb */}
        <motion.div ref={orb} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[min(58vmin,30rem)] w-[min(58vmin,30rem)]" style={{ x: '-50%', y: '-50%', scale: orbS }}>
          <motion.div className="absolute -inset-[45%] rounded-full bg-[radial-gradient(circle,rgb(var(--fg)/0.28),rgb(var(--accent)/0.1)_38%,transparent_66%)]" style={{ opacity: raysO }} />
          <motion.svg viewBox="-100 -100 200 200" className="absolute -inset-[22%] h-[144%] w-[144%] text-fg" style={{ rotate: raysR, opacity: raysO }}>
            {Array.from({ length: 48 }, (_, i) => {
              const a = (i / 48) * Math.PI * 2;
              const r2 = i % 4 === 0 ? 98 : i % 2 ? 80 : 88;
              return <line key={i} x1={Math.cos(a) * 72} y1={Math.sin(a) * 72} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke="currentColor" strokeWidth={i % 4 === 0 ? 0.8 : 0.35} strokeOpacity={i % 4 === 0 ? 0.8 : 0.4} />;
            })}
          </motion.svg>
          <div className="absolute inset-0 rounded-full bg-fg" />
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-full text-bg" style={{ opacity: innerO }}>
            <motion.div className="w-[46%]" style={{ rotate: logoR, scale: logoS, y: logoY, opacity: logoO }}>
              <HSHLogo className="w-full" mode="static" alive={false} interactive={false} />
            </motion.div>
            <div className="absolute inset-x-[12%] text-center">
              <motion.p className="label !text-bg/60" style={{ opacity: labelO }}>01 / {String(projects.length).padStart(2, '0')} — Selected works</motion.p>
              <span className="mt-2 block overflow-hidden pb-[0.1em]">
                <motion.span className="display block text-[clamp(1.6rem,6vmin,3.4rem)]" style={{ y: nameY }}>{first.name}</motion.span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
