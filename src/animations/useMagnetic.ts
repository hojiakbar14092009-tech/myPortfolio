import { useEffect, useRef } from 'react';
import { useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { finePointer } from './ease';

// Pulls an element toward the pointer while hovered; springs back on leave (elastic when asked).
export function useMagnetic<T extends HTMLElement>(strength = 0.35, elastic = false) {
  const ref = useRef<T>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = elastic ? { stiffness: 220, damping: 9, mass: 0.7 } : { stiffness: 180, damping: 18, mass: 0.6 };
  const x = useSpring(mx, spring);
  const y = useSpring(my, spring);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !finePointer()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx.set((e.clientX - (r.left + r.width / 2)) * strength);
      my.set((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => { mx.set(0); my.set(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [mx, my, reduce, strength]);

  return { ref, x, y };
}
