import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown', 'scroll'] as const;

/**
 * Below-the-fold gate. On a direct page load, heavy sections wait for the visitor's first
 * interaction (or an idle fallback) so the first screen never competes with them.
 * In-app navigations (the visitor already interacted) open immediately.
 */
export function useInteractionGate(prefetch?: () => Promise<unknown>) {
  const { key } = useLocation();
  const [open, setOpen] = useState(key !== 'default');

  useEffect(() => {
    if (open) return;
    const go = () => setOpen(true);
    EVENTS.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    window.addEventListener('hsh:below', go, { once: true });
    const fallback = setTimeout(go, 12000);
    const warm = prefetch ? setTimeout(prefetch, 2500) : 0;
    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, go));
      window.removeEventListener('hsh:below', go);
      clearTimeout(fallback);
      clearTimeout(warm);
    };
  }, [open, prefetch]);

  return open;
}

export const requestBelow = () => window.dispatchEvent(new Event('hsh:below'));
