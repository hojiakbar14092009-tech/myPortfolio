import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EXPO } from '../animations/ease';
import { gsap, ScrollTrigger } from '../animations/gsap';
import { Phone } from '../components/Devices';
import { Picture } from '../components/Picture';
import { STEPS, UstaGoScreen } from '../components/UstaGoUI';
import type { Project } from '../data/projects';

/* ---------- Grand Musée: pinned horizontal walk through the halls ---------- */

const HALLS = [
  { museum: 'Louvre', city: 'Paris', work: 'Mona Lisa', author: 'Leonardo da Vinci', image: true },
  { museum: 'Musée d’Orsay', city: 'Paris', work: 'Bal du moulin de la Galette', author: 'Pierre-Auguste Renoir' },
  { museum: 'Mauritshuis', city: 'The Hague', work: 'Girl with a Pearl Earring', author: 'Johannes Vermeer' },
  { museum: 'Hermitage', city: 'Saint Petersburg', work: 'The Return of the Prodigal Son', author: 'Rembrandt van Rijn' },
  { museum: 'Prado', city: 'Madrid', work: 'Las Meninas', author: 'Diego Velázquez' },
];

export function MuseumHalls() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const el = track.current!;
      const dist = () => el.scrollWidth - window.innerWidth;
      gsap.to(el, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: { trigger: root.current, pin: true, scrub: 1, end: () => `+=${dist()}`, invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={root} className="overflow-hidden lg:h-[100svh]">
      <div ref={track} className="flex flex-col gap-10 px-[var(--gutter)] py-16 lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-[6vw] lg:py-0">
        <div className="shrink-0 lg:w-[34vw]">
          <p className="label mb-4">The walk</p>
          <p className="display text-[clamp(2.5rem,5vw,5.5rem)]">Hall by hall,<span className="block serif-i font-normal">masterpiece by masterpiece.</span></p>
        </div>
        {HALLS.map((h, i) => (
          <figure key={h.museum} className="shrink-0 lg:w-[38vw]">
            <div className="relative aspect-[4/5] border border-fg/25 p-3 lg:aspect-[4/5] lg:h-[62svh] lg:w-auto">
              <div className="h-full w-full border border-fg/15">
                {h.image ? (
                  <Picture name="museum-2" alt="The Louvre hall with the Mona Lisa, as shown in Grand Musée" sizes="(min-width: 1024px) 38vw, 100vw" imgClassName="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col justify-between bg-surface p-6 sm:p-8">
                    <span className="label">{String(i + 1).padStart(2, '0')} / {HALLS.length}</span>
                    <p className="serif-i text-[clamp(2rem,3.4vw,3.75rem)] leading-[1.02]">{h.work}</p>
                    <span className="text-sm text-muted">{h.author}</span>
                  </div>
                )}
              </div>
            </div>
            <figcaption className="mt-4 flex justify-between text-sm">
              <span className="font-medium">{h.museum}</span>
              <span className="text-muted">{h.city}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/* ---------- BarakaLi: pinned feature sequence ---------- */

export function PinnedFeatures({ p }: { p: Project }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = p.features.length;

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({
        trigger: root.current,
        pin: true,
        start: 'top top',
        end: `+=${n * 55}%`,
        onUpdate: (st) => setActive(Math.min(n - 1, Math.floor(st.progress * n))),
      });
    });
    return () => mm.revert();
  }, [n]);

  return (
    <div ref={root} className="wrap grid-12 items-center gap-y-12 py-16 lg:h-[100svh] lg:py-0">
      <div className="col-span-12 lg:col-span-5">
        <p className="label mb-4">Key features</p>
        <ol className="space-y-1">
          {p.features.map((f, i) => (
            <li key={f.title} className={`flex items-baseline gap-4 py-2 text-xl transition-colors duration-300 lg:text-2xl ${i === active ? 'text-fg' : 'lg:text-muted'}`}>
              <span className="label">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display font-medium">{f.title}</span>
              <span className="sr-only">: {f.text}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="relative col-span-12 hidden aspect-[4/3] lg:col-span-6 lg:col-start-7 lg:block" aria-hidden>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="absolute inset-0 flex flex-col justify-between rounded-[8px] bg-surface p-10"
            initial={{ opacity: 0, y: 40, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: EXPO }}
          >
            <span aria-hidden className="display text-[9rem] leading-none text-fg/10 before:content-[attr(data-n)]" data-n={String(active + 1).padStart(2, '0')} />
            <div>
              <p className="display mb-4 text-5xl">{p.features[active].title}</p>
              <p className="max-w-[40ch] text-lg text-muted">{p.features[active].text}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- BarakaLi: artisan → customer flow, scrubbed by scroll ---------- */

const FLOW = [
  { who: 'Artisan', what: 'Lists a handmade piece', note: 'Unit and wholesale price, stock, an optional 3D model — from a phone.' },
  { who: 'Admin', what: 'Verifies the artisan', note: 'Nobody sells before an admin approves them.' },
  { who: 'Customer', what: 'Places an order', note: 'One piece or a bulk batch; the slot is held.' },
  { who: 'Customer', what: 'Pays online', note: 'Unpaid orders release after 15 minutes.' },
  { who: 'Artisan', what: 'Makes & delivers', note: 'Accept within 24 hours, or the order is refunded.' },
  { who: 'BarakaLi', what: 'Keeps 5%', note: 'Everything else goes to the artisan.' },
];

export function FlowScrub() {
  const root = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const n = FLOW.length;
  const active = Math.min(n - 1, Math.floor(p * n));

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({ trigger: root.current, pin: true, start: 'top top', end: '+=220%', scrub: true, onUpdate: (st) => setP(st.progress) });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={root} className="wrap py-16 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:py-0">
      <p className="label mb-12">How an order moves · artisan → customer</p>
      <div className="relative hidden lg:block">
        <span aria-hidden className="absolute inset-x-0 top-[7px] h-px bg-fg/15">
          <span className="block h-full origin-left bg-accent" style={{ transform: `scaleX(${p})` }} />
        </span>
        <ol className="relative grid grid-cols-6 gap-4">
          {FLOW.map((s, i) => {
            const on = i <= active;
            return (
              <li key={i} className="text-sm">
                <span className={`mb-5 block h-[15px] w-[15px] rounded-full border transition-all duration-500 ${on ? 'scale-100 border-accent bg-accent' : 'scale-75 border-fg/30 bg-bg'}`} />
                <span className={`label block transition-colors duration-500 ${on ? '!text-fg' : ''}`}>{s.who}</span>
                <span className={`mt-1 block font-display text-lg font-medium transition-colors duration-500 ${on ? 'text-fg' : 'text-muted'}`}>{s.what}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-20 h-[clamp(9rem,14vw,13rem)] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ y: '60%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-40%', opacity: 0 }} transition={{ duration: 0.55, ease: EXPO }}>
              <p className="display text-[clamp(3rem,6vw,6rem)]">{FLOW[active].what}</p>
              <p className="mt-3 max-w-[50ch] text-lg text-muted">{FLOW[active].note}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <ol className="space-y-8 border-l hairline pl-6 lg:hidden">
        {FLOW.map((s, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 0.7, ease: EXPO }}>
            <span className="label">{String(i + 1).padStart(2, '0')} · {s.who}</span>
            <p className="font-display text-2xl font-medium">{s.what}</p>
            <p className="text-muted">{s.note}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- Mizo: fraud radar illustration ---------- */

const OFFERS = [
  { text: '“Guaranteed 5% income every day — today only!”', score: 92, flags: ['Guaranteed returns', 'Unrealistic rate', 'Time pressure'] },
  { text: '“Pay a 200,000 so’m fee to unlock your prize.”', score: 84, flags: ['Upfront payment', 'Prize you never entered'] },
  { text: '“Savings deposit at 20% a year from a licensed bank.”', score: 14, flags: ['Licensed institution', 'Market-level rate'] },
];

export function FraudRadar() {
  const [i, setI] = useState(0);
  const o = OFFERS[i];
  const R = 70;
  const C = Math.PI * R; // half circle
  const tone = o.score >= 60 ? 'High risk' : o.score >= 30 ? 'Medium risk' : 'Low risk';
  return (
    <div className="wrap grid-12 items-center gap-y-12">
      <div className="col-span-12 lg:col-span-5">
        <p className="label mb-4">Try the fraud radar · illustration</p>
        <p className="mb-6 max-w-[40ch] text-lg">Pick an offer the way it would arrive in a messenger. Mizo scores the risk from 0 to 100 and says why.</p>
        <div role="radiogroup" aria-label="Example offers" className="space-y-2">
          {OFFERS.map((x, k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={i === k}
              onClick={() => setI(k)}
              className={`block w-full rounded-[6px] border px-4 py-3 text-left transition-colors duration-200 ${i === k ? 'border-fg bg-fg text-bg' : 'hairline hover:border-fg/40'}`}
            >
              {x.text}
            </button>
          ))}
        </div>
      </div>
      <div className="col-span-12 flex flex-col items-center lg:col-span-6 lg:col-start-7">
        <svg viewBox="0 0 180 100" className="w-full max-w-md" aria-hidden>
          <path d={`M20 90A${R} ${R} 0 0 1 160 90`} fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="10" strokeLinecap="round" />
          <motion.path
            d={`M20 90A${R} ${R} 0 0 1 160 90`}
            fill="none"
            style={{ stroke: o.score >= 60 ? 'rgb(var(--fg))' : 'rgb(var(--accent))' }}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            animate={{ strokeDashoffset: C * (1 - o.score / 100) }}
            transition={{ duration: 0.9, ease: EXPO }}
          />
        </svg>
        <p className="display -mt-16 text-7xl tabular-nums" aria-live="polite">
          {o.score}<span className="text-2xl text-muted">/100</span>
          <span className="sr-only"> — {tone}</span>
        </p>
        <p className="label mt-2">{tone}</p>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
          {o.flags.map((f) => <li key={f}>— {f}</li>)}
        </ul>
      </div>
    </div>
  );
}

/* ---------- UstaGo: interactive booking flow ---------- */

const STEP_COPY = [
  'Describe the job and your district.',
  'Compare verified ustas by rating and price.',
  'Pick a free slot — no callbacks.',
  'Rate the work once it’s done.',
];

export function BookingFlow() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!inView || !auto || reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 2600);
    return () => clearInterval(id);
  }, [inView, auto, reduce]);

  return (
    <div ref={ref} className="wrap grid-12 items-center gap-y-12">
      <div className="col-span-12 lg:col-span-5">
        <p className="label mb-4">The flow · tap a step</p>
        <div role="tablist" aria-label="Booking steps" className="border-t hairline">
          {STEPS.map((s, i) => (
            <button
              key={s}
              role="tab"
              aria-selected={step === i}
              aria-controls="ustago-screen"
              onClick={() => { setStep(i); setAuto(false); }}
              className="relative flex w-full items-baseline gap-4 border-b hairline py-5 text-left"
            >
              <span className="label">{String(i + 1).padStart(2, '0')}</span>
              <span className={`font-display text-3xl font-medium transition-opacity duration-300 ${step === i ? '' : 'opacity-35'}`}>{s}</span>
              <span className={`ml-auto hidden max-w-[22ch] text-right text-sm text-muted transition-opacity duration-300 sm:block ${step === i ? 'opacity-100' : 'opacity-0'}`}>{STEP_COPY[i]}</span>
              {step === i && auto && !reduce && (
                <motion.span key={`bar-${step}`} className="absolute bottom-[-1px] left-0 h-px w-full origin-left bg-fg" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2.6, ease: 'linear' }} />
              )}
            </button>
          ))}
        </div>
      </div>
      <div id="ustago-screen" role="tabpanel" aria-label={`${STEPS[step]}: ${STEP_COPY[step]}`} className="col-span-12 flex justify-center lg:col-span-6 lg:col-start-7">
        <Phone alt="UstaGo booking flow">
          <UstaGoScreen step={step} />
        </Phone>
      </div>
    </div>
  );
}
