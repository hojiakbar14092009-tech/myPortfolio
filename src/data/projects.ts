import type { ImageName } from './images';

export type Slug = 'grand-musee' | 'barakali' | 'mizo' | 'ustago';

export type Project = {
  slug: Slug;
  n: string;
  name: string;
  value: string;
  tags: string[];
  year: string;
  role: string;
  stack: string[];
  live?: string;
  repo?: string;
  team?: string[];
  cover?: ImageName; // absent -> stylized UI composition is rendered instead
  hero?: ImageName; // case-study backdrop; defaults to cover
  shots: { desktop?: ImageName[]; mobile?: ImageName };
  overview: string;
  problem: { lead: string; points: string[] };
  solution: string;
  features: { title: string; text: string }[];
  numbers?: { value: number; prefix?: string; suffix?: string; label: string }[];
  impact: string[];
};

export const projects: Project[] = [
  {
    slug: 'grand-musee',
    n: '01',
    name: 'Grand Musée',
    value: "A virtual walk through the world's great museums — hall by hall, masterpiece by masterpiece.",
    tags: ['Design', 'Front-end', 'React'],
    year: '2026',
    role: 'Design & front-end development',
    stack: ['React', 'Vite', 'Tailwind CSS'],
    live: 'https://demo-day-muzey.vercel.app',
    repo: 'https://github.com/hojiakbar14092009-tech/Demo-Day-Muzey',
    cover: 'museum-1',
    hero: 'museum-2',
    shots: { desktop: ['museum-1', 'museum-2'], mobile: 'museum-m' },
    overview:
      'Grand Musée is a virtual gallery. Instead of a catalogue of thumbnails, you walk through real museum halls — the Louvre, the Musée d’Orsay, the Uffizi, the Mauritshuis, the Hermitage, the Prado — and stop in front of the work each one is known for.',
    problem: {
      lead: 'Most people will never stand in these rooms.',
      points: [
        'Museum websites are built for visitors who already have a ticket, not for people exploring from far away.',
        'Online collections flatten art into grids of small images with no sense of space or scale.',
        'Context — who painted it, where it hangs, why it matters — is scattered across separate pages.',
      ],
    },
    solution:
      'One continuous walk. Each museum is a room you scroll into: the interior first, then the masterpiece, then its author. Navigation is organised the way people think about art — by museum, by artwork and by author.',
    features: [
      { title: 'Hall-by-hall tour', text: 'Full-bleed museum interiors that open into the featured artwork.' },
      { title: 'Artwork details', text: 'Every masterpiece opens with its author, museum and story.' },
      { title: 'Authors index', text: 'Browse by painter — Leonardo, Vermeer, Rembrandt, Velázquez and more.' },
      { title: 'Three languages', text: 'Uzbek, Russian and English, switchable from any page.' },
      { title: 'Light & dark', text: 'A gallery-white and a night-gallery theme.' },
    ],
    impact: [
      'Deployed on Vercel and live as a working product.',
      'Accessible structure: skip link, labelled navigation, alt text for every interior and artwork.',
    ],
  },
  {
    slug: 'barakali',
    n: '02',
    name: 'BarakaLi',
    value: 'A marketplace that brings the work of home-based women artisans to customers — retail and wholesale.',
    tags: ['Product design', 'Full-stack', 'Team of 5'],
    year: '2026',
    role: 'Product design & full-stack development',
    stack: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Express', 'Kysely', 'PostgreSQL', 'Zod', 'Playwright'],
    live: 'https://barakli.vercel.app',
    repo: 'https://github.com/hojiakbar14092009-tech/BarakaLi',
    team: ['Hojiakbar', 'Muslima', 'Saidamin', 'Samandar', 'Mansurbek'],
    cover: 'barakali-1',
    shots: { desktop: ['barakali-1', 'barakali-2'], mobile: 'barakali-m' },
    overview:
      'BarakaLi connects women who sew, bake and craft at home with the people who want their work. Artisans list handmade pieces for single or wholesale orders, customers pay online inside the platform, and BarakaLi keeps a 5% commission on each completed order.',
    problem: {
      lead: 'Talent stays at home.',
      points: [
        'Many skilled women can’t take a full-time job because of family circumstances.',
        'Their customers come only through friends and relatives, so income is irregular.',
        'Buyers, in turn, don’t know where to find quality handmade work they can trust.',
      ],
    },
    solution:
      'A verified marketplace built around how artisans actually work: from a phone, at home, with small batches and custom orders. Every artisan is approved by an admin before going live, and every order follows a clear, protected lifecycle.',
    features: [
      { title: 'Retail & wholesale', text: 'Each product has a unit price and a bulk price, with live stock levels.' },
      { title: '3D product view', text: 'Artisans can upload a .glb model so buyers can turn the piece in their hands.' },
      { title: 'Protected orders', text: 'Unpaid orders release after 15 minutes; orders not accepted in 24 hours are refunded.' },
      { title: 'Service bookings', text: 'Artisans publish free time slots; overlapping bookings are blocked at the database level.' },
      { title: 'Artisan cabinet', text: 'Products, stock, earnings and a savings goal — all from a phone camera.' },
      { title: 'Reviews & complaints', text: 'One review per completed order feeds the artisan’s rating; every order has a complaint button.' },
    ],
    numbers: [
      { value: 5, suffix: '%', label: 'platform commission' },
      { value: 5, label: 'people on the team' },
      { value: 15, suffix: ' min', label: 'payment hold' },
      { value: 24, suffix: ' h', label: 'to accept an order' },
    ],
    impact: [
      'Live on Vercel with a full order lifecycle, admin panel and Uzbek / Russian interface.',
      'Money is handled in whole so’m with the commission computed server-side in one transaction.',
      'Covered by unit, integration and Playwright end-to-end tests.',
    ],
  },
  {
    slug: 'mizo',
    n: '03',
    name: 'Mizo',
    value: 'Smart finance for Uzbekistan — a plan to get out of debt, save and spot scams.',
    tags: ['Product design', 'Full-stack', 'AI'],
    year: '2026',
    role: 'Product design & full-stack development',
    stack: ['Next.js', 'TypeScript', 'Prisma', 'Zod', 'JWT', 'Claude API'],
    live: 'https://mizo-uz.vercel.app',
    repo: 'https://github.com/hojiakbar14092009-tech/mizo.uz',
    cover: 'mizo-1',
    shots: { desktop: ['mizo-1'], mobile: 'mizo-m' },
    overview:
      'Mizo — “Aqlli moliya, erkin kelajak”: smart finance, a free future. It reads your numbers and builds one plan for paying off debt, saving money and protecting yourself from fraud.',
    problem: {
      lead: 'Several loans, a salary that runs out, and a Telegram offer that looks too good.',
      points: [
        'People with multiple debts don’t know which one to close first.',
        'Salaries run out before the month does, and there is no simple way to see where money goes.',
        '“Guaranteed income” offers in messengers keep catching people out.',
        'Comparing real loan costs across banks is close to impossible.',
      ],
    },
    solution:
      'Eight focused tools behind one financial health score. Each problem gets a direct answer: a debt order, a budget, a risk score, a cheaper loan.',
    features: [
      { title: 'Debt plan', text: 'Avalanche vs Snowball — which debt closes first, when it ends and how much interest you save.' },
      { title: 'AI budget', text: 'Spending analysed against the 50/30/20 rule, with cuts you can make this week.' },
      { title: 'Fraud radar', text: 'Paste an offer and get a 0–100 risk score with red flags explained.' },
      { title: 'Loan comparison', text: 'Offers from 12 banks ranked by rate, terms and collateral.' },
      { title: 'AI advisor', text: 'A Claude-based advisor with a rule-based fallback when offline.' },
      { title: 'Health score', text: 'One monthly number that tracks whether your plan is working.' },
    ],
    numbers: [
      { value: 8, label: 'finance modules' },
      { value: 12, label: 'banks compared' },
      { value: 100, prefix: '0–', label: 'fraud risk scale' },
      { value: 23, label: 'automated tests' },
    ],
    impact: [
      'Uzbek and Russian interface, light and dark themes, mobile-first.',
      'Security basics done properly: hashed passwords, JWT, rate limiting and validated input.',
    ],
  },
  {
    slug: 'ustago',
    n: '04',
    name: 'UstaGo',
    value: 'Book a verified home-repair master in minutes — no more asking around.',
    tags: ['UX design', 'Front-end', 'React'],
    year: '2026',
    role: 'UX design & front-end development',
    stack: ['React'],
    shots: {},
    overview:
      'UstaGo is a booking platform for home-repair masters — plumbers, electricians, AC technicians, furniture assemblers. You describe the job, pick a verified usta, choose a time and leave a review when it’s done.',
    problem: {
      lead: 'Finding an usta you can trust is still done by phone and luck.',
      points: [
        'Masters are found through neighbours and relatives — or not at all.',
        'Prices are unknown until the master is already at your door.',
        'There is no record of who did good work and who didn’t show up.',
      ],
    },
    solution:
      'A four-step flow that replaces the phone chain: search, choose, book, review. Every usta has a verified profile, a visible price range and ratings left only by real customers.',
    features: [
      { title: 'Search by job', text: 'Plumbing, electrics, AC, appliances, furniture — filtered by district.' },
      { title: 'Verified profiles', text: 'Identity-checked masters with experience, photos of past work and price ranges.' },
      { title: 'Slot booking', text: 'Pick a free time slot and get a confirmation instead of a callback.' },
      { title: 'Honest reviews', text: 'Only customers with a completed booking can rate a master.' },
    ],
    impact: ['A complete booking flow designed and built in React.'],
  },
];

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);
