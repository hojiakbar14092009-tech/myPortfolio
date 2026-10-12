import { AnimatePresence, motion } from 'framer-motion';
import { Check, MapPin, Search, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EXPO } from '../animations/ease';
import { Phone } from './Devices';

// Stylized UstaGo app screens (no product screenshots exist yet — see assets/ustago-*.png slots in README).
const USTAS = [
  { name: 'Akmal R.', job: 'Plumber · 9 yrs', rating: 4.9, price: '150–250k' },
  { name: 'Bekzod T.', job: 'Plumber · 6 yrs', rating: 4.8, price: '120–200k' },
  { name: 'Sherzod U.', job: 'Plumber · 4 yrs', rating: 4.7, price: '100–180k' },
];
const SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];

export const STEPS = ['Search', 'Choose', 'Book', 'Review'] as const;

/** Card / hero composition. While `playing`, the phone runs through the booking flow. */
export function UstaGoCover({ playing = false }: { playing?: boolean }) {
  const [step, setStep] = useState(1);
  useEffect(() => {
    if (!playing) { setStep(1); return; }
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1100);
    return () => clearInterval(id);
  }, [playing]);
  return (
    <div className="relative flex h-full w-full justify-center overflow-hidden bg-surface pt-[7%]">
      <span aria-hidden className="display absolute -bottom-[0.18em] left-0 text-[clamp(5rem,13vw,12rem)] text-fg/[0.07]">UstaGo</span>
      <Phone alt="" className="w-[clamp(150px,34%,240px)] shrink-0 rotate-[-5deg] self-start shadow-2xl"><UstaGoScreen step={step} /></Phone>
    </div>
  );
}

export function UstaGoScreen({ step }: { step: number }) {
  return (
    <div className="flex h-full flex-col bg-[#F4F2EE] px-4 pb-4 pt-10 text-[#0B0B0C]" style={{ fontSize: 12 }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-[15px] font-semibold tracking-tight">UstaGo</span>
        <span className="flex items-center gap-1 text-[10px] text-[#66635D]"><MapPin size={11} /> Chilonzor</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="flex flex-1 flex-col"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: EXPO }}
        >
          {step === 0 && (
            <>
              <p className="mb-2 font-display text-[22px] font-semibold leading-none tracking-tight">What needs fixing?</p>
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5">
                <Search size={13} /> <span>Leaking kitchen tap</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Plumbing', 'Electrics', 'AC repair', 'Appliances', 'Furniture', 'Painting'].map((c, i) => (
                  <div key={c} className={`rounded-xl px-3 py-3 ${i === 0 ? 'bg-[#0B0B0C] text-[#F4F2EE]' : 'bg-white'}`}>{c}</div>
                ))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="mb-2 text-[10px] text-[#66635D]">3 verified plumbers nearby</p>
              <div className="space-y-2">
                {USTAS.map((u, i) => (
                  <div key={u.name} className={`flex items-center gap-3 rounded-xl bg-white p-2.5 ${i === 0 ? 'ring-1 ring-[#0B0B0C]' : ''}`}>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#E8E5DF] font-semibold">{u.name[0]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 font-semibold">{u.name} <Check size={11} aria-label="verified" /></div>
                      <div className="text-[10px] text-[#66635D]">{u.job}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-0.5"><Star size={10} fill="currentColor" /> {u.rating}</div>
                      <div className="text-[10px] text-[#66635D]">{u.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="mb-1 font-semibold">Akmal R. · Thursday</p>
              <p className="mb-3 text-[10px] text-[#66635D]">Pick a free slot</p>
              <div className="grid grid-cols-3 gap-2">
                {SLOTS.map((s, i) => (
                  <div key={s} className={`rounded-lg py-2 text-center ${i === 2 ? 'bg-[#0B0B0C] text-[#F4F2EE]' : i === 4 ? 'bg-white text-[#B3AFA7] line-through' : 'bg-white'}`}>{s}</div>
                ))}
              </div>
              <div className="mt-auto rounded-xl bg-[#0B0B0C] py-3 text-center font-semibold text-[#F4F2EE]">Book 13:00</div>
            </>
          )}
          {step === 3 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#0B0B0C] text-[#F4F2EE]"><Check size={20} /></span>
              <p className="font-display text-[20px] font-semibold tracking-tight">Job done</p>
              <p className="mb-3 text-[10px] text-[#66635D]">How was Akmal?</p>
              <div className="flex gap-1">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={20} fill="#C9B48A" stroke="#8C7446" />)}</div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
