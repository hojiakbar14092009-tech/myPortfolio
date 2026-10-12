# HSH — Hojiakbar Sharofiddinov

Personal portfolio: UI/UX designer & full-stack developer from Tashkent. *From the ring to the code.*

React 18 · Vite · TypeScript · Tailwind CSS · Framer Motion · GSAP ScrollTrigger (case studies only) · Lenis · sharp.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve dist/ on :4173
npm run lint
npm run images     # re-process photos in ./assets → public/img (+ src/data/images.json)
node scripts/og.mjs  # regenerate og.png and apple-touch-icon.png
```

## Content

- All copy lives in `src/data/` — `bio.ts`, `projects.ts`, `site.ts` (contacts render only when filled in).
- Photos: originals in `./assets` are never modified; `npm run images` grades, sharpens, upscales (max 2×) and exports AVIF/WebP/JPG + blur placeholders.
- **Learning collage:** drop photos into `assets/learning/` named `russian`, `english`, `math`, `history`, `law` (any image extension), then run `npm run images`. Each card switches from its typographic glyph to the photo automatically.
- UstaGo has no screenshots yet; its visuals are an in-code UI composition (`src/components/UstaGoUI.tsx`).

## Structure

```
src/animations   smooth scroll, velocity store, split reveals, magnetic, sound, interaction gate
src/components   logo/, cursor & FX, RevealImage + Lightbox, devices, kinetic type
src/sections     Hero, Bio (timeline + learning collage), Built (climax), Works, Services, Contact
src/case         case-study signature scenes (GSAP, lazy-loaded)
src/pages        Home, CaseStudy, LogoLab (/logo-lab, unlisted)
docs/BRAND.md    logo concept, construction, motion states
```

## Deploy

Vercel-ready (`vercel.json` SPA rewrites + immutable caching for images and fonts). `sitemap.xml`, `robots.txt` and absolute OG URLs use `SITE_URL`, falling back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL`.

Type `hsh` anywhere on the site.
