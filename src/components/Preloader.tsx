import { animate, motion, useAnimationControls } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { QUART } from '../animations/ease';
import { whoosh } from '../animations/sound';
import { introStore } from '../animations/store';
import { HSHLogo } from './logo/HSHLogo';

/*
  The logo tells the sport story (chess → pitch → water → ropes → cursor), snaps into HSH with an impact,
  then FLIP-flies into the header slot while the curtain splits. ~2.9s, skippable by click or any key.
  `onReveal` fires as the curtain starts opening so the hero animates in underneath it.
*/
export function Preloader({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const logoBox = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const fly = useAnimationControls();
  const setN = (v: number) => { if (counter.current) counter.current.textContent = String(Math.round(v)).padStart(3, '0'); };

  // The counter writes straight to the DOM — no React render per frame.
  useEffect(() => {
    introStore.set('playing');
    const c = animate(0, 100, { duration: 2.4, ease: [0.65, 0, 0.35, 1], onUpdate: setN });
    return () => c.stop();
  }, []);

  const leave = async () => {
    if (leaving) return;
    setLeaving(true);
    setN(100);
    whoosh();
    onReveal();
    const target = document.querySelector('[data-header-logo]')?.getBoundingClientRect();
    const from = logoBox.current?.getBoundingClientRect();
    if (target && from) {
      await fly.start(
        {
          x: target.left + target.width / 2 - (from.left + from.width / 2),
          y: target.top + target.height / 2 - (from.top + from.height / 2),
          scale: target.width / from.width,
        },
        { duration: 0.9, ease: QUART },
      );
    }
    introStore.set('done');
    onDone();
  };

  useEffect(() => {
    const skip = () => leave();
    window.addEventListener('keydown', skip, { once: true });
    return () => window.removeEventListener('keydown', skip);
  });

  const half = 'absolute inset-x-0 h-1/2 bg-[#0B0B0C]';
  return (
    <div className="fixed inset-0 z-[80] text-[#F4F2EE]" onClick={leave} role="presentation">
      <motion.div className={`${half} top-0`} animate={leaving ? { y: '-100%' } : {}} transition={{ duration: 0.9, ease: QUART }} />
      <motion.div className={`${half} bottom-0`} animate={leaving ? { y: '100%' } : {}} transition={{ duration: 0.9, ease: QUART }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-10">
        <motion.div ref={logoBox} animate={fly} className="w-40 sm:w-52">
          <HSHLogo className="w-full" mode="intro" alive={false} interactive={false} onIntroDone={leave} />
        </motion.div>
        <motion.div className="label flex w-40 justify-between tabular-nums text-[#96938C] sm:w-52" animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: 0.2 }}>
          <span>From the ring</span>
          <span ref={counter}>000</span>
        </motion.div>
      </div>
      <motion.button
        type="button"
        className="label absolute bottom-6 right-[var(--gutter)] text-[#96938C] hover:text-[#F4F2EE]"
        animate={{ opacity: leaving ? 0 : 1 }}
        onClick={(e) => { e.stopPropagation(); leave(); }}
      >
        Skip intro
      </motion.button>
    </div>
  );
}
