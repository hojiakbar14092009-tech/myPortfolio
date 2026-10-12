/*
  HSH — "The Canvas"
  ------------------------------------------------------------
  A solid plate (the ring canvas, seen from above) with HSH cut out of it as negative space.

  Construction (viewBox 0 0 132 72, 12-unit grid, cut width 8):
    plate      132 × 72, corner radius 10 (11 × 6 grid units)
    stems      x = 14, 38 | 94, 118      y = 12 → 60   (4 units of air top & bottom)
    spine      one stroke: left crossbar (y 48) → S (two r=12 bowls centred on 66,36) → right crossbar (y 24)
  The whole mark is 180° rotationally symmetric about (66, 36): turn it upside down and it still reads HSH.
  The S is a rope under tension — its two tails ARE the crossbars, so it literally holds both H's together.
*/

export const VIEW = { w: 132, h: 72, rx: 10, cut: 8, cx: 66, cy: 36 };

export const STEMS = ['M14 12V60', 'M38 12V60', 'M94 12V60', 'M118 12V60'];
export const SPINE = 'M14 48H54A12 12 0 1 0 66 36A12 12 0 1 1 78 24H118';

// Section-aware glyphs replace the spine. Crossbars stay so the H's never break.
export const CROSSBARS = ['M14 48H38', 'M94 24H118'];
export const GLYPHS = {
  mark: [SPINE],
  ropes: [...CROSSBARS, 'M38 24H94', 'M38 36H94', 'M38 48H94'], // ring side-view: post · ropes · post
  code: [...CROSSBARS, 'M58 22L48 36L58 50', 'M74 22L84 36L74 50'], // < >
} as const;
export type Glyph = keyof typeof GLYPHS;

// Compact mark (favicon / collapsed header): 72 × 72, inner stems + spine only.
export const COMPACT = {
  w: 72,
  h: 72,
  rx: 12,
  cut: 9,
  stems: ['M12 12V60', 'M60 12V60'],
  spine: 'M12 48H24A12 12 0 1 0 36 36A12 12 0 1 1 48 24H60',
};

// Intro story — the sport journey, drawn inside the plate bounds before it snaps into HSH.
export const STORY = {
  chess: Array.from({ length: 32 }, (_, i) => ({ x: (i % 8) * 16.5, y: Math.floor(i / 8) * 18, on: (i + Math.floor(i / 8)) % 2 === 0 })),
  pitch: ['M4 4H128V68H4Z', 'M66 4V68', 'M66 22A14 14 0 1 1 66 50A14 14 0 1 1 66 22', 'M4 22H22V50H4', 'M128 22H110V50H128'],
  ripple: [10, 22, 34],
  ropes: ['M0 24H132', 'M0 36H132', 'M0 48H132', 'M6 10V62', 'M126 10V62'],
  cursor: 'M66 20V52',
};

/* ---------- Explored concepts (rendered in /logo-lab) ---------- */

const tiles = (rows: string[], ox: number) =>
  rows.flatMap((r, y) => [...r].map((c, x) => (c === 'X' ? `<rect x="${ox + x * 12}" y="${y * 12}" width="10" height="10"/>` : ''))).join('');
const H = ['X.X', 'X.X', 'XXX', 'X.X', 'X.X'];
const S = ['XXX', 'X..', 'XXX', '..X', 'XXX'];
const OLD_SPINE = 'M6 42H42A12 12 0 1 0 54 30A12 12 0 1 1 66 18H102';
const OLD_STEMS = 'M6 6V54M30 6V54M78 6V54M102 6V54';

export type Concept = {
  id: string;
  name: string;
  idea: string;
  ownable: string;
  vb: string;
  svg: string; // uses currentColor; mask ids are suffixed per render
  scores: { originality: number; legibility: number; simplicity: number; favicon: number; story: number; motion: number; fit: number };
};

export const CONCEPTS: Concept[] = [
  {
    id: 'canvas',
    name: 'The Canvas',
    idea: 'HSH cut out of a solid plate — the ring canvas from above. The S tails are the crossbars; the mark is 180° symmetric.',
    ownable: 'A seal, not a monogram: the letters exist only as absence. Nobody else’s HSH looks like a stamped plate.',
    vb: '0 0 132 72',
    svg: `<defs><mask id="M"><rect width="132" height="72" rx="10" fill="#fff"/><g stroke="#000" stroke-width="8" fill="none" stroke-linecap="square"><path d="${STEMS.join('')}"/><path d="${SPINE}"/></g></mask></defs><rect width="132" height="72" rx="10" fill="currentColor" mask="url(#M)"/>`,
    scores: { originality: 9, legibility: 9, simplicity: 9, favicon: 9, story: 9, motion: 10, fit: 10 },
  },
  {
    id: 'mirror',
    name: 'Symmetry',
    idea: 'Monoline ambigram: four stems and one S whose tails become the crossbars. Reads the same rotated 180°.',
    ownable: 'Clever construction, but thin strokes make it feel like a typical line monogram.',
    vb: '-4 -4 116 68',
    svg: `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="square" stroke-linejoin="round"><path d="${OLD_STEMS}"/><path d="${OLD_SPINE}"/></g>`,
    scores: { originality: 6, legibility: 8, simplicity: 9, favicon: 6, story: 6, motion: 8, fit: 8 },
  },
  {
    id: 'ring',
    name: 'The Ring',
    idea: 'The monogram fought inside a square ring: four corner posts, double ropes, HSH in the centre.',
    ownable: 'Strong story, but the frame turns it into a badge and the letters vanish at small sizes.',
    vb: '0 0 96 96',
    svg: `<g fill="none" stroke="currentColor"><rect x="8" y="8" width="80" height="80" stroke-width="2.5"/><rect x="14" y="14" width="68" height="68" stroke-width="1.2" opacity=".5"/></g><g fill="currentColor"><rect x="3" y="3" width="10" height="10"/><rect x="83" y="3" width="10" height="10"/><rect x="3" y="83" width="10" height="10"/><rect x="83" y="83" width="10" height="10"/></g><g transform="translate(16 33.8) scale(.593)" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="square"><path d="${OLD_STEMS}"/><path d="${OLD_SPINE}"/></g>`,
    scores: { originality: 6, legibility: 5, simplicity: 4, favicon: 3, story: 9, motion: 7, fit: 6 },
  },
  {
    id: 'knight',
    name: 'Knight’s Path',
    idea: 'On an 8×8 board, a path with knight-move stops traces H·S·H.',
    ownable: 'Unique premise, but the S collapses into a maze; reads as a circuit diagram.',
    vb: '0 0 96 96',
    svg: `<g fill="currentColor" opacity=".35">${Array.from({ length: 64 }, (_, i) => `<circle cx="${6 + (i % 8) * 12}" cy="${6 + Math.floor(i / 8) * 12}" r="1.2"/>`).join('')}</g><path d="M6 78V18M6 54H30M30 18V78M42 66H54V54H42V30H54V18M66 18V78M66 54H90M90 18V78" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><g fill="currentColor">${[[6, 18], [30, 78], [54, 18], [42, 66], [90, 78]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g>`,
    scores: { originality: 8, legibility: 3, simplicity: 4, favicon: 3, story: 7, motion: 7, fit: 5 },
  },
  {
    id: 'punch',
    name: 'One Punch Line',
    idea: 'A single continuous stroke draws H → S → H, like a punch trajectory or a line of code.',
    ownable: 'Great to animate, but reads as a signature; the S kink looks accidental.',
    vb: '0 0 112 60',
    svg: `<path d="M6 54V6V30H30V6V54C36 56 40 56 44 52C52 58 66 56 66 46C66 34 44 38 44 24C44 12 62 10 68 14L82 6V54V30H106V6V54" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`,
    scores: { originality: 6, legibility: 6, simplicity: 6, favicon: 4, story: 7, motion: 9, fit: 6 },
  },
  {
    id: 'block',
    name: 'Negative Block (full bleed)',
    idea: 'Same plate, but the stems cut edge to edge, splitting it into slabs.',
    ownable: 'Bolder, but the H’s read as “!” and the plate stops feeling whole.',
    vb: '0 0 132 72',
    svg: `<defs><mask id="M"><rect width="132" height="72" rx="10" fill="#fff"/><g stroke="#000" stroke-width="8" fill="none" stroke-linecap="square"><path d="M14 -4V76M38 -4V76M94 -4V76M118 -4V76"/><path d="${SPINE}"/></g></mask></defs><rect width="132" height="72" rx="10" fill="currentColor" mask="url(#M)"/>`,
    scores: { originality: 8, legibility: 5, simplicity: 8, favicon: 6, story: 7, motion: 8, fit: 7 },
  },
  {
    id: 'grid',
    name: 'Modular Grid',
    idea: '3×5 tile letters. The same tiles can reassemble into a chessboard, a ring or a cursor.',
    ownable: 'Great system, but at rest it is a pixel font — the most generic look in the set.',
    vb: '0 0 130 58',
    svg: `<g fill="currentColor">${tiles(H, 0)}${tiles(S, 46)}${tiles(H, 92)}</g>`,
    scores: { originality: 4, legibility: 8, simplicity: 7, favicon: 7, story: 7, motion: 9, fit: 5 },
  },
  {
    id: 'stencil',
    name: 'Gym Stencil',
    idea: 'Heavy stencil letters with one shared cut — the top rope — running through all three.',
    ownable: 'Legible and loud, but stencil type is a common gym/military trope.',
    vb: '0 0 132 60',
    svg: `<defs><mask id="M"><rect width="132" height="60" fill="#fff"/><rect y="28" width="132" height="3" fill="#000"/></mask></defs><g fill="currentColor" mask="url(#M)"><path d="M0 0H12V24H28V0H40V60H28V36H12V60H0Z"/><path d="M48 0H84V12H60V24H84V60H48V48H72V36H48Z"/><path d="M92 0H104V24H120V0H132V60H120V36H104V60H92Z"/></g>`,
    scores: { originality: 4, legibility: 9, simplicity: 8, favicon: 8, story: 5, motion: 5, fit: 5 },
  },
];
