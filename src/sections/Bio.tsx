import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EXPO, QUART } from '../animations/ease';
import { useVelocitySkew } from '../animations/store';
import { Reveal, SplitText } from '../animations/useSplitReveal';
import { Counter, FlipText, Marquee, Scramble, SwapWord } from '../components/Kinetic';
import { openLightbox } from '../components/Lightbox';
import { Picture } from '../components/Picture';
import { RevealImage } from '../components/RevealImage';
import { chapters, intro, languages, skills, stats, subjects, traits, type Chapter, type Motif } from '../data/bio';
import { hasImage } from '../data/images';
import { site } from '../data/site';

export function Skew({ children, className, max = 3 }: { children: React.ReactNode; className?: string; max?: number }) {
  const skewY = useVelocitySkew(max);
  return <motion.div className={className} style={{ skewY }}>{children}</motion.div>;
}

/* ---------- Intro: words light up as you scroll ---------- */

// Each word sits in the muted colour (still AA) and lights up to full colour as you scroll.
function Word({ w, i, n, p }: { w: string; i: number; n: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, [i / n, (i + 1) / n], [0, 1]);
  if (w.startsWith('discipline')) return <><SwapWord word={w} /> </>;
  return (
    <span className="relative inline-block text-muted">
      {w}
      <motion.span aria-hidden className="absolute inset-0 text-fg" style={{ opacity }}>{w}</motion.span>
      {' '}
    </span>
  );
}

function Intro() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = intro.split(' ');
  return (
    <div className="wrap grid-12 py-[var(--section)]">
      <p className="label col-span-12 mb-8 lg:col-span-3 lg:mb-0"><Scramble text="02 — About" /></p>
      <p ref={ref} className="relative col-span-12 max-w-[30ch] font-display text-[clamp(1.75rem,1rem+3.2vw,4.25rem)] font-medium leading-[1.08] tracking-[-0.025em] lg:col-span-9">
        {reduce ? intro : words.map((w, i) => <Word key={i} w={w} i={i} n={words.length} p={scrollYProgress} />)}
      </p>
    </div>
  );
}

/* ---------- Sport motifs: each chapter has its own motion signature ---------- */

function ChessGrid() {
  return (
    <div aria-hidden className="pointer-events-none absolute -inset-[6%] -z-10 grid grid-cols-8 grid-rows-8 opacity-70">
      {Array.from({ length: 64 }, (_, i) => {
        const dark = (i + Math.floor(i / 8)) % 2 === 0;
        return (
          <motion.span
            key={i}
            className={dark ? 'bg-fg/[0.07]' : ''}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.5, ease: EXPO, delay: ((i % 8) + Math.floor(i / 8)) * 0.035 }}
          />
        );
      })}
    </div>
  );
}

function PitchAndWater() {
  const draw = { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true }, transition: { duration: 1.8, ease: QUART } };
  return (
    <svg aria-hidden viewBox="0 0 200 120" preserveAspectRatio="none" className="pointer-events-none absolute -inset-[5%] -z-10 h-[110%] w-[110%] text-fg/20" fill="none" stroke="currentColor" strokeWidth="0.4">
      <motion.path d="M2 2H98V118H2Z" {...draw} />
      <motion.path d="M98 2V118" {...draw} />
      <motion.path d="M98 46A14 14 0 1 1 98 74A14 14 0 1 1 98 46" {...draw} />
      <motion.path d="M2 38H20V82H2" {...draw} />
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx="152" cy="92" r="10" initial={{ scale: 0.2, opacity: 0.6 }} animate={{ scale: 3.2, opacity: 0 }} transition={{ duration: 3.6, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }} style={{ originX: '152px', originY: '92px' }} className="motion-reduce:hidden" />
      ))}
    </svg>
  );
}

function Slash() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`absolute left-[-20%] block h-[2px] w-[140%] origin-left ${i === 1 ? 'bg-accent' : 'bg-[#F4F2EE]'}`}
          style={{ top: `${32 + i * 14}%`, rotate: -22 }}
          initial={{ scaleX: 0, opacity: 1 }}
          whileInView={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
          viewport={{ once: true, margin: '0px 0px -25% 0px' }}
          transition={{ duration: 0.9, ease: EXPO, delay: 0.6 + i * 0.08, times: [0, 0.45, 1] }}
        />
      ))}
    </div>
  );
}

function BellRound() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '0px 0px -20% 0px' });
  const reduce = useReducedMotion();
  const [round, setRound] = useState(1);
  const [sec, setSec] = useState(180);
  useEffect(() => {
    if (!inView || reduce) return;
    const r = setInterval(() => setRound((x) => (x >= 4 ? 4 : x + 1)), 900);
    const t = setInterval(() => setSec((s) => (s <= 0 ? 180 : s - 1)), 1000);
    return () => { clearInterval(r); clearInterval(t); };
  }, [inView, reduce]);
  const clock = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  return (
    <div ref={ref} aria-hidden className="mb-4 flex items-center justify-between border-y hairline py-3">
      <span className="flex items-center gap-3">
        <motion.svg key={round} viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" animate={reduce ? {} : { rotate: [0, -18, 14, -10, 6, 0] }} transition={{ duration: 0.7 }}>
          <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 20a2 2 0 0 0 4 0" />
        </motion.svg>
        <span className="label">Round <FlipText text={String(round)} className="text-fg" /> / 4</span>
      </span>
      <span className="label">Ongoing · <FlipText text={clock} className="text-fg" /></span>
    </div>
  );
}

function MotifLayer({ m }: { m: Motif }) {
  if (m === 'chess') return <ChessGrid />;
  if (m === 'pitch') return <PitchAndWater />;
  return null;
}

/* ---------- Learning collage ---------- */

const PLACES = [
  { l: 0, t: 8, w: 27, r: -7 },
  { l: 25, t: 0, w: 25, r: 4 },
  { l: 49, t: 12, w: 26, r: -3 },
  { l: 74, t: 2, w: 25, r: 6 },
  { l: 36, t: 50, w: 27, r: -4 },
];

function Scales({ hover }: { hover: boolean }) {
  const draw = { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true }, transition: { duration: 1.4, ease: QUART, delay: 0.5 } };
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <motion.path d="M32 12V54M20 54H44" {...draw} />
      <motion.circle cx="32" cy="10" r="2" {...draw} />
      <motion.g animate={{ rotate: hover ? -9 : 0 }} transition={{ type: 'spring', stiffness: 120, damping: 8 }} style={{ originX: '32px', originY: '18px' }}>
        <motion.path d="M10 18H54M14 18L8 34M14 18L20 34M6 34Q14 42 22 34M50 18L44 34M50 18L56 34M42 34Q50 42 58 34" {...draw} />
      </motion.g>
    </svg>
  );
}

function SubjectCard({ s, i }: { s: (typeof subjects)[number]; i: number }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const p = PLACES[i];
  const photo = `learning-${s.key}`;
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      className={`group relative xl:absolute xl:left-[var(--l)] xl:top-[var(--t)] xl:w-[var(--w)] sm:col-span-2 ${i === 3 ? 'sm:col-start-2' : ''} ${i === 4 ? 'col-span-2 mx-auto w-1/2 sm:mx-0 sm:w-auto' : ''}`}
      style={{ '--l': `${p.l}%`, '--t': `${p.t}%`, '--w': `${p.w}%` } as React.CSSProperties}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 200, scale: 0.55, rotate: p.r * 4, rotateX: 45 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: p.r, rotateX: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      whileHover={reduce ? {} : { rotate: 0, scale: 1.07, y: -12, zIndex: 20 }}
      transition={{ duration: 1.3, ease: EXPO, delay: i * 0.12 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      <span data-alive className="absolute right-2 -top-4 z-10 inline-flex xl:-right-2 animate-[float_6s_ease-in-out_infinite] items-center gap-2 rounded-full bg-fg px-3 py-1 font-mono text-xs text-bg" style={{ animationDelay: `${-i * 1.3}s` }}>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {s.label}
      </span>
      {hasImage(photo) ? (
        <button
          type="button"
          data-cursor="View"
          aria-label={`Open photo: ${s.name}`}
          className="block aspect-[4/5] w-full overflow-hidden rounded-[4px] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]"
          onClick={() => openLightbox({ name: photo, alt: s.name, caption: `${s.name} — ${s.why}`, rect: ref.current!.getBoundingClientRect() })}
        >
          <Picture name={photo} alt={s.name} sizes="(min-width: 1024px) 26vw, 45vw" imgClassName="h-full w-full object-cover transition-[filter,transform] duration-700 ease-expo [@media(hover:hover)]:grayscale group-hover:scale-105 group-hover:grayscale-0" />
        </button>
      ) : (
        <div className="flex aspect-[4/5] flex-col justify-between rounded-[4px] border hairline bg-surface p-5 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]">
          <span className="label">{String(i + 1).padStart(2, '0')} / 05</span>
          <span className="grid flex-1 place-items-center">
            {s.key === 'law' ? (
              <span className="block h-[62%] w-[62%] text-fg"><Scales hover={hover} /></span>
            ) : (
              <span aria-hidden className="relative font-display text-[clamp(3.5rem,8vw,7.5rem)] font-medium leading-none">
                <span className="block transition-opacity duration-500 group-hover:opacity-0">{s.glyph}</span>
                <span className="serif-i absolute inset-0 text-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">{s.glyph}</span>
              </span>
            )}
          </span>
          <span className="flex flex-col items-start gap-0.5">
            <span className="font-display text-xl font-medium">{s.name}</span>
            <span className="text-xs text-muted">{s.why}</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}

function LearningCollage() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 pt-4 sm:grid-cols-6 xl:relative xl:block xl:h-[clamp(36rem,52vw,50rem)] xl:pt-0 [perspective:1400px]">
      {subjects.map((s, i) => <SubjectCard key={s.key} s={s} i={i} />)}
    </div>
  );
}

/* ---------- Code chapter ---------- */

const CODE = [
  "const sports = ['chess', 'football', 'swimming', 'combat', 'boxing'];",
  "const base = ['русский', 'english', 'math', 'history', 'law'];",
  'const me = [...sports, ...base].reduce(train, discipline);',
  "me.build(['Grand Musée', 'BarakaLi', 'Mizo', 'UstaGo']);",
  '// same discipline, new ring',
];

function CodeVisual() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState(reduce ? Infinity : 0);
  const total = CODE.join('\n').length;
  useEffect(() => {
    if (reduce || !ref.current) return;
    const el = ref.current;
    let id = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      id = window.setInterval(() => setChars((c) => (c >= total ? (clearInterval(id), c) : c + 2)), 20);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); clearInterval(id); };
  }, [reduce, total]);

  const starts = CODE.map((_, i) => CODE.slice(0, i).reduce((a, l) => a + l.length + 1, 0));
  const typing = chars < total;
  return (
    <motion.div
      ref={ref}
      className="max-w-2xl rounded-[6px] border hairline bg-surface p-5 font-mono text-[13px] leading-7 sm:p-7 sm:text-sm"
      initial={reduce ? false : { rotateX: 25, y: 60, opacity: 0 }}
      whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      transition={{ duration: 1.2, ease: EXPO }}
      style={{ transformPerspective: 1000 }}
    >
      <div className="mb-4 flex items-center justify-between text-muted" aria-hidden>
        <span>ring.ts</span><span className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-fg/20" />)}</span>
      </div>
      <pre className="whitespace-pre-wrap break-words">
        <span className="sr-only">{CODE.join('\n')}</span>
        {CODE.map((line, i) => {
          const shown = line.slice(0, Math.max(0, chars - starts[i]));
          const caretHere = typing ? chars >= starts[i] && chars < starts[i] + line.length + 1 : i === CODE.length - 1;
          return (
            <div key={i} aria-hidden className={line.startsWith('//') ? 'text-muted' : ''}>
              <span className="mr-4 select-none text-fg/25">{String(i + 1).padStart(2, '0')}</span>
              {shown || ' '}
              {caretHere && <span className="ml-px inline-block h-4 w-2 translate-y-0.5 animate-[caret_1s_steps(1)_infinite] bg-accent motion-reduce:animate-none" />}
            </div>
          );
        })}
      </pre>
    </motion.div>
  );
}

function ChapterMedia({ c }: { c: Chapter }) {
  if (c.visual === 'learning') return <LearningCollage />;
  if (c.visual === 'code') return <CodeVisual />;
  if (c.photos.length === 2) {
    return (
      <div className="relative isolate grid [overflow-x:clip] grid-cols-2 gap-[var(--gutter)]">
        <MotifLayer m={c.motif} />
        {c.photos.map((p, i) => (
          <RevealImage key={p.name} name={p.name} alt={p.alt} pos={p.pos} reveal={p.reveal} delay={i * 0.15} caption={{ title: p.caption, meta: c.span.split(' · ')[i] ?? c.span }} sizes="(min-width: 1024px) 28vw, 45vw" className={`aspect-[3/4] ${i ? 'mt-[18%]' : ''}`} />
        ))}
      </div>
    );
  }
  const p = c.photos[0];
  const small = p.name === 'chess'; // source is only 299px wide — keep it small and honest
  return (
    <div className={`relative isolate [overflow-x:clip] ${small ? 'max-w-md' : ''}`}>
      {c.motif === 'bell' && <BellRound />}
      <MotifLayer m={c.motif} />
      <RevealImage name={p.name} alt={p.alt} pos={p.pos} reveal={p.reveal} caption={{ title: p.caption, meta: c.span }} sizes={small ? '448px' : '(min-width: 1024px) 60vw, 100vw'} className={small ? 'aspect-[16/9]' : 'aspect-[16/10]'} />
      {c.motif === 'slash' && <Slash />}
    </div>
  );
}

/* ---------- Timeline ---------- */

function Timeline() {
  const ref = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.6', 'end 0.6'] });
  const c = chapters[active];

  return (
    <div className="wrap grid-12 relative">
      <aside className="sticky top-0 col-span-4 hidden h-[100svh] flex-col justify-center lg:flex" aria-hidden>
        <p className="label mb-6">From the ring to the code</p>
        <div className="relative h-[clamp(8rem,16vw,15rem)] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={c.n}
              className="display absolute left-0 top-0 block text-[clamp(8rem,16vw,15rem)] leading-[0.85]"
              initial={{ y: '100%', rotateX: -60 }}
              animate={{ y: '0%', rotateX: 0 }}
              exit={{ y: '-100%', rotateX: 60 }}
              transition={{ duration: 0.8, ease: QUART }}
            >
              {c.n}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="mt-6 h-16">
          <p className="font-display text-2xl font-medium"><Scramble text={c.sport} play /></p>
          <p className="label mt-1"><Scramble text={c.span} play /></p>
        </div>
        <div className="mt-6 flex gap-2">
          {chapters.map((x, i) => (
            <span key={x.n} className="relative h-px w-8 overflow-hidden bg-fg/20">
              <motion.span className="absolute inset-0 origin-left bg-fg" animate={{ scaleX: i <= active ? 1 : 0 }} transition={{ duration: 0.6, ease: EXPO }} />
            </span>
          ))}
        </div>
      </aside>

      <ol ref={ref} className="relative col-span-12 lg:col-span-8 lg:col-start-5">
        <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-fg/10">
          <motion.span className="block h-full w-full origin-top bg-accent" style={{ scaleY: scrollYProgress }} />
        </span>
        {chapters.map((ch, i) => (
          <motion.li
            key={ch.n}
            data-section={`chapter-${ch.n}`}
            data-section-label={`${ch.n} · ${ch.sport}`}
            className="flex min-h-[85svh] flex-col justify-center gap-8 py-20 pl-6 sm:pl-12"
            onViewportEnter={() => setActive(i)}
            viewport={{ amount: 0.4 }}
          >
            <div className="flex items-baseline gap-4 lg:hidden">
              <span className="display text-6xl">{ch.n}</span>
              <span className="label">{ch.span}</span>
            </div>
            <Skew>
              <p className="label mb-3 hidden lg:block"><Scramble text={`Chapter ${ch.n} · ${ch.span}`} /></p>
              <h3 className="font-display text-[clamp(2.5rem,1.4rem+4.5vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.03em]">
                <SplitText text={ch.sport} by="char" stagger={0.025} />
              </h3>
              <p className="serif-i mt-2 text-[clamp(1.6rem,1.2rem+1.6vw,2.6rem)] text-muted"><SplitText text={ch.title} delay={0.2} /></p>
            </Skew>
            <Reveal><p className="max-w-[56ch] text-lg leading-relaxed">{ch.text}</p></Reveal>
            <ChapterMedia c={ch} />
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- Details ---------- */

function Details() {
  return (
    <div className="pt-[var(--section)]">
      <dl className="wrap grid grid-cols-2 gap-y-12 border-t hairline pt-12 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse">
            <dt className="label mt-2"><Scramble text={s.label} /></dt>
            <dd className="display text-[clamp(3.5rem,7vw,7rem)]"><Counter to={s.value} suffix={s.suffix} /></dd>
          </div>
        ))}
      </dl>
      <div className="my-[clamp(4rem,10vw,8rem)] space-y-2 border-y hairline py-6">
        <Marquee items={skills} className="font-display text-[clamp(2rem,5vw,4.5rem)] font-medium tracking-tight" />
        <Marquee items={traits} reverse base={40} className="serif-i text-[clamp(1.5rem,3.4vw,3rem)] text-muted" />
      </div>
      <div className="wrap grid gap-10 text-lg sm:grid-cols-3">
        <Reveal><p className="label mb-3"><Scramble text="Languages" /></p><p>{languages.join(', ')}</p></Reveal>
        <Reveal delay={0.08}><p className="label mb-3"><Scramble text="Location" /></p><p>{site.location}</p></Reveal>
        <Reveal delay={0.16}><p className="label mb-3"><Scramble text="Currently" /></p><p>Building products & training boxing</p></Reveal>
      </div>
    </div>
  );
}

export function Bio() {
  return (
    <section id="about" aria-labelledby="bio-title" data-section="about" data-section-label="About">
      <Intro />
      <div className="wrap mb-12">
        <Skew max={4}>
          <h2 id="bio-title" className="display text-[clamp(3rem,10vw,11rem)]">
            <SplitText text="From the ring" by="char" stagger={0.03} />
            <span className="block serif-i font-normal tracking-[-0.02em]"><SplitText text="to the code." delay={0.2} /></span>
          </h2>
        </Skew>
      </div>
      <Timeline />
      <Details />
    </section>
  );
}
