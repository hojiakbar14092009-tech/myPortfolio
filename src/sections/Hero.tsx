import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { EXPO, QUART, finePointer } from '../animations/ease';
import { useVelocitySkew } from '../animations/store';
import { SplitText } from '../animations/useSplitReveal';
import { SwapWord } from '../components/Kinetic';
import { openLightbox } from '../components/Lightbox';
import { Picture } from '../components/Picture';
import { site } from '../data/site';

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const line1X = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140]);
  const line2X = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);

  // Mouse parallax on the photo (fine pointers only).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 20 });
  const py = useSpring(my, { stiffness: 60, damping: 20 });
  const skewY = useVelocitySkew(reduce ? 0 : 3);
  const photo = useRef<HTMLDivElement>(null);
  const openPortrait = () =>
    openLightbox({ name: 'profile', alt: 'Portrait of Hojiakbar Sharofiddinov', caption: 'Hojiakbar Sharofiddinov — Tashkent', rect: photo.current!.getBoundingClientRect(), pos: '45% 30%' });
  const onMove = (e: React.PointerEvent) => {
    if (reduce || !finePointer()) return;
    mx.set((e.clientX / window.innerWidth - 0.5) * -24);
    my.set((e.clientY / window.innerHeight - 0.5) * -24);
  };

  return (
    <section ref={ref} onPointerMove={onMove} data-section="hero" data-section-label="Intro" data-field="intro" className="wrap relative flex min-h-[100svh] flex-col overflow-x-clip pb-8 pt-28 lg:pt-32" aria-labelledby="hero-title">
      <motion.div
        className="flex justify-between text-sm text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <p>{site.role}</p>
        <p className="hidden sm:block">Based in {site.location}</p>
      </motion.div>

      <h1 id="hero-title" className="display relative z-10 mt-[6vh] text-[clamp(2rem,9.4vw,13rem)] text-[#F4F2EE] mix-blend-difference lg:mt-[9vh]">
        <motion.span className="block" style={{ x: line1X }}>
          <SplitText text="Hojiakbar" by="char" stagger={0.035} play={ready} />
        </motion.span>
        <motion.span className="block text-right lg:-mt-[0.04em]" style={{ x: line2X }}>
          <SplitText text="Sharofiddinov" by="char" stagger={0.03} delay={0.15} play={ready} />
        </motion.span>
      </h1>

      <motion.div
        ref={photo}
        role="button"
        tabIndex={0}
        aria-label="Open portrait"
        data-cursor="View"
        onClick={openPortrait}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPortrait(); } }}
        className="group relative ml-auto mt-8 aspect-[4/5] w-[78%] overflow-hidden rounded-[6px] sm:w-1/2 lg:absolute lg:right-[var(--gutter)] lg:top-[clamp(11rem,20vh,13rem)] lg:m-0 lg:w-[24vw] lg:max-w-[440px]"
        style={{ y: photoY, skewY }}
      >
        <motion.div className="h-full w-full scale-110" style={{ x: px, y: py }}>
          <motion.div className="h-full w-full" initial={reduce ? false : { scale: 1.35 }} animate={ready ? { scale: 1 } : undefined} transition={{ duration: 1.8, ease: EXPO, delay: 0.3 }}>
            <Picture
              name="profile"
              alt="Portrait of Hojiakbar Sharofiddinov in sunglasses, sitting in a Tashkent park"
              sizes="(min-width: 1024px) 30vw, 90vw"
              priority
              imgClassName="h-full w-full object-cover object-[45%_30%] grayscale transition-[filter,transform] duration-700 ease-expo group-hover:scale-105 group-hover:grayscale-0 motion-reduce:transition-none"
            />
          </motion.div>
        </motion.div>
        {/* The photo is painted from the first frame (good for LCP); a page-coloured shutter lifts off it. */}
        {!reduce && (
          <motion.span aria-hidden className="absolute inset-0 origin-top bg-bg" initial={{ scaleY: 1 }} animate={ready ? { scaleY: 0 } : undefined} transition={{ duration: 1.3, ease: QUART, delay: 0.35 }} />
        )}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[120%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[1100ms] ease-expo group-hover:translate-x-[260%]" />
      </motion.div>

      <div className="mt-auto grid gap-8 pt-12 sm:grid-cols-2 lg:grid-cols-12">
        <motion.p
          className="max-w-md text-lg leading-snug lg:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EXPO, delay: 1 }}
        >
          I design and build web products end to end — from the first user flow to the{' '}
          <span className="whitespace-nowrap">last <SwapWord word="deploy." /></span>
        </motion.p>
        <motion.a
          href="#about"
          className="group/scroll hidden items-end justify-end gap-3 text-sm text-muted sm:flex lg:col-span-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <span>Scroll to begin the story</span>
          <span className="relative block h-12 w-px overflow-hidden bg-fg/15" aria-hidden>
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-fg"
              animate={reduce ? {} : { y: ['-100%', '200%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.a>
      </div>
    </section>
  );
}
