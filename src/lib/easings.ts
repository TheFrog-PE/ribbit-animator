import type { EasingType } from '../types';

export const easings: Record<EasingType, (t: number) => number> = {
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  elasticOut: (t) => {
    if (t === 0 || t === 1) return t;
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
  },
  backOut: (t) => {
    const s = 1.70158;
    const u = t - 1;
    return u * u * ((s + 1) * u + s) + 1;
  },
  bounceOut: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      const u = t - 1.5 / d1;
      return n1 * u * u + 0.75;
    } else if (t < 2.5 / d1) {
      const u = t - 2.25 / d1;
      return n1 * u * u + 0.9375;
    } else {
      const u = t - 2.625 / d1;
      return n1 * u * u + 0.984375;
    }
  },
  easeInOut: (t) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  circOut: (t) => {
    return Math.sqrt(1 - Math.pow(t - 1, 2));
  },
};

export function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
