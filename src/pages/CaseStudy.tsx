import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { EXPO } from '../animations/ease';
import { useInteractionGate } from '../animations/useGate';
import { Reveal, SplitText } from '../animations/useSplitReveal';

// The signature scenes (and GSAP with them) load only once the rest of the page opens.
const Signature = lazy(() => import('../case/Signature'));
import { useOpenProject } from '../components/CoverTransition';
import { Laptop, Phone } from '../components/Devices';
import { HeroBackdrop } from '../components/HeroBackdrop';
import { Counter, Scramble } from '../components/Kinetic';
import { RevealImage } from '../components/RevealImage';
import { Picture } from '../components/Picture';
import { bySlug, projects, type Project } from '../data/projects';
import { Footer } from '../sections/Contact';
import { UstaGoCover } from '../components/UstaGoUI';

/** Device mockups rotate into place as they scroll through the viewport. */
function Tilt3D({ children, axis, className = '' }: { children: React.ReactNode; axis: 'x' | 'y'; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const rot = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [axis === 'x' ? 38 : -40, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.82, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [120, 0]);
  return (
    <div ref={ref} className={`[perspective:1600px] ${className}`}>
      <motion.div style={axis === 'x' ? { rotateX: rot, scale, y, originY: 1 } : { rotateY: rot, scale, y, originX: 0 }}>{children}</motion.div>
    </div>
  );
}

function Block({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`wrap grid-12 gap-y-6 py-[clamp(4rem,8vw,8rem)] ${className}`}>
      <h2 className="label col-span-12 lg:col-span-3"><Scramble text={label} /></h2>
      <div className="col-span-12 lg:col-span-9">{children}</div>
    </section>
  );
}

function Hero({ p }: { p: Project }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  return (
    <header ref={ref} className="relative h-[100svh] overflow-hidden text-[#F4F2EE]">
      <motion.div className="absolute inset-0 overflow-hidden" style={{ y }}>
        <HeroBackdrop p={p} priority />
      </motion.div>
      <div className="wrap absolute inset-x-0 bottom-0 pb-10">
        <p className="label mb-4 !text-[#F4F2EE]/70">{p.n} — Case study</p>
        <h1 className="display text-[clamp(3.5rem,13vw,13rem)]"><SplitText text={p.name} by="char" stagger={0.03} play /></h1>
        <motion.p className="mt-4 max-w-[48ch] text-lg" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EXPO, delay: 0.5 }}>
          {p.value}
        </motion.p>
      </div>
    </header>
  );
}

export default function CaseStudy() {
  const { slug = '' } = useParams();
  const p = bySlug(slug);
  const open = useOpenProject();
  const nextRef = useRef<HTMLDivElement>(null);
  const rest = useInteractionGate();

  useEffect(() => {
    if (!p) return;
    document.title = `${p.name} — Hojiakbar Sharofiddinov`;
    return () => { document.title = 'Hojiakbar Sharofiddinov — UI/UX Designer & Full-Stack Developer'; };
  }, [p]);

  if (!p) return <Navigate to="/" replace />;
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  const hasShots = p.shots.desktop?.length || p.shots.mobile;

  return (
    <main id="main">
      <Hero p={p} />

      <section className="wrap grid gap-8 border-b hairline py-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><p className="label mb-2">Role</p><p>{p.role}</p></div>
        <div><p className="label mb-2">Year</p><p>{p.year}</p></div>
        <div><p className="label mb-2">Stack</p><p>{p.stack.join(', ')}</p></div>
        <div className="flex flex-col gap-1">
          <p className="label mb-1">Links</p>
          {p.live && <a href={p.live} target="_blank" rel="noreferrer" className="link-u inline-flex w-fit items-center gap-1">Live site <ArrowUpRight size={14} /></a>}
          {p.repo && <a href={p.repo} target="_blank" rel="noreferrer" className="link-u inline-flex w-fit items-center gap-1">Source code <ArrowUpRight size={14} /></a>}
          {!p.live && !p.repo && <p className="text-muted">Links coming soon</p>}
        </div>
      </section>

      {rest ? (<>
      <Block label="Overview">
        <Reveal><p className="max-w-[34ch] font-display text-[clamp(1.6rem,1rem+2.4vw,3.25rem)] font-medium leading-[1.12] tracking-[-0.02em]">{p.overview}</p></Reveal>
      </Block>

      <Block label="Problem">
        <p className="serif-i mb-10 max-w-[22ch] text-[clamp(2.25rem,1.4rem+3.6vw,5rem)] leading-[1]"><SplitText text={p.problem.lead} /></p>
        <ol className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {p.problem.points.map((pt, i) => (
            <li key={i}>
              <Reveal delay={i * 0.08}>
                <span className="label">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-3 border-t hairline pt-4 text-lg">{pt}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Block>

      <Block label="Solution">
        <Reveal><p className="max-w-[44ch] text-[clamp(1.25rem,1rem+1vw,1.75rem)] leading-snug">{p.solution}</p></Reveal>
      </Block>

      <Suspense fallback={<div className="h-[100svh]" />}><Signature p={p} /></Suspense>

      {p.slug !== 'barakali' && (
        <Block label="Key features">
          <ul className="grid gap-x-[var(--gutter)] gap-y-10 md:grid-cols-2">
            {p.features.map((f, i) => (
              <li key={f.title} className="relative pt-5">
                {/* each feature builds: rule draws, index decodes, title rises, text follows */}
                <motion.span aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-fg/25" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 1.1, ease: EXPO, delay: (i % 2) * 0.15 }} />
                <span className="label"><Scramble text={String(i + 1).padStart(2, '0')} /></span>
                <h3 className="mt-2 font-display text-2xl font-medium"><SplitText text={f.title} delay={0.1 + (i % 2) * 0.15} /></h3>
                <Reveal delay={0.25 + (i % 2) * 0.15}><p className="mt-2 max-w-[44ch] text-muted">{f.text}</p></Reveal>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {p.numbers && (
        <section className="wrap py-[clamp(4rem,8vw,8rem)]">
          <dl className="grid grid-cols-2 gap-y-12 border-t hairline pt-10 lg:grid-cols-4">
            {p.numbers.map((n) => (
              <div key={n.label} className="flex flex-col-reverse">
                <dt className="label mt-2">{n.label}</dt>
                <dd className="display text-[clamp(3rem,7vw,6.5rem)]"><Counter to={n.value} prefix={n.prefix} suffix={n.suffix} /></dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {hasShots && (
        <section className="wrap py-[clamp(4rem,8vw,8rem)]" aria-label="Screens">
          <div className="grid items-end gap-[var(--gutter)] lg:grid-cols-[1fr_auto]">
            {p.shots.desktop?.[0] && <Tilt3D axis="x"><Laptop shot={p.shots.desktop[0]} alt={`${p.name} on desktop`} /></Tilt3D>}
            {p.shots.mobile && <Tilt3D axis="y" className="flex justify-center"><Phone shot={p.shots.mobile} alt={`${p.name} on mobile`} /></Tilt3D>}
          </div>
          {p.shots.desktop?.[1] && (
            <RevealImage name={p.shots.desktop[1]} alt={`${p.name} — another screen`} reveal="unfold" sizes="100vw" className="mt-[var(--gutter)] aspect-[16/10] rounded-[8px]" caption={{ title: p.name, meta: 'Interface' }} />
          )}
        </section>
      )}

      <Block label={p.team ? 'Team & stack' : 'My role & stack'}>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="mb-3 text-2xl font-display font-medium">{p.role}</p>
            {p.team && <p className="text-muted">Built by a team of {p.team.length}: {p.team.join(', ')}.</p>}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-lg">
            {p.stack.map((s) => <li key={s} className="border-b hairline pb-1">{s}</li>)}
          </ul>
        </div>
      </Block>

      <Block label="Results">
        <ul className="space-y-4">
          {p.impact.map((x) => <li key={x} className="max-w-[60ch] border-t hairline pt-4 text-lg"><Reveal>{x}</Reveal></li>)}
        </ul>
      </Block>

      <section className="wrap pt-[clamp(4rem,8vw,8rem)]">
        <Link
          to={`/work/${next.slug}`}
          data-cursor="Next"
          className="group block border-t hairline pt-8"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            open({ slug: next.slug, rect: nextRef.current!.getBoundingClientRect() });
          }}
        >
          <p className="label mb-4">Next project</p>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            {/* outlined name; a solid copy wipes across it on hover */}
            <p className="display relative text-[clamp(3rem,11vw,11rem)] transition-transform duration-700 ease-expo group-hover:translate-x-4">
              <span className="text-transparent [-webkit-text-stroke:1px_rgb(var(--fg))]">{next.name}</span>
              <span aria-hidden className="absolute inset-0 transition-[clip-path] duration-700 ease-in-out-quart [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)] group-focus-visible:[clip-path:inset(0_0%_0_0)]">{next.name}</span>
            </p>
            <div ref={nextRef} className="aspect-[16/10] w-full max-w-sm overflow-hidden rounded-[8px] bg-surface transition-[clip-path] duration-700 ease-expo [clip-path:inset(10%_10%_10%_10%_round_8px)] group-hover:[clip-path:inset(0%_0%_0%_0%_round_8px)]">
              {next.cover ? <Picture name={next.cover} alt="" sizes="384px" imgClassName="h-full w-full scale-125 object-cover object-top transition-transform duration-1000 ease-expo group-hover:scale-100" /> : <UstaGoCover playing />}
            </div>
          </div>
        </Link>
      </section>
      <Footer />
      </>) : <div className="h-[200vh]" aria-hidden />}
    </main>
  );
}
