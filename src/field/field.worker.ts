/// <reference lib="webworker" />
import type { In, Out } from './config';
import { createRenderer } from './renderer';

// The field renders here, on an OffscreenCanvas handed over by components/Field.tsx.
let handle: ((m: In) => void) | null = null;
const emit = (o: Out) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(o);

self.onmessage = (e: MessageEvent<In>) => {
  const m = e.data;
  if (m.type === 'init') handle = createRenderer(m.canvas, m, emit);
  else handle?.(m);
};
