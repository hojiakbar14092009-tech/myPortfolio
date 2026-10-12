import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { scrollTo } from '../animations/smooth';
import { SplitText } from '../animations/useSplitReveal';
import { FlipText, MagneticButton, Scramble, SwapWord, TextRoll } from '../components/Kinetic';
import { HSHLogo } from '../components/logo/HSHLogo';
import { site } from '../data/site';
import { Skew } from './Bio';

const tashkent = new Intl.DateTimeFormat('en-GB', { timeZone: site.timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit' });

function Clock() {
  const [t, setT] = useState(() => tashkent.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setT(tashkent.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return <time><FlipText text={t} /></time>;
}

export function Contact() {
  const [toast, setToast] = useState('');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setToast('Email copied');
    } catch {
      setToast(`Copy failed — write to ${site.email}`);
    }
    setTimeout(() => setToast(''), 2400);
  };

  return (
    <section id="contact" data-section="contact" data-section-label="Contact" className="wrap pt-[var(--section)]" aria-labelledby="contact-title">
      <p className="label mb-8"><Scramble text="05 — Contact" /></p>
      <Skew max={4}>
        <h2 id="contact-title" className="display text-[clamp(3.25rem,13vw,15rem)]">
          <SplitText text="Let's work" by="char" stagger={0.03} />
          <span className="block font-normal tracking-[-0.02em]"><SwapWord word="together." /></span>
        </h2>
      </Skew>

      <div className="mt-14 flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-lg text-muted">
          Have a product in mind or a team that needs a designer who ships code? Tell me about it.
        </p>
        {site.email ? (
          <MagneticButton onClick={copy} cursor="Copy" className="h-40 w-40 bg-fg text-bg sm:h-48 sm:w-48" label={`Copy email ${site.email}`}>
            Copy email
          </MagneticButton>
        ) : (
          <MagneticButton href={site.github} external cursor="Open" className="h-40 w-40 bg-fg text-bg sm:h-48 sm:w-48">
            Open GitHub
          </MagneticButton>
        )}
      </div>

      <ul className="mt-16 flex flex-wrap gap-x-10 gap-y-3 border-t hairline pt-8 text-lg">
        {site.email && <li><a className="group" href={`mailto:${site.email}`}><TextRoll text={site.email} /></a></li>}
        {site.socials.map((s) => (
          <li key={s.label}><a className="group" href={s.href} target="_blank" rel="noreferrer"><TextRoll text={s.label} /></a></li>
        ))}
      </ul>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            className="fixed bottom-6 left-1/2 z-[75] -translate-x-1/2 rounded-full bg-fg px-5 py-3 text-sm text-bg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="wrap mt-[clamp(5rem,10vw,9rem)] pb-8">
      <div className="flex flex-col gap-10 border-t hairline pt-10 sm:flex-row sm:items-end sm:justify-between">
        <button type="button" aria-label="HSH — back to top" className="w-28 rounded-sm" onKeyDown={(e) => e.key === 'Enter' && scrollTo(0)}>
          <HSHLogo className="w-full" mode="draw" title="HSH" onPunch={() => scrollTo(0)} />
        </button>
        <dl className="grid grid-cols-2 gap-x-12 gap-y-1 text-sm">
          <dt className="label">Tashkent</dt>
          <dd><Clock /></dd>
          <dt className="label">© {new Date().getFullYear()}</dt>
          <dd>{site.name}</dd>
        </dl>
        <button type="button" onClick={() => scrollTo(0)} className="group flex items-center gap-2 self-start text-sm sm:self-auto">
          <TextRoll text="Back to top" />
          <ArrowUp size={16} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
      </div>
      <p className="label mt-8 text-center">Psst — type “hsh”.</p>
    </footer>
  );
}
