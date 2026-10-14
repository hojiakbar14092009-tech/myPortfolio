import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';
import { EXPO, QUART, finePointer } from '../animations/ease';
import { useThemeValue } from '../animations/store';
import { SplitText } from '../animations/useSplitReveal';
import { useOpenProject } from '../components/CoverTransition';
import { Scramble, TextRoll } from '../components/Kinetic';
import { Picture } from '../components/Picture';
import { UstaGoCover } from '../components/UstaGoUI';
import { projects, type Project } from '../data/projects';
import { Skew } from './Bio';

export const preloadCase = () => import('../pages/CaseStudy');

// Asymmetric, staggered placement. Four projects don't justify a horizontal gallery;
// offsets give rhythm while every card stays fully visible.
const PLACE = [
  { cls: 'lg:col-span-7', portrait: false, float: '0s' },
  { cls: 'lg:col-span-4 lg:col-start-9 lg:mt-[22vh]', portrait: true, float: '-2s' },
  { cls: 'lg:col-span-5 lg:col-start-2 lg:mt-[6vh]', portrait: true, float: '-4s' },
  { cls: 'lg:col-span-5 lg:col-start-8 lg:mt-[26vh]', portrait: false, float: '-1s' },
];

function Card({ p, i, dim, onHover }: { p: Project; i: number; dim: boolean; onHover: (h: boolean) => void }) {
  const reduce = useReducedMotion();
  const open = useOpenProject();
  const media = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const place = PLACE[i];
  // Portrait slots show the phone capture so nothing important gets cropped.
  const image = place.portrait && p.shots.mobile ? p.shots.mobile : p.cover;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 120, damping: 14 });
  const rotateY = useSpring(ry, { stiffness: 120, damping: 14 });
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || !finePointer()) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -12);
  };
  const hoverOn = (h: boolean) => { setHover(h); onHover(h); if (!h) { rx.set(0); ry.set(0); } };

  return (
    <motion.article
      className={`col-span-12 [perspective:1400px] ${place.cls}`}
      // Each card flies in out of depth, motion-blurred, and locks into its slot — one after another.
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 220, z: -900, scale: 0.7, rotateX: 32, filter: 'blur(20px)' }}
      whileInView={{ opacity: 1, y: 0, z: 0, scale: 1, rotateX: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -6% 0px' }}
      style={{ transformPerspective: 1200 }}
      transition={{ duration: 1.5, ease: EXPO, delay: (i % 2) * 0.22 }}
    >
      <motion.div animate={{ opacity: dim ? 0.35 : 1, scale: dim ? 0.95 : 1, filter: dim ? 'grayscale(1)' : 'grayscale(0)' }} transition={{ duration: 0.6, ease: EXPO }}>
        <div data-alive className="animate-[float_7s_ease-in-out_infinite]" style={{ animationDelay: place.float }}>
          <a
            href={`/work/${p.slug}`}
            data-cursor="Open"
            aria-label={`${p.name} — open case study`}
            className="group block rounded-[8px]"
            onPointerMove={onMove}
            onPointerEnter={() => { preloadCase(); hoverOn(true); }}
            onPointerLeave={() => hoverOn(false)}
            onFocus={preloadCase}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey) return;
              e.preventDefault();
              preloadCase();
              open({ slug: p.slug, rect: media.current!.getBoundingClientRect() });
            }}
          >
            <motion.div className="relative" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} animate={{ y: hover ? -10 : 0 }} transition={{ duration: 0.5, ease: EXPO }}>
              <div
                ref={media}
                className={`relative overflow-hidden rounded-[8px] bg-surface ${place.portrait ? 'aspect-[4/5]' : 'aspect-[4/3]'} transition-[clip-path] duration-700 ease-expo [@media(hover:hover)]:[clip-path:inset(2%_2%_2%_2%_round_8px)] [@media(hover:hover)]:group-hover:[clip-path:inset(0%_0%_0%_0%_round_8px)] motion-reduce:![clip-path:none]`}
              >
                <div data-alive className="h-full w-full animate-[drift_16s_ease-in-out_infinite]">
                  {image ? (
                    <Picture
                      name={image}
                      alt=""
                      sizes={place.portrait ? '(min-width: 1024px) 35vw, 100vw' : '(min-width: 1024px) 55vw, 100vw'}
                      imgClassName="h-full w-full object-cover object-top transition-[object-position] duration-[6000ms] ease-linear group-hover:object-bottom"
                    />
                  ) : (
                    <UstaGoCover playing={hover} />
                  )}
                </div>
                <span
                  aria-hidden
                  data-alive
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-[sweep_7s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  style={{ animationDelay: `${i * 1.3}s` }}
                />
              </div>
              {/* border that draws itself */}
              <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                <motion.rect
                  width="100%"
                  height="100%"
                  rx="8"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.35"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2.2, ease: QUART, delay: 0.6 }}
                />
              </svg>
            </motion.div>
            <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4">
              <span className="label"><Scramble text={p.n} /></span>
              <h3 className="font-display text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-semibold leading-none tracking-[-0.03em]">
                <TextRoll text={p.name} />
              </h3>
              <span className="label"><Scramble text={p.year} /></span>
              <p className="col-start-2 mt-3 max-w-[46ch] text-muted">{p.value}</p>
              <ul className="col-start-2 mt-3 flex flex-wrap gap-x-3 text-sm">
                {p.tags.map((t, k) => <li key={t}>{t}{k < p.tags.length - 1 && <span aria-hidden className="ml-3 text-muted">/</span>}</li>)}
              </ul>
            </div>
          </a>
        </div>
      </motion.div>
    </motion.article>
  );
}

export function Works() {
  const theme = useThemeValue();
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <section
      id="work"
      data-theme={theme === 'dark' ? 'light' : 'dark'}
      data-section="work"
      data-section-label="Selected works"
      data-field="cover"
      className="invert-scope relative -mt-px pb-[var(--section)] pt-[clamp(4rem,8vw,7rem)]"
      aria-labelledby="work-title"
    >
      <div className="wrap">
        <div className="mb-16 flex items-end justify-between border-b hairline pb-6">
          <Skew max={4}>
            <h2 id="work-title" className="display text-[clamp(2.75rem,7vw,7rem)]"><SplitText text="Selected works" by="char" stagger={0.025} /></h2>
          </Skew>
          <span className="label"><Scramble text={`03 — (${String(projects.length).padStart(2, '0')})`} /></span>
        </div>
        <div className="grid-12 gap-y-24">
          {projects.map((p, i) => (
            <Card key={p.slug} p={p} i={i} dim={hovered !== null && hovered !== i} onHover={(h) => setHovered((cur) => (h ? i : cur === i ? null : cur))} />
          ))}
        </div>
      </div>
    </section>
  );
}
