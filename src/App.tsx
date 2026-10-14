import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { startSmoothScroll, lockScroll } from './animations/smooth';
import { CoverTransitionProvider } from './components/CoverTransition';
import { Cursor, EasterEgg, RouteCurtain, ScrollProgress, TabFx } from './components/Fx';
import { Lightbox } from './components/Lightbox';
import { Nav } from './components/Nav';
import { Preloader } from './components/Preloader';
import { RippleFilter } from './components/RevealImage';
import Home from './pages/Home';

const CaseStudy = lazy(() => import('./pages/CaseStudy'));
const Story = lazy(() => import('./pages/Story'));
const LogoLab = lazy(() => import('./pages/LogoLab'));
const Field = lazy(() => import('./components/Field'));

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
function firstVisit() {
  try {
    if (sessionStorage.getItem('hsh-intro')) return false;
    sessionStorage.setItem('hsh-intro', '1');
  } catch { /* storage blocked: show the intro */ }
  return true;
}
// Module scope: StrictMode double-invokes state initializers, which would consume the flag.
const SHOW_INTRO = location.pathname === '/' && firstVisit();
if (SHOW_INTRO) document.documentElement.dataset.intro = '';

export default function App() {
  const [stage, setStage] = useState<'intro' | 'reveal' | 'done'>(SHOW_INTRO ? 'intro' : 'done');
  const { pathname } = useLocation();

  useEffect(() => startSmoothScroll(), []);
  // Each route is its own canonical URL (origin comes from the build-time tag in index.html).
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (link) link.href = new URL(pathname, link.href).href;
  }, [pathname]);

  // While the intro holds, the page waits under the curtain: no scrolling, no focus.
  const holding = stage !== 'done';
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-site], .site-header');
    els.forEach((el) => { el.inert = holding; });
    lockScroll(holding);
    if (!holding) {
      delete document.documentElement.dataset.intro;
      document.documentElement.style.removeProperty('--curtain');
      document.documentElement.style.removeProperty('--curtain-y');
    }
  }, [holding]);

  return (
    <CoverTransitionProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[95] focus:rounded focus:bg-fg focus:px-4 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <Suspense fallback={null}><Field /></Suspense>
      <Nav />
      {/* No z-index: a stacking context here would cut the hero name's mix-blend off from the field behind it. */}
      <div className="relative" data-site>
        <Routes>
          <Route path="/" element={<Home ready={stage !== 'intro'} />} />
          <Route path="/story" element={<Suspense fallback={<div className="h-[100svh]" />}><Story /></Suspense>} />
          <Route path="/work/:slug" element={<Suspense fallback={<div className="h-[100svh]" />}><CaseStudy /></Suspense>} />
          <Route path="/logo-lab" element={<Suspense fallback={<div className="h-[100svh]" />}><LogoLab /></Suspense>} />
          <Route path="*" element={<Home ready />} />
        </Routes>
      </div>
      <RouteCurtain key={pathname} />
      {stage !== 'done' && <Preloader reduce={REDUCE} onReveal={() => setStage('reveal')} onDone={() => setStage('done')} />}
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
