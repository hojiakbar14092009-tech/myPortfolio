import { motion, useReducedMotion } from 'framer-motion';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXPO, QUART } from '../animations/ease';
import { scrollTo } from '../animations/smooth';
import { whoosh } from '../animations/sound';
import { routeFx } from './Fx';
import { HSHLogo } from './logo/HSHLogo';
import { bySlug } from '../data/projects';
import { HeroBackdrop } from './HeroBackdrop';

/*
  Shared-element transition card -> case study. The overlay renders the case hero's exact
  backdrop full-viewport; it opens from the card's rect via clip-path, then the route swaps
  underneath and the overlay fades onto the identical hero.
*/
type Cover = { slug: string; rect: DOMRect };
const Ctx = createContext<(c: Cover) => void>(() => {});
export const useOpenProject = () => useContext(Ctx);

export function CoverTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [cover, setCover] = useState<Cover | null>(null);
  const [phase, setPhase] = useState<'open' | 'fade'>('open');

  const open = useCallback((c: Cover) => {
    try { sessionStorage.setItem('home-y', String(window.scrollY)); } catch { /* ignore */ }
    if (reduce) {
      navigate(`/work/${c.slug}`);
      scrollTo(0, true);
      return;
    }
    whoosh();
    setPhase('open');
    setCover(c);
  }, [navigate, reduce]);

  const r = cover?.rect;
  const from = r
    ? `inset(${r.top}px ${window.innerWidth - r.right}px ${window.innerHeight - r.bottom}px ${r.left}px round 8px)`
    : '';

  return (
    <Ctx.Provider value={open}>
      {children}
      {cover && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[65] bg-surface"
          initial={{ clipPath: from, opacity: 1 }}
          animate={phase === 'open' ? { clipPath: 'inset(0px 0px 0px 0px round 0px)' } : { opacity: 0 }}
          transition={phase === 'open' ? { duration: 0.9, ease: QUART } : { duration: 0.45, delay: 0.15 }}
          onAnimationComplete={() => {
            if (phase === 'open') {
              routeFx.skipNext = true; // the morph is the transition; no curtain on top of it
              navigate(`/work/${cover.slug}`);
              scrollTo(0, true);
              requestAnimationFrame(() => setPhase('fade'));
            } else setCover(null);
          }}
        >
          <motion.div className="relative h-full w-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <HeroBackdrop p={bySlug(cover.slug)!} />
          </motion.div>
          {/* HSH flash at the centre of the wipe */}
          <motion.div
            className="absolute left-1/2 top-1/2 w-32 -translate-x-1/2 -translate-y-1/2 text-[#F4F2EE]"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={phase === 'open' ? { opacity: [0, 1, 0], scale: [0.6, 1, 1.25] } : { opacity: 0 }}
            transition={{ duration: 0.9, ease: EXPO, times: [0, 0.45, 1] }}
          >
            <HSHLogo className="w-full" mode="static" alive={false} interactive={false} />
          </motion.div>
        </motion.div>
      )}
    </Ctx.Provider>
  );
}
