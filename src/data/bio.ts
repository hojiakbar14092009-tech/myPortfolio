import type { ImageName } from './images';
import type { Reveal } from '../components/RevealImage';

export type Motif = 'chess' | 'pitch' | 'slash' | 'bell' | 'notes' | 'code';

export type Chapter = {
  n: string;
  sport: string;
  title: string;
  span: string;
  text: string;
  photos: { name: ImageName; alt: string; pos?: string; reveal: Reveal; caption: string }[];
  motif: Motif;
  /** Background field chapter (see components/Field). */
  field: string;
  visual?: 'learning' | 'code';
};

export const intro =
  "I'm Hojiakbar Sharofiddinov — a 17-year-old UI/UX designer and full-stack developer from Tashkent. Before I wrote my first line of code, I spent years in sport. It taught me the one thing I bring to every project: discipline.";

export const chapters: Chapter[] = [
  {
    n: '01',
    sport: 'Chess',
    title: 'The first move',
    span: 'Grade 2 · 2 years',
    text: 'I entered sport in 2nd grade, and my first discipline was chess. Two years of thinking several moves ahead — the way I now plan user flows and system architecture.',
    photos: [{ name: 'chess', alt: 'Chess pieces lined up on a board against a black background', reveal: 'tiles', caption: 'Chess' }],
    motif: 'chess',
    field: 'chess',
  },
  {
    n: '02',
    sport: 'Football & Swimming',
    title: 'Team and rhythm',
    span: 'Football 3 years · Swimming 1.5 years',
    text: 'While still playing chess, I also trained in football and swimming. Football taught me teamwork and reading the field; swimming taught me rhythm, breath and endurance.',
    photos: [
      { name: 'football', alt: 'Two footballers walking side by side through red flare smoke', pos: '50% 40%', reveal: 'strips', caption: 'Football' },
      { name: 'swimming', alt: 'Hojiakbar resting at the edge of a night-lit swimming pool', pos: '50% 60%', reveal: 'blur', caption: 'Swimming' },
    ],
    motif: 'pitch',
    field: 'football',
  },
  {
    n: '03',
    sport: 'Hand-to-hand combat',
    title: 'Getting tougher',
    span: '2 years',
    text: 'I left chess and continued football alongside hand-to-hand combat. In 5th grade I left football and focused fully on combat for two years — learning to stay calm under pressure.',
    photos: [{ name: 'combat', alt: 'Two hand-to-hand combat fighters in white and blue exchanging punches', pos: '45% 50%', reveal: 'diagonal', caption: 'Hand-to-hand combat' }],
    motif: 'slash',
    field: 'combat',
  },
  {
    n: '04',
    sport: 'Boxing',
    title: 'The sport I love',
    span: '3–4 years · ongoing',
    text: "Then I found boxing — my favorite sport, which I've trained in for 3–4 years and still do. Boxing is pure discipline: show up every day, take hits, improve one detail at a time. That's exactly how I design and build.",
    photos: [{ name: 'boxing', alt: 'Hojiakbar in boxing gloves walking between heavy bags in the gym', pos: '75% 50%', reveal: 'blinds', caption: 'Boxing' }],
    motif: 'bell',
    field: 'boxing',
  },
  {
    n: '05',
    sport: 'Learning',
    title: 'Building the base',
    span: '~1 year · 5 subjects',
    text: 'Before IT, I spent about a year studying Russian, English, mathematics, history and law — languages to communicate, math to think logically, history to understand people, and law to understand rules, rights and responsibility.',
    photos: [],
    motif: 'notes',
    field: 'learning',
    visual: 'learning',
  },
  {
    n: '06',
    sport: 'IT',
    title: 'A new ring',
    span: 'Since 16 · 1 year',
    text: "At 16 I stepped into IT. In just one year I've designed and built real products: a museum website, a marketplace for women artisans, a home-repair booking platform and more. Same discipline, new ring.",
    photos: [],
    motif: 'code',
    field: 'it',
    visual: 'code',
  },
];

/*
  Learning collage. Drop photos into ./assets/learning named <key>.<ext> (e.g. russian.jpg)
  and run `npm run images`; a card shows its photo when `learning-<key>` exists, otherwise its glyph.
*/
export const subjects = [
  { key: 'russian', label: 'Русский', name: 'Russian', glyph: 'Я', why: 'to communicate' },
  { key: 'english', label: 'English', name: 'English', glyph: 'Aa', why: 'to communicate' },
  { key: 'math', label: 'Math ∑', name: 'Mathematics', glyph: '∑', why: 'to think logically' },
  { key: 'history', label: 'History', name: 'History', glyph: 'XV', why: 'to understand people' },
  { key: 'law', label: 'Law ⚖', name: 'Law', glyph: '⚖', why: 'rules, rights, responsibility' },
] as const;

export const stats = [
  { value: 8, suffix: '+', label: 'years in sport' },
  { value: 5, suffix: '', label: 'disciplines' },
  { value: 5, suffix: '', label: 'subjects before IT' },
  { value: 4, suffix: '', label: 'projects shipped' },
  { value: 1, suffix: '', label: 'year in IT' },
];

export const skills = ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Framer Motion', 'GSAP', 'Node.js', 'UI/UX Design', 'Figma', 'Git & GitHub'];
export const traits = ['Discipline', 'Chess', 'Football', 'Swimming', 'Combat', 'Boxing', 'Русский', 'English', 'Math', 'History', 'Law', 'Code'];

export const languages = ['Uzbek (native)', 'Russian', 'English'];
