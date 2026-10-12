import type { Project } from '../data/projects';
import { Picture } from './Picture';
import { UstaGoCover } from './UstaGoUI';

// Shared by the case-study hero and the card->case transition overlay, so both frames match exactly.
// The 1.12 scale from the bottom crops the screenshot's own nav bar out of view.
export function HeroBackdrop({ p, priority }: { p: Pick<Project, 'hero' | 'cover' | 'name'>; priority?: boolean }) {
  const img = p.hero ?? p.cover;
  return (
    <>
      {img ? (
        <Picture name={img} alt={`${p.name} interface`} sizes="100vw" priority={priority} imgClassName="h-full w-full origin-bottom scale-[1.12] object-cover object-bottom grayscale brightness-[.62] contrast-[1.05]" />
      ) : (
        <UstaGoCover />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35" />
    </>
  );
}
