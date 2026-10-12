import { useEffect, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { scrollTo } from '../animations/smooth';
import { Bio } from './Bio';
import { Built } from './Built';
import { Contact, Footer } from './Contact';
import { Services } from './Services';
import { Works } from './Works';

const STAGES = [Bio, Built, Works, Services, () => <><Contact /><Footer /></>];

// Sections mount one per idle slot so no single task blocks the main thread on load.
const idle = (f: () => void) =>
  typeof requestIdleCallback === 'function' ? requestIdleCallback(f, { timeout: 400 }) : setTimeout(f, 32);

export default function Below() {
  const location = useLocation();
  const navType = useNavigationType();
  const section = (location.state as { section?: string } | null)?.section;
  const savedY = (() => { try { return Number(sessionStorage.getItem('home-y')) || 0; } catch { return 0; } })();
  const restoring = !!section || (navType === 'POP' && savedY > 0);
  const [count, setCount] = useState(restoring ? STAGES.length : 1);

  useEffect(() => {
    if (count >= STAGES.length) return;
    idle(() => setCount((c) => c + 1));
  }, [count]);

  // Arriving from another page: jump to the requested section, or restore position on Back.
  useEffect(() => {
    if (!restoring) return;
    const id = setTimeout(() => {
      if (section) scrollTo(`#${section}`, true);
      else scrollTo(savedY, true);
      try { sessionStorage.removeItem('home-y'); } catch { /* ignore */ }
    }, 60);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoring, section]);

  return (
    <>
      {STAGES.slice(0, count).map((S, i) => <S key={i} />)}
      {count < STAGES.length && <div className="h-[200vh]" aria-hidden />}
    </>
  );
}
