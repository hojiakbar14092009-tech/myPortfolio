import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EXPO } from '../animations/ease';
import { HSHLockup, HSHLogo } from '../components/logo/HSHLogo';
import { CONCEPTS, type Concept, type Glyph } from '../components/logo/logoPaths';

// Dev-only exploration page (not linked anywhere). Shows every explored concept and the winner's motion states.

const KEYS = ['originality', 'legibility', 'simplicity', 'favicon', 'story', 'motion', 'fit'] as const;
const total = (c: Concept) => KEYS.reduce((a, k) => a + c.scores[k], 0);

function ConceptSvg({ c, size, uid }: { c: Concept; size: number; uid: string }) {
  // Line-based concepts draw themselves; fills fade up.
  const svg = c.svg.replaceAll('id="M"', `id="M${uid}"`).replaceAll('url(#M)', `url(#M${uid})`).replaceAll('<path d=', '<path pathLength="1" class="lab-draw" d=');
  return <svg viewBox={c.vb} style={{ width: size, height: 'auto', maxWidth: '100%' }} dangerouslySetInnerHTML={{ __html: svg }} aria-label={c.name} role="img" />;
}

export default function LogoLab() {
  const [glyph, setGlyph] = useState<Glyph>('mark');
  const [run, setRun] = useState(0);
  useEffect(() => { document.title = 'Logo lab — HSH'; }, []);
  const ranked = [...CONCEPTS].sort((a, b) => total(b) - total(a));

  return (
    <main id="main" className="wrap pb-32 pt-32">
      <style>{`.lab-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:labdraw 1.6s cubic-bezier(.76,0,.24,1) forwards}@keyframes labdraw{to{stroke-dashoffset:0}}`}</style>
      <p className="label mb-4">Logo lab · internal</p>
      <h1 className="display mb-6 text-[clamp(3rem,9vw,8rem)]">HSH, explored.</h1>
      <p className="mb-20 max-w-[60ch] text-lg text-muted">
        Eight directions for the HSH mark, scored on the same seven criteria. The winner — The Canvas — is shown live below with all of its motion states.
      </p>

      {/* Winner, live */}
      <section className="mb-24 grid gap-[var(--gutter)] lg:grid-cols-2">
        <div className="flex aspect-[4/3] items-center justify-center rounded-[8px] bg-[#0B0B0C] p-10 text-[#F4F2EE]">
          <HSHLogo key={run} className="w-full max-w-md" mode="intro" glyph={glyph} />
        </div>
        <div className="flex aspect-[4/3] items-center justify-center rounded-[8px] bg-[#F4F2EE] p-10 text-[#0B0B0C]">
          <HSHLogo key={run} className="w-full max-w-md" mode="draw" glyph={glyph} />
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
          <button type="button" className="rounded-full border hairline px-4 py-2 text-sm" onClick={() => setRun((r) => r + 1)}>Replay intro</button>
          {(['mark', 'ropes', 'code'] as Glyph[]).map((g) => (
            <button key={g} type="button" aria-pressed={glyph === g} className={`rounded-full border px-4 py-2 text-sm ${glyph === g ? 'border-fg bg-fg text-bg' : 'hairline'}`} onClick={() => setGlyph(g)}>
              Glyph: {g}
            </button>
          ))}
          <span className="label ml-auto">Hover: S swings & H’s part · Click: punch + shockwave</span>
        </div>
      </section>

      <section className="mb-24 grid items-end gap-12 border-y hairline py-12 sm:grid-cols-2 lg:grid-cols-4">
        {[16, 24, 32, 64, 128].map((s) => (
          <div key={s} className="flex flex-col items-start gap-3">
            <span style={{ width: s }} className="block"><HSHLogo mode="static" alive={false} interactive={false} variant={s < 32 ? 'compact' : 'full'} className="w-full" /></span>
            <span className="label">{s}px {s < 32 ? '· compact' : ''}</span>
          </div>
        ))}
        <div className="flex flex-col gap-6 sm:col-span-2">
          <HSHLockup />
          <HSHLockup stacked />
        </div>
      </section>

      {/* Scoring */}
      <section className="mb-24 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b hairline">
              <th className="py-3 pr-4 font-medium">Concept</th>
              {KEYS.map((k) => <th key={k} className="py-3 pr-4 font-medium capitalize">{k}</th>)}
              <th className="py-3 font-medium">Total /70</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((c, i) => (
              <tr key={c.id} className={`border-b hairline ${i === 0 ? 'bg-fg/[0.04]' : ''}`}>
                <td className="py-3 pr-4 font-display text-base font-medium">{c.name}{i === 0 && <span className="label ml-2">winner</span>}</td>
                {KEYS.map((k) => <td key={k} className="py-3 pr-4 tabular-nums">{c.scores[k]}</td>)}
                <td className="py-3 font-display text-base font-semibold tabular-nums">{total(c)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Concepts */}
      <section className="grid gap-16">
        {CONCEPTS.map((c, i) => (
          <motion.article key={c.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EXPO }} className="grid gap-6 border-t hairline pt-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="label mb-2">{String(i + 1).padStart(2, '0')} · {total(c)}/70</p>
              <h2 className="font-display text-3xl font-semibold">{c.name}</h2>
              <p className="mt-3 text-muted">{c.idea}</p>
              <p className="mt-3 text-sm">{c.ownable}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              <div className="flex items-center justify-center gap-6 rounded-[6px] bg-[#0B0B0C] p-8 text-[#F4F2EE]">
                <ConceptSvg c={c} size={260} uid={`${c.id}d`} />
                <div className="flex flex-col items-center gap-4"><ConceptSvg c={c} size={64} uid={`${c.id}d64`} /><ConceptSvg c={c} size={24} uid={`${c.id}d24`} /></div>
              </div>
              <div className="flex items-center justify-center gap-6 rounded-[6px] bg-[#F4F2EE] p-8 text-[#0B0B0C]">
                <ConceptSvg c={c} size={260} uid={`${c.id}l`} />
                <div className="flex flex-col items-center gap-4"><ConceptSvg c={c} size={64} uid={`${c.id}l64`} /><ConceptSvg c={c} size={24} uid={`${c.id}l24`} /></div>
              </div>
            </div>
          </motion.article>
        ))}
      </section>
    </main>
  );
}
