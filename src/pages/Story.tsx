import { animate, motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { scrollTo } from '../animations/smooth';
import { useSection } from '../animations/store';
import { useInteractionGate } from '../animations/useGate';
import { Reveal, SplitText } from '../animations/useSplitReveal';
import { Counter, MagneticButton, Scramble, TextRoll } from '../components/Kinetic';
import { Picture } from '../components/Picture';
import { chapters } from '../data/bio';
import type { ImageName } from '../data/images';
import { projects } from '../data/projects';
import { ContactFooter } from '../sections/Contact';
import { CodeVisual, LearningCollage } from '../sections/Bio';

/*
  /story — the whole bio as one cinematic scroll. Every stage is a full screen with its own field chapter
  (the background photo + sport motion layer swap as you cross into it). Photo stages pin for 220vh and
  scrub their entrance: the outlined number rises, the title arrives with the sport's own motion, the copy
  follows, the photo opens with that sport's reveal. Learning and IT run in normal flow (their content is
  taller than a screen on phones).
*/

type Kind = 'intro' | 'chess' | 'football' | 'swimming' | 'combat' | 'boxing';
type Stage = { key: string; n: string; name: string; title: string; sub: string; span: string; text: string; photo?: ImageName; alt?: string; pos?: string; kind: Kind };

const ch = (n: string) => chapters.find((c) => c.n === n)!;

const STAGES: Stage[] = [
  {
    key: 'intro', n: '00', name: 'Intro', kind: 'intro', title: 'Hojiakbar Sharofiddinov', sub: 'Before the code', span: 'Tashkent · 17',
    text: "I'm Hojiakbar Sharofiddinov — a 17-year-old UI/UX designer and full-stack developer from Tashkent. Before I wrote my first line of code, I spent years in sport.",
    photo: 'profile', alt: 'Portrait of Hojiakbar Sharofiddinov in sunglasses, sitting in a Tashkent park', pos: '45% 30%',
  },
  { key: 'chess', n: '01', name: 'Chess', kind: 'chess', title: 'Chess', sub: ch('01').title, span: ch('01').span, text: ch('01').text, photo: 'chess', alt: ch('01').photos[0].alt },
  {
    key: 'football', n: '02', name: 'Football', kind: 'football', title: 'Football', sub: 'Team', span: '3 years',
    text: 'While still playing chess, I also trained in football for three years. Football taught me teamwork and reading the field.',
    photo: 'football', alt: ch('02').photos[0].alt, pos: '50% 40%',
  },
  {
    key: 'swimming', n: '02', name: 'Swimming', kind: 'swimming', title: 'Swimming', sub: 'Rhythm', span: '1.5 years',
    text: 'Alongside it I swam for a year and a half. Swimming taught me rhythm, breath and endurance.',
    photo: 'swimming', alt: ch('02').photos[1].alt, pos: '50% 60%',
  },
  { key: 'combat', n: '03', name: 'Combat', kind: 'combat', title: 'Hand-to-hand combat', sub: ch('03').title, span: ch('03').span, text: ch('03').text, photo: 'combat', alt: ch('03').photos[0].alt, pos: '45% 50%' },
  { key: 'boxing', n: '04', name: 'Boxing', kind: 'boxing', title: 'Boxing', sub: ch('04').title, span: ch('04').span, text: ch('04').text, photo: 'boxing', alt: ch('04').photos[0].alt, pos: '75% 50%' },
];

const RAIL = [...STAGES.map((s) => ({ id: `story-${s.key}`, n: s.n, name: s.name })), { id: 'story-learning', n: '05', name: 'Learning' }, { id: 'story-it', n: '06', name: 'IT' }, { id: 'story-closing', n: '07', name: 'Closing' }];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const ease = (t: number) => 1 - (1 - t) ** 4;

/* The photo opens with its sport's motion */
const REVEAL: Record<Kind, (t: number) => string> = {
  intro: (t) => `inset(${(1 - t) * 100}% 0% 0% 0%)`,
  chess: (t) => { const q = Math.round(t * 8) / 8; const i = (1 - q) * 50; return `inset(${i}% ${i}% ${i}% ${i}%)`; }, // squares, step by step
  football: (t) => `inset(0% ${(1 - t) * 100}% 0% 0%)`, // a sweep across the pitch
  swimming: (t) => `circle(${t * 75}% at 50% 60%)`, // a ripple
  combat: (t) => `polygon(0% 0%, ${t * 220}% 0%, 0% ${t * 220}%)`, // one diagonal slash
  boxing: (t) => `inset(${(1 - t) * 50}% 0% ${(1 - t) * 50}% 0%)`, // the bell opens the ring
};

/* …and the title arrives with it */
function TitleChar({ c, i, n, kind, p }: { c: string; i: number; n: number; kind: Kind; p: MotionValue<number> }) {
  const a = 0.05 + (i / Math.max(n, 1)) * 0.14;
  const transform = useTransform(p, (v) => {
    const t = ease(seg(v, a, a + 0.12));
    const r = 1 - t;
    switch (kind) {
      case 'chess': return `translate3d(0, ${(i % 2 ? -1 : 1) * 110 * r}%, 0)`;
      case 'football': return `translate3d(${-160 * r}%, 0, 0)`;
      case 'swimming': return `translate3d(0, ${Math.sin(i * 0.9) * 90 * r + 100 * r}%, 0)`;
      case 'combat': return `translate3d(${-60 * r}%, ${60 * r}%, 0) skewX(${-30 * r}deg)`;
      case 'boxing': return `scale(${1 + 1.4 * r})`;
      default: return `translate3d(0, ${110 * r}%, 0)`;
    }
  });
  const opacity = useTransform(p, [a, a + 0.06], [0, 1]);
  return <motion.span className="inline-block will-change-transform" style={{ transform, opacity }}>{c}</motion.span>;
}

function PinnedStage({ s, first }: { s: Stage; first?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: scrolled } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // The first stage is on screen at load: it plays its entrance by itself, then scroll takes over.
  const auto = useMotionValue(0);
  useEffect(() => {
    if (!first) return;
    const c = animate(auto, 0.5, { duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 });
    return () => c.stop();
  }, [first, auto]);
  const p = useTransform([scrolled, auto], ([a, b]: number[]) => Math.max(a, b));
  const numY = useTransform(p, [0, 0.3, 1], ['60%', '0%', '-20%']);
  const subO = useTransform(p, [0.2, 0.32], [0, 1]);
  const subY = useTransform(p, [0.2, 0.32], [24, 0]);
  const textO = useTransform(p, [0.28, 0.42], [0, 1]);
  const textY = useTransform(p, [0.28, 0.42], [32, 0]);
  const clip = useTransform(p, (v) => REVEAL[s.kind](ease(seg(v, 0.08, 0.45))));
  const shutter = useTransform(p, [0.08, 0.45], [1, 0]);
  const imgS = useTransform(p, [0.08, 1], [1.25, 1]);
  const flash = useTransform(p, s.kind === 'boxing' ? [0.18, 0.24, 0.34] : [0, 1], s.kind === 'boxing' ? [0, 0.6, 0] : [0, 0]);
  const out = useTransform(p, [0.86, 1], [1, 0.25]);
  const outY = useTransform(p, [0.86, 1], ['0vh', '-6vh']);
  const words = s.title.split(' ');
  const total = s.title.replace(/ /g, '').length;
  const label = `${s.n} · ${s.name}`;

  return (
    <section ref={ref} id={`story-${s.key}`} data-section={`story-${s.key}`} data-section-label={label} data-field={s.key} data-field-boost="2" className="relative h-[220vh]" aria-labelledby={`t-${s.key}`}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* scrim so the copy stays AA over the brighter field */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-bg/0 lg:bg-gradient-to-r lg:from-bg lg:via-bg/70" />
        <motion.div className="wrap relative grid h-full grid-rows-[auto_1fr] gap-6 pb-[8svh] pt-24 lg:grid-cols-12 lg:grid-rows-1 lg:items-end lg:pt-0" style={{ opacity: out, y: outY }}>
          {s.photo && (
            <div className="relative h-[34svh] overflow-hidden rounded-[6px] lg:order-2 lg:col-span-4 lg:col-start-9 lg:h-[64svh] lg:self-center">
              {/* The first stage is the LCP: its photo paints at once and a shutter lifts off it instead of a clip. */}
              <motion.div className="h-full w-full" style={first ? undefined : { clipPath: clip }}>
                <motion.div className="h-full w-full" style={{ scale: imgS }}>
                  <Picture priority={first} name={s.photo} alt={s.alt ?? ''} sizes="(min-width: 1024px) 34vw, 100vw" imgClassName="h-full w-full object-cover grayscale" style={{ objectPosition: s.pos ?? '50% 50%' }} />
                </motion.div>
                <motion.span aria-hidden className="absolute inset-0 bg-[#F4F2EE]" style={{ opacity: flash }} />
                {first && <motion.span aria-hidden className="absolute inset-0 origin-top bg-bg" style={{ scaleY: shutter }} />}
              </motion.div>
            </div>
          )}
          <div className="self-end lg:order-1 lg:col-span-7 lg:col-start-1">
            <div className="mb-2 hidden overflow-hidden lg:block" aria-hidden>
              <motion.span className="display block text-[clamp(6rem,14vw,14rem)] text-transparent [-webkit-text-stroke:1px_rgb(var(--fg)/0.45)]" style={{ y: numY }}>{s.n}</motion.span>
            </div>
            <p className="label mb-3"><Scramble text={`${label} — ${s.span}`} /></p>
            <h2 id={`t-${s.key}`} className="font-display text-[clamp(2.5rem,1.4rem+5vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.03em]">
              <span className="sr-only">{s.title}</span>
              <span aria-hidden>
                {words.map((w, k) => {
                  const start = words.slice(0, k).join('').length;
                  return (
                    <span key={k}>
                      <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                        {[...w].map((c, j) => <TitleChar key={j} c={c} i={start + j} n={total} kind={s.kind} p={p} />)}
                      </span>
                      {k < words.length - 1 && ' '}
                    </span>
                  );
                })}
              </span>
            </h2>
            <motion.p className="serif-i mt-2 text-[clamp(1.5rem,1.1rem+1.6vw,2.6rem)] text-muted" style={{ opacity: subO, y: subY }}>{s.sub}</motion.p>
            <motion.p className="mt-5 max-w-[52ch] text-[clamp(1rem,0.95rem+0.3vw,1.2rem)] leading-relaxed" style={{ opacity: textO, y: textY }}>{s.text}</motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FlowStage({ id, field, n, name, title, sub, span, text, children }: { id: string; field: string; n: string; name: string; title: string; sub: string; span: string; text: string; children: React.ReactNode }) {
  return (
    <section id={id} data-section={id} data-section-label={`${n} · ${name}`} data-field={field} data-field-boost="1.6" className="relative py-[var(--section)]" aria-labelledby={`t-${id}`}>
      <div className="wrap">
        <p className="label mb-3"><Scramble text={`${n} · ${name} — ${span}`} /></p>
        <h2 id={`t-${id}`} className="font-display text-[clamp(2.5rem,1.4rem+5vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.03em]">
          <SplitText text={title} by="char" stagger={0.025} />
        </h2>
        <p className="serif-i mt-2 text-[clamp(1.5rem,1.1rem+1.6vw,2.6rem)] text-muted"><SplitText text={sub} delay={0.2} /></p>
        <Reveal><p className="mt-6 max-w-[56ch] text-lg leading-relaxed">{text}</p></Reveal>
        <div className="mt-14">{children}</div>
      </div>
    </section>
  );
}

function Rail() {
  const active = useSection();
  const idx = Math.max(0, RAIL.findIndex((r) => r.id === active));
  const cur = RAIL[idx];
  // Bottom-right, where no stage puts content: current stage + one tick per stage (ticks jump there).
  return (
    <nav aria-label="Story stages" className="fixed bottom-4 right-[var(--gutter)] z-40 flex items-center gap-4 rounded-full border hairline bg-bg/90 py-1.5 pl-4 pr-2">
      <p className="label tabular-nums">
        <span className="!text-fg">{cur.n}</span> / 07 · {cur.name}
      </p>
      <ol className="hidden items-center md:flex">
        {RAIL.map((r, i) => (
          <li key={r.id}>
            <a href={`#${r.id}`} onClick={(e) => { e.preventDefault(); scrollTo(`#${r.id}`); }} aria-label={`${r.n} · ${r.name}`} aria-current={i === idx ? 'step' : undefined} className="grid h-8 w-6 place-items-center">
              <span className={`block w-px transition-all duration-500 ease-expo ${i === idx ? 'h-5 bg-accent' : i < idx ? 'h-3 bg-fg/60' : 'h-3 bg-fg/25'}`} />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

const BLOCKS = 10; // 6 photo stages, learning, IT, closing, footer

const STATS = [
  { value: 8, suffix: '+', label: 'years in sport' },
  { value: 5, suffix: '', label: 'disciplines' },
  { value: projects.length, suffix: '', label: 'projects' },
  { value: 1, suffix: '', label: 'year in IT' },
];

export default function Story() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  useEffect(() => { document.title = 'My story — Hojiakbar Sharofiddinov'; return () => { document.title = 'Hojiakbar Sharofiddinov — UI/UX Designer & Full-Stack Developer'; }; }, []);
  const toWork = () => navigate('/', { state: { section: 'work' } });
  const l = ch('05');
  const it = ch('06');
  // The first stage paints at once; the rest mount after the visitor's first interaction, one per idle slot.
  const open = useInteractionGate();
  const [count, setCount] = useState(1);
  useEffect(() => {
    if (!open || count >= BLOCKS) return;
    const next = () => setCount((c) => c + 1);
    const id = 'requestIdleCallback' in window ? requestIdleCallback(next, { timeout: 300 }) : setTimeout(next, 32) as unknown as number;
    return () => ('cancelIdleCallback' in window ? cancelIdleCallback(id) : clearTimeout(id));
  }, [open, count]);
  const show = (i: number) => i < count;

  return (
    <main id="main">
      <Rail />
      <h1 className="sr-only">My story — from the ring to the code</h1>
      {STAGES.filter((_, i) => show(i)).map((s) => (reduce ? (
        <FlowStage key={s.key} id={`story-${s.key}`} field={s.key} n={s.n} name={s.name} title={s.title} sub={s.sub} span={s.span} text={s.text}>
          {s.photo && <Picture name={s.photo} alt={s.alt ?? ''} sizes="(min-width: 1024px) 50vw, 100vw" className="block max-w-2xl" imgClassName="w-full rounded-[6px] grayscale" />}
        </FlowStage>
      ) : <PinnedStage key={s.key} s={s} first={s.key === 'intro'} />))}

      {show(6) && <FlowStage id="story-learning" field="learning" n="05" name="Learning" title={l.sport} sub={l.title} span={l.span} text={l.text}>
        <LearningCollage />
      </FlowStage>}

      {show(7) && <FlowStage id="story-it" field="it" n="06" name="IT" title="IT" sub={it.title} span={it.span} text="At 16 I stepped into IT. In one year I designed and built a museum website, a marketplace for women artisans, a home-repair booking platform and mizo.uz.">
        <div className="grid gap-12 lg:grid-cols-2">
          <CodeVisual />
          <ul className="border-b hairline">
            {projects.map((p) => (
              <li key={p.slug} className="border-t hairline">
                <Link to={`/work/${p.slug}`} className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-5">
                  <span className="label">{p.n}</span>
                  <span className="font-display text-[clamp(1.5rem,1.1rem+1.5vw,2.5rem)] font-semibold tracking-[-0.02em]"><TextRoll text={p.name} /></span>
                  <span className="label">{p.year}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </FlowStage>}

      {show(8) && <section id="story-closing" data-section="story-closing" data-section-label="07 · Closing" data-field="climax" data-field-boost="1.4" className="relative flex min-h-[100svh] flex-col justify-center py-[var(--section)]" aria-labelledby="t-closing">
        <div className="wrap">
          <dl className="grid grid-cols-2 gap-y-10 border-y hairline py-10 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="label mt-2">{s.label}</dt>
                <dd className="display text-[clamp(3.5rem,7vw,7rem)]"><Counter to={s.value} suffix={s.suffix} /></dd>
              </div>
            ))}
          </dl>
          <h2 id="t-closing" className="display mt-[clamp(4rem,9vw,8rem)] text-[clamp(2.75rem,9vw,10rem)]">
            <SplitText text="And here's what" by="char" stagger={0.02} />
            <span className="block serif-i font-normal tracking-[-0.02em]"><SplitText text="I've built." delay={0.2} /></span>
          </h2>
          <div className="mt-12">
            <MagneticButton onClick={toWork} cursor="Open" className="h-40 w-40 bg-fg text-lg text-bg sm:h-48 sm:w-48" label="See the selected works">
              See the work
            </MagneticButton>
          </div>
        </div>
      </section>}

      {show(9) && <ContactFooter />}
      {count < BLOCKS && <div className="h-[200vh]" aria-hidden />}
    </main>
  );
}
