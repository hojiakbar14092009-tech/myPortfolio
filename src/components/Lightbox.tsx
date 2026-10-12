import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { EXPO, QUART } from '../animations/ease';
import { lockScroll } from '../animations/smooth';
import { imageSet, type ImageName } from '../data/images';
import { Picture } from './Picture';

type Shot = { name: ImageName; alt: string; caption?: string; rect: DOMRect; pos?: string };
let current: Shot | null = null;
const subs = new Set<() => void>();
const set = (s: Shot | null) => { current = s; subs.forEach((f) => f()); };
export const openLightbox = (s: Shot) => set(s);

function fit(ratio: number) {
  const maxW = innerWidth * 0.9;
  const maxH = innerHeight * 0.78;
  const width = Math.min(maxW, maxH * ratio);
  const height = width / ratio;
  return { left: (innerWidth - width) / 2, top: (innerHeight - height) / 2 - 16, width, height };
}

// FLIP zoom from the clicked image; drag vertically (or Esc / ×) to close.
export function Lightbox() {
  const shot = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => current);
  const reduce = useReducedMotion();
  const close = useRef<HTMLButtonElement>(null);
  const dragY = useMotionValue(0);
  const backdrop = useTransform(dragY, [-300, 0, 300], [0.2, 1, 0.2]);

  useEffect(() => {
    if (!shot) return;
    lockScroll(true);
    const prev = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const key = (e: KeyboardEvent) => e.key === 'Escape' && set(null);
    window.addEventListener('keydown', key);
    return () => { lockScroll(false); window.removeEventListener('keydown', key); prev?.focus?.(); };
  }, [shot]);

  return (
    <AnimatePresence>
      {shot && (
        <motion.div key="lb" className="fixed inset-0 z-[88]" role="dialog" aria-modal="true" aria-label={shot.alt}>
          <motion.div className="absolute inset-0 bg-bg/95" style={{ opacity: backdrop }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onClick={() => set(null)} />
          <motion.div
            className="absolute overflow-hidden rounded-[6px] bg-surface"
            style={{ y: dragY, touchAction: 'none' }}
            initial={reduce ? { opacity: 0, ...fit(imageSet(shot.name).ratio) } : { left: shot.rect.left, top: shot.rect.top, width: shot.rect.width, height: shot.rect.height }}
            animate={{ opacity: 1, ...fit(imageSet(shot.name).ratio) }}
            exit={reduce ? { opacity: 0 } : { left: shot.rect.left, top: shot.rect.top, width: shot.rect.width, height: shot.rect.height, transition: { duration: 0.6, ease: QUART } }}
            transition={{ duration: 0.8, ease: QUART }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, i) => { if (Math.abs(i.offset.y) > 120 || Math.abs(i.velocity.y) > 600) set(null); }}
            data-cursor="Drag"
          >
            <Picture name={shot.name} alt={shot.alt} sizes="90vw" imgClassName="h-full w-full object-cover" style={{ objectPosition: shot.pos }} />
          </motion.div>
          <motion.div className="pointer-events-none absolute inset-x-0 bottom-6 flex items-end justify-between px-[var(--gutter)]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EXPO, delay: 0.3 }}>
            <p className="label">{shot.caption ?? shot.alt}</p>
            <p className="label hidden sm:block">Drag or press Esc to close</p>
          </motion.div>
          <motion.button
            ref={close}
            type="button"
            aria-label="Close photo"
            onClick={() => set(null)}
            className="absolute right-[var(--gutter)] top-6 grid h-12 w-12 place-items-center rounded-full border border-fg/20 bg-bg"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.4, ease: EXPO }}
          >
            <X size={18} strokeWidth={1.5} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
