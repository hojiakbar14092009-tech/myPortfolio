import { useEffect } from 'react';
import { ScrollTrigger } from '../animations/gsap';
import type { Project } from '../data/projects';
import { BookingFlow, FlowScrub, FraudRadar, MuseumHalls, PinnedFeatures } from './Modules';

// Each project's signature scene. Lazy-loaded with GSAP so the case hero never waits for it.
export default function Signature({ p }: { p: Project }) {
  useEffect(() => {
    // Pinned scenes measure once fonts/images below have settled.
    const id = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => clearTimeout(id);
  }, [p.slug]);

  if (p.slug === 'grand-musee') return <MuseumHalls />;
  if (p.slug === 'barakali') return <><PinnedFeatures p={p} /><FlowScrub /></>;
  if (p.slug === 'mizo') return <FraudRadar />;
  return <BookingFlow />;
}
