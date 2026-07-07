import type { AnimConfig, LetterFrameState, ParsedLetter } from '../types';
import { computeFrameState } from './animationEngine';

const BLUR_FACTOR = 0.35;
const MAX_BLUR = 18;

/**
 * Envuelve computeFrameState calculando la velocidad de la letra entre este frame y el
 * anterior (dt = 1/fps, es decir, "un frame de obturador") para derivar un desenfoque
 * gaussiano direccional que desaparece cuando la letra llega a su posición final.
 */
export function computeFrameStateWithBlur(
  t: number,
  letter: ParsedLetter,
  config: AnimConfig,
): LetterFrameState {
  const state = computeFrameState(t, letter, config);
  if (!config.motionBlurEnabled) return state;

  const dt = 1 / config.fps;
  const prev = computeFrameState(t - dt, letter, config);
  const dy = state.translateY - prev.translateY;
  const displacement = Math.abs(dy);

  const blurStdDeviation = Math.min(displacement * BLUR_FACTOR, MAX_BLUR);
  const blurAngle = 90; // el motor sólo produce desplazamiento vertical (Slide Y), el blur sigue esa dirección

  return { ...state, blurStdDeviation, blurAngle };
}

/** stdDeviation de <feGaussianBlur> como par "x y" según el ángulo del desenfoque. */
export function blurStdDeviationPair(state: LetterFrameState): string {
  if (state.blurStdDeviation <= 0.01) return '0 0';
  return state.blurAngle === 90 ? `0 ${state.blurStdDeviation}` : `${state.blurStdDeviation} 0`;
}
