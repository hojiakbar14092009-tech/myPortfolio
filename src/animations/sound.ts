// Synthesised UI sounds (no audio files). Off by default; the toggle lives in the nav.
let ctx: AudioContext | null = null;
let enabled = false;
const subs = new Set<() => void>();

export const sound = {
  get enabled() { return enabled; },
  toggle() {
    enabled = !enabled;
    if (enabled && !ctx) ctx = new AudioContext();
    subs.forEach((f) => f());
  },
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
};

let last = 0;
/** Short high tick for hovers (throttled). */
export function tick() {
  if (!enabled || !ctx) return;
  const now = ctx.currentTime;
  if (now - last < 0.06) return;
  last = now;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(2200, now);
  g.gain.setValueAtTime(0.025, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  o.connect(g).connect(ctx.destination);
  o.start(now);
  o.stop(now + 0.06);
}

/** Filtered noise sweep for page transitions. */
export function whoosh() {
  if (!enabled || !ctx) return;
  const now = ctx.currentTime;
  const len = 0.6;
  const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(400, now);
  f.frequency.exponentialRampToValueAtTime(3000, now + len);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.06, now);
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(now);
}

/** Low thump for the logo "punch". */
export function thump() {
  if (!enabled || !ctx) return;
  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(140, now);
  o.frequency.exponentialRampToValueAtTime(45, now + 0.18);
  g.gain.setValueAtTime(0.12, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  o.connect(g).connect(ctx.destination);
  o.start(now);
  o.stop(now + 0.26);
}
