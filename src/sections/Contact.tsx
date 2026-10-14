import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, ArrowUpRight, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { scrollTo } from '../animations/smooth';
import { SplitText } from '../animations/useSplitReveal';
import { FlipText, MagneticButton, Scramble, TextRoll } from '../components/Kinetic';
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

/*
  The footer is the contact block: "Contact me", every channel on file (empty ones never render),
  a magnetic primary action, copy-with-toast, then the Tashkent clock, the mark and the way back up.
  The field behind it runs the contact chapter (horizon ripples, or contact.* once provided).
*/
export function ContactFooter() {
  const [toast, setToast] = useState('');
  const timer = useRef(0);
  const say = (msg: string) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(''), 2400);
  };
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      say(`${what} copied`);
    } catch {
      say(`Couldn't copy — ${text}`);
    }
  };
  const primary = site.email
    ? { label: 'Copy email', onClick: () => copy(site.email, 'Email'), aria: `Copy email ${site.email}` }
    : { label: 'Write me', href: site.socials[0].href, aria: `Write me on ${site.socials[0].label}` };

  const rows = [
    site.phone.display && { label: 'Phone', value: site.phone.display, href: site.phone.href, copy: site.phone.display.replace(/\s/g, '') },
    site.email && { label: 'Email', value: site.email, href: `mailto:${site.email}`, copy: site.email },
    ...site.socials.map((s) => ({ label: s.label, value: s.handle, href: s.href, external: true })),
  ].filter(Boolean) as { label: string; value: string; href: string; copy?: string; external?: boolean }[];

  return (
    <footer id="contact" data-section="contact" data-section-label="Contact" data-field="contact" className="relative overflow-hidden" aria-labelledby="contact-title">
      {/* scrim: the field stays alive behind, the type stays AA */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/0 via-bg/40 to-bg/80" />
      <div className="wrap relative pt-[var(--section)]">
        <p className="label mb-8"><Scramble text="05 — Contact" /></p>
        <Skew max={4}>
          <h2 id="contact-title" className="display text-[clamp(3.5rem,14vw,16rem)]">
            <SplitText text="Contact" by="char" stagger={0.03} />{' '}
            <span className="serif-i font-normal tracking-[-0.02em]"><SplitText text="me" delay={0.25} /></span>
          </h2>
        </Skew>

        <div className="mt-12 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-[clamp(1.25rem,1rem+1vw,1.75rem)] leading-snug">
            Let&rsquo;s build something from the ring to the code.
          </p>
          <MagneticButton
            {...('href' in primary ? { href: primary.href, external: true } : { onClick: primary.onClick })}
            cursor={site.email ? 'Copy' : 'Open'}
            label={primary.aria}
            className="h-40 w-40 shrink-0 bg-fg text-lg text-bg sm:h-48 sm:w-48"
          >
            {primary.label}
          </MagneticButton>
        </div>

        <ul className="mt-16 border-b hairline">
          {rows.map((r) => (
            <li key={r.label} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-t hairline py-5 sm:grid-cols-[10rem_1fr_auto]">
              <span className="label col-span-full sm:col-span-1">{r.label}</span>
              <a className="group flex min-w-0 items-center gap-3 text-[clamp(1.15rem,0.9rem+1.2vw,2rem)] font-medium tracking-[-0.01em]" href={r.href} {...(r.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <span className="truncate"><TextRoll text={r.value} /></span>
                <ArrowUpRight aria-hidden size={20} strokeWidth={1.5} className="shrink-0 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
              </a>
              {r.copy ? (
                <button type="button" onClick={() => copy(r.copy!, r.label)} aria-label={`Copy ${r.label.toLowerCase()} ${r.value}`} className="grid h-11 w-11 place-items-center rounded-full border hairline transition-colors hover:bg-fg hover:text-bg">
                  <Copy aria-hidden size={16} strokeWidth={1.5} />
                </button>
              ) : <span />}
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(4rem,9vw,8rem)] flex flex-col gap-10 pb-8 sm:flex-row sm:items-end sm:justify-between">
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
        <p className="label pb-8 text-center">Psst — type “hsh”.</p>
      </div>

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
    </footer>
  );
}
