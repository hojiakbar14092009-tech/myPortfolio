import { motionValue, useSpring, useTransform } from 'framer-motion';
import { useSyncExternalStore } from 'react';

/* ---------- Scroll velocity (px/frame, signed) — fed by Lenis or a native fallback ---------- */
export const scrollVelocity = motionValue(0);
export const scrollDirection = motionValue<1 | -1>(1);

export function feedVelocity(v: number) {
  scrollVelocity.set(v);
  if (Math.abs(v) > 0.2) scrollDirection.set(v > 0 ? 1 : -1);
}

/** Skew (deg) that follows scroll speed and settles back — for headings and images. */
export function useVelocitySkew(max = 4, axis: 1 | -1 = 1) {
  const smooth = useSpring(scrollVelocity, { stiffness: 300, damping: 40, mass: 0.4 });
  return useTransform(smooth, [-40, 0, 40], [-max * axis, 0, max * axis], { clamp: true });
}

/* ---------- Tiny external stores ---------- */
function createStore<T>(initial: T) {
  let value = initial;
  const subs = new Set<() => void>();
  return {
    get: () => value,
    set: (v: T) => { if (v !== value) { value = v; subs.forEach((f) => f()); } },
    subscribe: (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; },
  };
}

export const sectionStore = createStore<string>('hero');
export const useSection = () => useSyncExternalStore(sectionStore.subscribe, sectionStore.get, sectionStore.get);

export const themeStore = createStore<'dark' | 'light'>(
  (typeof document !== 'undefined' && (document.documentElement.dataset.theme as 'dark' | 'light')) || 'dark',
);
export const useThemeValue = () => useSyncExternalStore(themeStore.subscribe, themeStore.get, themeStore.get);
export function setTheme(t: 'dark' | 'light') {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0B0B0C' : '#F4F2EE');
  try { localStorage.setItem('hsh-theme', t); } catch { /* private mode: not persisted */ }
  themeStore.set(t);
}

/** Header-logo flag: hidden while the preloader's logo flies into its place. */
export const introStore = createStore<'playing' | 'done'>('done');
export const useIntro = () => useSyncExternalStore(introStore.subscribe, introStore.get, introStore.get);
