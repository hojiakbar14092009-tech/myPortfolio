import { AnimatePresence, motion, useAnimationControls, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';
import { EXPO, QUART } from '../../animations/ease';
import { thump } from '../../animations/sound';
import { COMPACT, GLYPHS, STEMS, STORY, VIEW, type Glyph } from './logoPaths';

type Props = {
  className?: string;
  variant?: 'full' | 'compact';
  /** static: final mark · draw: cuts draw in · intro: sport-story sequence, then snap + impact */
  mode?: 'static' | 'draw' | 'intro';
  /** Idle loop (light sweep + breathing). Pauses off-screen. */
  alive?: boolean;
  /** Hover: S swings half a turn, H's part; click: punch + shockwave. */
  interactive?: boolean;
  glyph?: Glyph;
  onIntroDone?: () => void;
  onPunch?: () => void;
  title?: string;
};

const STORY_STEPS = ['chess', 'pitch', 'ripple', 'ropes', 'cursor'] as const;
const STEP_MS = 420;

export function HSHLogo({
  className,
  variant = 'full',
  mode = 'draw',
  alive = true,
  interactive = true,
  glyph = 'mark',
  onIntroDone,
  onPunch,
  title = 'HSH',
}: Props) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref);
  const [hover, setHover] = useState(false);
  const intro = mode === 'intro' && !reduce;
  const [step, setStep] = useState(intro ? 0 : STORY_STEPS.length);
  const plate = useAnimationControls();
  const shock = useAnimationControls();

  const compact = variant === 'compact';
  const w = compact ? COMPACT.w : VIEW.w;
  const h = compact ? COMPACT.h : VIEW.h;
  const rx = compact ? COMPACT.rx : VIEW.rx;
  const cut = compact ? COMPACT.cut : VIEW.cut;
  const cx = w / 2;
  const cy = h / 2;
  const stems = compact ? COMPACT.stems : STEMS;
  const middle = compact ? [COMPACT.spine] : GLYPHS[glyph];
  const snapped = step >= STORY_STEPS.length;
  const draw = mode !== 'static' && !reduce;
  const live = alive && !reduce && inView && snapped;

  const punch = () => {
    if (reduce) return;
    thump();
    plate.start({ scaleX: [1, 1.1, 0.97, 1], scaleY: [1, 0.86, 1.04, 1] }, { duration: 0.5, ease: EXPO });
    shock.start({ scale: [0.3, 2.4], opacity: [0.7, 0] }, { duration: 0.7, ease: EXPO });
  };

  // Story sequence: chess → pitch → ripple → ropes → cursor → snap → impact.
  useEffect(() => {
    if (!intro) return;
    const t = STORY_STEPS.map((_, i) => setTimeout(() => setStep(i + 1), STEP_MS * (i + 1)));
    const land = setTimeout(punch, STEP_MS * STORY_STEPS.length + 750);
    const done = setTimeout(() => onIntroDone?.(), STEP_MS * STORY_STEPS.length + 1150);
    return () => { t.forEach(clearTimeout); clearTimeout(land); clearTimeout(done); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro]);

  const cutProps = { stroke: '#000', strokeWidth: cut, fill: 'none', strokeLinecap: 'square' as const, strokeLinejoin: 'miter' as const };
  const drawIn = (delay: number) => ({
    initial: draw ? { pathLength: 0 } : false,
    animate: { pathLength: snapped ? 1 : 0 },
    exit: { pathLength: 0, transition: { duration: 0.35, ease: QUART } },
    transition: { duration: 0.6, ease: QUART, delay },
  });
  const part = interactive && hover && !reduce ? (compact ? 0 : 3) : 0;

  return (
    <motion.svg
      ref={ref}
      viewBox={`0 0 ${w} ${h}`}
      overflow="visible"
      className={className}
      role="img"
      aria-label={title}
      tabIndex={-1}
      focusable="false"
      {...(interactive
        ? { onHoverStart: () => setHover(true), onHoverEnd: () => setHover(false), onTap: () => { punch(); onPunch?.(); } }
        : {})}
    >
      <defs>
        <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x={-20} y={-20} width={w + 40} height={h + 40}>
          <rect width={w} height={h} rx={rx} fill="#fff" />
          <motion.g animate={{ x: -part }} transition={{ duration: 0.5, ease: EXPO }}>
            {stems.slice(0, stems.length / 2).map((d, i) => <motion.path key={d} d={d} {...cutProps} {...drawIn(i * 0.06)} />)}
          </motion.g>
          <motion.g animate={{ x: part }} transition={{ duration: 0.5, ease: EXPO }}>
            {stems.slice(stems.length / 2).map((d, i) => <motion.path key={d} d={d} {...cutProps} {...drawIn(0.12 + i * 0.06)} />)}
          </motion.g>
          <motion.g
            style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: 'view-box' }}
            animate={{ rotate: interactive && hover && !reduce ? 180 : 0 }}
            transition={{ duration: 0.8, ease: QUART }}
          >
            <AnimatePresence initial={false}>
              {middle.map((d, i) => <motion.path key={`${glyph}-${d}`} d={d} {...cutProps} {...drawIn(0.24 + i * 0.05)} />)}
            </AnimatePresence>
          </motion.g>
        </mask>
        <linearGradient id={`g${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="rgb(var(--accent))" stopOpacity="0" />
          <stop offset=".5" stopColor="rgb(var(--accent))" stopOpacity=".95" />
          <stop offset="1" stopColor="rgb(var(--accent))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Sport story, drawn before the plate exists */}
      <AnimatePresence>
        {!snapped && (
          <motion.g key={step} fill="none" stroke="currentColor" strokeWidth={1.5} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {/* Plain SVG + CSS keyframes (see .story-* in global.css): cheap to mount on slow phones. */}
            {STORY_STEPS[step] === 'chess' &&
              STORY.chess.map((c, i) => c.on && (
                <rect key={i} className="story-pop" x={c.x} y={c.y} width={16.5} height={18} fill="currentColor" stroke="none" style={{ animationDelay: `${(i % 8) * 25}ms` }} />
              ))}
            {STORY_STEPS[step] === 'pitch' && STORY.pitch.map((d) => <path key={d} className="story-draw" pathLength={1} d={d} />)}
            {STORY_STEPS[step] === 'ripple' &&
              STORY.ripple.map((r, i) => <circle key={r} className="story-ripple" cx={cx} cy={cy} r={r} style={{ animationDelay: `${i * 50}ms` }} />)}
            {STORY_STEPS[step] === 'ropes' && STORY.ropes.map((d, i) => <path key={d} className="story-draw" pathLength={1} d={d} strokeWidth={i < 3 ? 2 : 4} style={{ animationDelay: `${i * 30}ms` }} />)}
            {STORY_STEPS[step] === 'cursor' && <path className="story-blink" d={STORY.cursor} strokeWidth={6} />}
          </motion.g>
        )}
      </AnimatePresence>

      <g>
        <motion.g animate={plate} style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: 'view-box' }}>
          <motion.rect
            width={w}
            height={h}
            rx={rx}
            fill="currentColor"
            mask={`url(#m${uid})`}
            initial={intro ? { opacity: 0, scale: 0.92 } : false}
            animate={{ opacity: snapped ? 1 : 0, scale: snapped ? 1 : 0.92 }}
            transition={{ duration: 0.35, ease: EXPO }}
            style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: 'view-box' }}
          />
          {live && (
            <g mask={`url(#m${uid})`}>
              <motion.rect
                y={0}
                width={w * 0.35}
                height={h}
                fill={`url(#g${uid})`}
                initial={{ x: -w * 0.4 }}
                animate={{ x: [-w * 0.4, w * 1.05] }}
                transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 5.5, delay: 1.2 }}
              />
            </g>
          )}
        </motion.g>
      </g>

      <motion.rect
        aria-hidden
        x={-4}
        y={-4}
        width={w + 8}
        height={h + 8}
        rx={rx + 4}
        fill="none"
        stroke="rgb(var(--accent))"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={shock}
        style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: 'view-box' }}
      />
    </motion.svg>
  );
}

/** Mark + wordmark lockup. */
export function HSHLockup({ stacked, className = '' }: { stacked?: boolean; className?: string }) {
  return (
    <span className={`inline-flex ${stacked ? 'flex-col items-start gap-3' : 'items-center gap-4'} ${className}`}>
      <HSHLogo className={stacked ? 'w-24' : 'w-16'} mode="static" alive={false} interactive={false} />
      <span className="font-display text-xl font-semibold leading-[0.95] tracking-[-0.02em]">
        Hojiakbar{stacked ? <br /> : ' '}Sharofiddinov
      </span>
    </span>
  );
}
