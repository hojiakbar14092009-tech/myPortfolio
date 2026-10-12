import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useInteractionGate } from '../animations/useGate';
import { Hero } from '../sections/Hero';

// Everything below the hero is a separate chunk, mounted once the visitor interacts
// (or straight away when arriving from another page of the site).
const load = () => import('../sections/Below');
const Below = lazy(load);

export default function Home({ ready }: { ready: boolean }) {
  const location = useLocation();
  const arriving = !!(location.state as { section?: string } | null)?.section;
  const open = useInteractionGate(load) || arriving;

  return (
    <main id="main">
      <Hero ready={ready} />
      {open ? (
        <Suspense fallback={<div className="h-[300vh]" />}>
          <Below />
        </Suspense>
      ) : (
        <div className="h-[300vh]" aria-hidden />
      )}
    </main>
  );
}
