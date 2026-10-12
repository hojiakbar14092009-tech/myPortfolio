import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { finePointer } from './animations/ease';
import { startSmoothScroll } from './animations/smooth';
import { CoverTransitionProvider } from './components/CoverTransition';
import { Cursor, EasterEgg, RouteCurtain, ScrollProgress, TabFx } from './components/Fx';
import { Lightbox } from './components/Lightbox';
import { Nav } from './components/Nav';
import { Preloader } from './components/Preloader';
import { RippleFilter } from './components/RevealImage';
import Home from './pages/Home';

const CaseStudy = lazy(() => import('./pages/CaseStudy'));
const LogoLab = lazy(() => import('./pages/LogoLab'));
const Dust = lazy(() => import('./components/Dust'));

function firstVisit() {
  try {
    if (sessionStorage.getItem('hsh-intro')) return false;
    sessionStorage.setItem('hsh-intro', '1');
  } catch { /* storage blocked: show the intro */ }
  return !matchMedia('(prefers-reduced-motion: reduce)').matches;
}
// Module scope: StrictMode double-invokes state initializers, which would consume the flag.
const SHOW_INTRO = location.pathname === '/' && firstVisit();

function useIdle(delay: number) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setIdle(true), delay);
    return () => clearTimeout(id);
  }, [delay]);
  return idle;
}

export default function App() {
  const [stage, setStage] = useState<'intro' | 'reveal' | 'done'>(SHOW_INTRO ? 'intro' : 'done');
  const { pathname } = useLocation();
  const idle = useIdle(SHOW_INTRO ? 3500 : 1200);
  const dust = idle && finePointer() && innerWidth >= 1024 && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => startSmoothScroll(), []);
  // Each route is its own canonical URL (origin comes from the build-time tag in index.html).
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (link) link.href = new URL(pathname, link.href).href;
  }, [pathname]);

  return (
    <CoverTransitionProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[95] focus:rounded focus:bg-fg focus:px-4 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      {dust && <Suspense fallback={null}><Dust /></Suspense>}
      <Nav />
      <div className="relative z-[1]">
        <Routes>
          <Route path="/" element={<Home ready={stage !== 'intro'} />} />
          <Route path="/work/:slug" element={<Suspense fallback={<div className="h-[100svh]" />}><CaseStudy /></Suspense>} />
          <Route path="/logo-lab" element={<Suspense fallback={<div className="h-[100svh]" />}><LogoLab /></Suspense>} />
          <Route path="*" element={<Home ready />} />
        </Routes>
      </div>
      <RouteCurtain key={pathname} />
      {stage !== 'done' && <Preloader onReveal={() => setStage('reveal')} onDone={() => setStage('done')} />}
      <ScrollProgress />
      <Lightbox />
      <EasterEgg />
      <TabFx />
      <RippleFilter />
      <Cursor />
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />
    </CoverTransitionProvider>
  );
}
