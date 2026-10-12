export const EXPO = [0.22, 1, 0.36, 1] as const;
export const QUART = [0.76, 0, 0.24, 1] as const;

export const finePointer = () =>
  typeof window !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;
