import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useState } from 'react';
import { EXPO, finePointer } from '../animations/ease';
import { SplitText } from '../animations/useSplitReveal';
import { Scramble, TextRoll } from '../components/Kinetic';
import { HSHLogo } from '../components/logo/HSHLogo';
import { Skew } from './Bio';

const SERVICES = [
  { title: 'UI/UX Design', text: 'Research, user flows, wireframes and high-fidelity interfaces in Figma — designed around what people actually need to do.', tags: ['User flows', 'Wireframes', 'Design systems', 'Prototypes'] },
  { title: 'Front-end', text: 'React and TypeScript interfaces that are fast, accessible and animated with intent.', tags: ['React', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Framer Motion'] },
  { title: 'Full-stack', text: 'APIs, databases, auth and payments — the parts users never see but always feel.', tags: ['Node.js', 'Express', 'PostgreSQL', 'Next.js', 'Prisma'] },
  { title: 'Branding', text: 'Logos and identity systems that hold up from a 24px favicon to a full-screen hero.', tags: ['Logo design', 'Identity', 'Motion marks'] },
];

// Abstract monochrome previews that follow the cursor.
function Preview({ i }: { i: number }) {
  if (i === 0) {
    return (
      <svg viewBox="0 0 120 90" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="8" y="8" width="104" height="74" rx="3" /><path d="M8 22h104" /><rect x="16" y="30" width="40" height="44" rx="2" /><path d="M64 34h40M64 44h32M64 54h36" /><rect x="64" y="62" width="22" height="10" rx="5" fill="currentColor" />
      </svg>
    );
  }
  if (i === 1) return <span className="font-mono text-6xl">{'</>'}</span>;
  if (i === 2) {
    return (
      <svg viewBox="0 0 120 90" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M60 14 104 32 60 50 16 32Z" /><path d="M16 46 60 64 104 46" /><path d="M16 60 60 78 104 60" />
      </svg>
    );
  }
  return <HSHLogo className="w-3/4" mode="draw" alive interactive={false} />;
}

export function Services() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [hovering, setHovering] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 20 });
  const sy = useSpring(y, { stiffness: 150, damping: 20 });
  const fine = finePointer();

  return (
    // Slides over the inverted Works section like a sheet — the curtain back to the base theme.
    <section
      id="services"
      data-section="services"
      data-section-label="Services"
      className="invert-scope relative z-10 -mt-[clamp(2rem,5vw,4rem)] rounded-t-[clamp(24px,4vw,56px)] py-[var(--section)] shadow-[0_-40px_80px_-40px_rgb(0_0_0/0.5)]"
      aria-labelledby="services-title"
    >
      <div className="wrap">
      <div className="mb-14 flex items-end justify-between">
        <Skew max={4}>
          <h2 id="services-title" className="display text-[clamp(2.75rem,7vw,7rem)]"><SplitText text="What I do" by="char" stagger={0.03} /></h2>
        </Skew>
        <span className="label"><Scramble text="04 — Services" /></span>
      </div>

      <ul
        className="border-b hairline"
        onPointerMove={(e) => { x.set(e.clientX); y.set(e.clientY); }}
        onPointerLeave={() => { setHovering(null); setActive(null); }}
      >
        {SERVICES.map((s, i) => {
          const open = active === i;
          return (
            <li key={s.title} className="border-t hairline" onPointerEnter={() => { if (fine) { setHovering(i); setActive(i); } }}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`svc-${i}`}
                onClick={() => setActive(open ? null : i)}
                className="group flex w-full items-baseline gap-6 py-7 text-left"
              >
                <span className="label w-8 shrink-0"><Scramble text={String(i + 1).padStart(2, '0')} /></span>
                <span className={`font-display text-[clamp(2rem,1.2rem+4vw,5rem)] font-semibold leading-none tracking-[-0.03em] transition-transform duration-500 ease-expo ${open ? 'translate-x-3 sm:translate-x-6' : ''}`}>
                  <TextRoll text={s.title} />
                </span>
                <span aria-hidden className={`ml-auto text-2xl transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
              </button>
              <div id={`svc-${i}`} className={`grid transition-[grid-template-rows] duration-500 ease-expo ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <div className="grid gap-4 pb-8 pl-14 sm:grid-cols-2">
                    <p className="max-w-[48ch] text-lg">{s.text}</p>
                    <p className="text-muted">{s.tags.join(', ')}</p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {fine && !reduce && (
        <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-30 hidden lg:block" style={{ x: sx, y: sy }}>
          <AnimatePresence>
            {hovering !== null && (
              <motion.div
                key="preview"
                className="grid h-40 w-56 -translate-x-1/2 -translate-y-[120%] place-items-center rounded-[6px] bg-fg p-6 text-bg"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.3, ease: EXPO }}
              >
                <AnimatePresence mode="wait">
                  <motion.div key={hovering} className="grid h-full w-full place-items-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <Preview i={hovering} />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
      </div>
    </section>
  );
}
