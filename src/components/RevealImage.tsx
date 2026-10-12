import { animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from 'framer-motion';
import { useRef, useState } from 'react';
import { EXPO, QUART, finePointer } from '../animations/ease';
import { useVelocitySkew } from '../animations/store';
import { imageSet, type ImageName } from '../data/images';
import { openLightbox } from './Lightbox';
import { Picture } from './Picture';

export type Reveal = 'clip' | 'diagonal' | 'strips' | 'blinds' | 'tiles' | 'blur' | 'unfold';

type Props = {
  name: ImageName;
  alt: string;
  sizes: string;
  reveal?: Reveal;
  className?: string;
  pos?: string;
  caption?: { title: string; meta: string };
  delay?: number;
};

// Entrances that act on the figure itself (the others use overlay panels below).
const FIGURE: Partial<Record<Reveal, Variants>> = {
  clip: { hidden: { clipPath: 'inset(100% 0% 0% 0%)' }, show: { clipPath: 'inset(0% 0% 0% 0%)' } },
  diagonal: { hidden: { clipPath: 'polygon(0% 0%, 0% 0%, 0% 0%)' }, show: { clipPath: 'polygon(0% 0%, 220% 0%, 0% 220%)' } },
  unfold: { hidden: { rotateX: 70, y: 90, opacity: 0 }, show: { rotateX: 0, y: 0, opacity: 1 } },
};

// Displacement ripple shared by every image (one filter, animated on hover).
export function RippleFilter() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="hsh-ripple">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="4" />
        <feDisplacementMap id="hsh-ripple-map" in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

/**
 * Every photo arrives with a crafted entrance (varied per use), parallaxes and skews with scroll,
 * tilts toward the pointer, goes from grey to colour with a light sweep and a ripple on hover,
 * shows a caption, and opens in the lightbox.
 */
export function RevealImage({ name, alt, sizes, reveal = 'clip', className = '', pos, caption, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const shown = inView || !!reduce;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const py = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-6%', '6%']);
  const skewY = useVelocitySkew(reduce ? 0 : 2.2);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rotateY = useSpring(tx, { stiffness: 120, damping: 16 });
  const rotateX = useSpring(ty, { stiffness: 120, damping: 16 });
  const [ripple, setRipple] = useState(false);
  const s = imageSet(name);

  const open = () => openLightbox({ name, alt, caption: caption ? `${caption.title} — ${caption.meta}` : alt, rect: ref.current!.getBoundingClientRect(), pos });
  const enter = () => {
    if (reduce || !finePointer()) return;
    setRipple(true);
    const map = document.getElementById('hsh-ripple-map');
    animate(28, 0, { duration: 0.9, ease: EXPO, onUpdate: (v) => map?.setAttribute('scale', v.toFixed(2)), onComplete: () => setRipple(false) });
  };
  const move = (e: React.PointerEvent) => {
    if (reduce || !finePointer()) return;
    const r = e.currentTarget.getBoundingClientRect();
    tx.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    ty.set(((e.clientY - r.top) / r.height - 0.5) * -8);
  };
  const leave = () => { tx.set(0); ty.set(0); };

  const variants = reduce ? undefined : FIGURE[reveal];
  return (
    <motion.div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Open photo: ${alt}`}
      data-cursor="View"
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`group relative isolate overflow-hidden rounded-[4px] bg-surface ${className}`}
      style={{ skewY, transformPerspective: 1200, originY: reveal === 'unfold' ? 1 : 0.5 }}
      variants={variants}
      initial={variants ? 'hidden' : false}
      animate={variants ? (shown ? 'show' : 'hidden') : undefined}
      transition={{ duration: 1.3, ease: QUART, delay }}
    >
      <div aria-hidden className="absolute inset-0 scale-110 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(${s.blur})` }} />
      <motion.div className="absolute inset-0" style={{ rotateX, rotateY, transformPerspective: 900 }}>
        <motion.div className="absolute inset-x-0 -inset-y-[8%]" style={{ y: py }}>
          <motion.div
            className="h-full w-full"
            initial={reduce ? false : { scale: 1.3, filter: reveal === 'blur' ? 'blur(26px)' : 'blur(0px)' }}
            animate={shown ? { scale: 1, filter: 'blur(0px)' } : undefined}
            transition={{ duration: 1.7, ease: EXPO, delay }}
          >
            <div className="h-full w-full transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.08] motion-reduce:transition-none" style={{ filter: ripple ? 'url(#hsh-ripple)' : undefined }}>
              <Picture
                name={name}
                alt={alt}
                sizes={sizes}
                imgClassName="h-full w-full object-cover transition-[filter] duration-700 ease-expo [@media(hover:hover)]:grayscale group-hover:grayscale-0 group-focus-visible:grayscale-0"
                style={{ objectPosition: pos }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* entrance overlays (page-coloured panels that leave) */}
      {!reduce && reveal === 'strips' && (
        <div aria-hidden className="absolute inset-0 flex">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.span key={i} className="h-full flex-1 bg-bg" animate={shown ? { y: i % 2 ? '101%' : '-101%' } : undefined} transition={{ duration: 1.1, ease: QUART, delay: delay + i * 0.07 }} />
          ))}
        </div>
      )}
      {!reduce && reveal === 'blinds' && (
        <div aria-hidden className="absolute inset-0 flex flex-col">
          {Array.from({ length: 8 }, (_, i) => (
            <motion.span key={i} className="w-full flex-1 origin-top bg-bg" animate={shown ? { scaleY: 0 } : undefined} transition={{ duration: 0.9, ease: QUART, delay: delay + i * 0.06 }} />
          ))}
        </div>
      )}
      {!reduce && reveal === 'tiles' && (
        <div aria-hidden className="absolute inset-0 grid grid-cols-4 grid-rows-3">
          {Array.from({ length: 12 }, (_, i) => (
            <motion.span key={i} className="bg-bg" animate={shown ? { scale: 0, opacity: 0 } : undefined} transition={{ duration: 0.7, ease: QUART, delay: delay + ((i * 7) % 12) * 0.05 }} />
          ))}
        </div>
      )}

      {/* hover light sweep */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[120%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[1100ms] ease-expo group-hover:translate-x-[260%]" />

      {caption && (
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-end justify-between bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10 text-[#F4F2EE] transition-transform duration-500 ease-expo group-hover:translate-y-0 group-focus-visible:translate-y-0">
          <span className="font-display text-lg font-medium">{caption.title}</span>
          <span className="label !text-[#F4F2EE]/75">{caption.meta}</span>
        </div>
      )}
    </motion.div>
  );
}
