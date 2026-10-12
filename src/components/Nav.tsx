import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { EXPO, QUART } from '../animations/ease';
import { lockScroll, scrollTo } from '../animations/smooth';
import { sound } from '../animations/sound';
import { setTheme, useIntro, useSection, useThemeValue, useVelocitySkew } from '../animations/store';
import { useMagnetic } from '../animations/useMagnetic';
import { requestBelow } from '../animations/useGate';
import { TextRoll } from './Kinetic';
import { HSHLogo } from './logo/HSHLogo';
import type { Glyph } from './logo/logoPaths';

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'contact', label: 'Contact' },
];

// The mark answers the section you're in: ring ropes in the boxing chapter, a code bracket in the work.
const glyphFor = (s: string): Glyph => (s === 'chapter-04' ? 'ropes' : s === 'work' ? 'code' : 'mark');

function SoundToggle() {
  const on = useSyncExternalStore(sound.subscribe, () => sound.enabled);
  return (
    <button type="button" onClick={() => sound.toggle()} aria-pressed={on} aria-label={on ? 'Turn interface sounds off' : 'Turn interface sounds on'} className="grid h-11 w-11 place-items-center rounded-full">
      <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
        {[0.5, 1, 0.7, 0.9].map((h, i) => (
          <motion.span
            key={i}
            className="block w-[2px] origin-bottom bg-current"
            style={{ height: '100%' }}
            animate={on ? { scaleY: [h, 0.25, 1, h] } : { scaleY: 0.2 }}
            transition={on ? { duration: 0.9 + i * 0.15, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
          />
        ))}
      </span>
    </button>
  );
}

export function Nav() {
  const theme = useThemeValue();
  const intro = useIntro();
  const section = useSection();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const { scrollY } = useScroll();
  const skewX = useVelocitySkew(8, -1);
  const mag = useMagnetic<HTMLDivElement>(0.3);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Scroll down: mark compacts and links step aside. Scroll up: everything returns.
  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (Math.abs(v - prev) < 2) return;
    setCompact(v > 240 && v > prev && !open);
  });

  useEffect(() => { lockScroll(open); }, [open]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    if (pathname !== '/') navigate('/', { state: { section: id } });
    else if (document.getElementById(id)) scrollTo(`#${id}`);
    else {
      // Lower sections not mounted yet: mount them, then Below scrolls to the section from state.
      navigate('/', { state: { section: id }, replace: true });
      requestBelow();
    }
  };
  const home = () => (pathname === '/' ? scrollTo(0) : navigate('/'));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 text-[#F4F2EE] mix-blend-difference">
        <div className="wrap flex h-20 items-center justify-between">
          <motion.div ref={mag.ref} style={{ x: mag.x, y: mag.y, skewX }} className="relative h-8 w-[60px]" data-header-logo>
            <Link to="/" aria-label="HSH — back to top" className="absolute inset-0 block rounded-sm" onClick={(e) => { e.preventDefault(); home(); }}>
              <motion.span className="absolute inset-0 block" animate={{ opacity: intro === 'done' && !compact ? 1 : 0, scale: compact ? 0.7 : 1 }} transition={{ duration: 0.35, ease: EXPO }}>
                {intro === 'done' && <HSHLogo className="h-full w-full" glyph={glyphFor(section)} mode="static" />}
              </motion.span>
              <motion.span className="absolute inset-y-0 left-0 block aspect-square" animate={{ opacity: compact ? 1 : 0, scale: compact ? 1 : 0.6 }} transition={{ duration: 0.35, ease: EXPO }}>
                <HSHLogo className="h-full w-full" variant="compact" mode="static" alive={false} />
              </motion.span>
            </Link>
          </motion.div>
          <nav aria-label="Primary" className="hidden md:block">
            <motion.ul className="flex gap-8 text-sm" animate={{ opacity: compact ? 0 : 1, y: compact ? -12 : 0 }} transition={{ duration: 0.3, ease: EXPO }} style={{ pointerEvents: compact ? 'none' : 'auto' }}>
              {LINKS.map((l) => (
                <li key={l.id}>
                  <a href={`/#${l.id}`} onClick={(e) => { e.preventDefault(); go(l.id); }} className="group block py-1">
                    <TextRoll text={l.label} />
                  </a>
                </li>
              ))}
            </motion.ul>
          </nav>
          <div className="flex items-center gap-1">
            <SoundToggle />
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="grid h-11 w-11 place-items-center rounded-full"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button type="button" className="h-11 px-2 text-sm md:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col justify-end bg-bg px-[var(--gutter)] pb-12 md:hidden"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.8, ease: QUART }}
          >
            <ol className="space-y-2">
              {LINKS.map((l, i) => (
                <li key={l.id} className="overflow-hidden">
                  <motion.button
                    type="button"
                    autoFocus={i === 0}
                    onClick={() => go(l.id)}
                    className="display flex w-full items-baseline gap-4 py-1 text-left text-[clamp(3rem,16vw,5rem)]"
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.8, ease: EXPO, delay: 0.25 + i * 0.06 }}
                  >
                    <span className="label">{String(i + 1).padStart(2, '0')}</span>
                    {l.label}
                  </motion.button>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
