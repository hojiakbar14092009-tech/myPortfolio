import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { createElement, type ElementType } from 'react';
import { EXPO } from './ease';

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  by?: 'word' | 'char';
  /** Play on mount instead of when scrolled into view. */
  play?: boolean;
  /** Words (exact match) rendered in Instrument Serif italic. */
  italic?: string[];
};

const child: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 1, ease: EXPO } },
};

// Masked word/char reveal. Screen readers get the plain string from an sr-only copy.
export function SplitText({ text, as = 'span', className, delay = 0, stagger = 0.06, by = 'word', play, italic = [] }: Props) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  const parent: Variants = { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } };
  const trigger = play === undefined
    ? { whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } }
    : { animate: play ? 'show' : 'hidden' };

  if (reduce) return createElement(as, { className }, text);

  return createElement(
    as,
    { className },
    <span className="sr-only">{text}</span>,
    <motion.span key="split" initial="hidden" {...trigger} variants={parent} aria-hidden className="inline">
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          {by === 'word' ? (
            <motion.span variants={child} className={`inline-block ${italic.includes(w) ? 'serif-i' : ''}`}>
              {w}
            </motion.span>
          ) : (
            [...w].map((c, j) => (
              <motion.span key={j} variants={child} className="inline-block">{c}</motion.span>
            ))
          )}
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </motion.span>,
  );
}

export function Reveal({ children, delay = 0, y = 32, className }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: reduce ? 0.15 : 0.9, ease: EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}
