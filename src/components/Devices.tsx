import type { ReactNode } from 'react';
import type { ImageName } from '../data/images';
import { Picture } from './Picture';

export function Laptop({ shot, alt, children }: { shot?: ImageName; alt: string; children?: ReactNode }) {
  return (
    <figure className="mx-auto w-full max-w-5xl">
      <div className="rounded-t-[14px] border border-fg/15 bg-surface p-[1.4%] pb-[1%]">
        <div className="mb-[0.8%] flex gap-1.5 px-1" aria-hidden>
          {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-fg/20" />)}
        </div>
        <div className="aspect-[16/10] overflow-hidden rounded-[4px] bg-bg">
          {shot ? <Picture name={shot} alt={alt} sizes="(min-width: 1024px) 64rem, 100vw" imgClassName="h-full w-full object-cover object-top" /> : children}
        </div>
      </div>
      <div aria-hidden className="mx-auto h-3 w-[104%] -translate-x-[2%] rounded-b-xl border border-t-0 border-fg/15 bg-surface" />
    </figure>
  );
}

export function Phone({ shot, alt, children, className = '' }: { shot?: ImageName; alt: string; children?: ReactNode; className?: string }) {
  return (
    <figure className={`w-full max-w-[280px] rounded-[2.4rem] border border-fg/15 bg-surface p-2.5 ${className}`}>
      <div className="relative aspect-[390/844] overflow-hidden rounded-[1.9rem] bg-bg">
        <span aria-hidden className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
        {shot ? <Picture name={shot} alt={alt} sizes="280px" imgClassName="h-full w-full object-cover object-top" /> : children}
      </div>
    </figure>
  );
}
