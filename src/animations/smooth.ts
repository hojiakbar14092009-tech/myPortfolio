import Lenis from 'lenis';
import { feedVelocity, scrollVelocity } from './store';

let lenis: Lenis | null = null;
const listeners = new Set<() => void>();

// Lenis drives native scroll, so Framer's useScroll and (on case pages) ScrollTrigger keep working.
// GSAP is deliberately not imported here — it only loads with the case-study chunk (see ./gsap.ts).
export function startSmoothScroll() {
  if (lenis) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return nativeVelocity();
  lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.95 });
  lenis.on('scroll', (l: Lenis) => {
    feedVelocity(l.velocity);
    listeners.forEach((f) => f());
  });
  let id = 0;
  const raf = (t: number) => {
    lenis?.raf(t);
    if (lenis && !lenis.isScrolling && scrollVelocity.get() !== 0) feedVelocity(0); // settle skew when idle
    id = requestAnimationFrame(raf);
  };
  id = requestAnimationFrame(raf);
  return () => {
    cancelAnimationFrame(id);
    lenis?.destroy();
    lenis = null;
  };
}

// Reduced motion: no smoothing, but keep a calm velocity signal at zero.
function nativeVelocity() {
  feedVelocity(0);
  return () => {};
}

export const onSmoothScroll = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };

export function scrollTo(target: number | string | HTMLElement, immediate = false) {
  if (lenis) lenis.scrollTo(target, { immediate, duration: 1.4 });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: immediate ? 'instant' : 'smooth' });
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: immediate ? 'instant' : 'smooth' });
  }
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}
