// Chapter → image (by manifest name), motion layer, transition, image strength, transition seconds.
export type Cfg = { img?: string; motif: number; trans: number; str: number; dur: number };

export const FIELDS: Record<string, Cfg> = {
  none: { motif: 0, trans: 6, str: 0, dur: 1 },
  cover: { motif: 0, trans: 6, str: 0, dur: 0.6 }, // an opaque section covers the field: drawing pauses
  intro: { img: 'bg-intro', motif: 1, trans: 6, str: 0.2, dur: 1.2 },
  chess: { img: 'bg-chess', motif: 2, trans: 0, str: 0.2, dur: 1.5 },
  football: { img: 'bg-football', motif: 3, trans: 1, str: 0.2, dur: 1.2 },
  swimming: { img: 'bg-swimming', motif: 4, trans: 2, str: 0.22, dur: 1.4 },
  combat: { img: 'bg-combat', motif: 5, trans: 3, str: 0.24, dur: 0.9 },
  boxing: { img: 'bg-boxing', motif: 6, trans: 4, str: 0.24, dur: 1.2 },
  learning: { img: 'bg-learning', motif: 7, trans: 5, str: 0.18, dur: 1.3 },
  it: { img: 'bg-it', motif: 8, trans: 6, str: 0.18, dur: 1.1 },
  climax: { img: 'bg-combat', motif: 9, trans: 4, str: 0.26, dur: 1.2 },
  norisk: { motif: 11, trans: 6, str: 0, dur: 1 },
  contact: { img: 'bg-contact', motif: 10, trans: 2, str: 0.18, dur: 1.3 },
};

export const cfgOf = (k: string) => FIELDS[k] ?? FIELDS.none;

/** Messages from the page to the renderer (same shape whether it runs in a worker or on the main thread). */
export type In =
  | { type: 'init'; canvas: OffscreenCanvas; w: number; h: number; touch: boolean; colors: Colors }
  | { type: 'target'; key: string; url?: string; str: number }
  | { type: 'prefetch'; url: string }
  | { type: 'mouse'; x: number; y: number }
  | { type: 'vel'; v: number }
  | { type: 'resize'; w: number; h: number }
  | { type: 'colors'; colors: Colors }
  | { type: 'hidden'; hidden: boolean }
  | { type: 'stop' };
export type Out = { type: 'ready' } | { type: 'fail' };
export type Colors = { bg: number[]; fg: number[]; ac: number[]; dark: boolean };
