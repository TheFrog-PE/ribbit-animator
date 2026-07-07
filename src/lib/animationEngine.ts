import type { AnimConfig, LetterFrameState, ParsedLetter } from '../types';
import { clamp01, easings } from './easings';

/**
 * Calcula el valor de clip-path CSS para el modo de revelado actual.
 * Coordenadas normalizadas de 0.0 a 1.0 (para clipPathUnits="objectBoundingBox")
 */
function computeClipPath(mode: AnimConfig['revealMode'], progress: number, letterCx: number, t: number): string {
  if (mode === 'none' || progress >= 1) return 'none';
  if (progress <= 0) {
    switch (mode) {
      case 'wipeUp':    return 'inset(100% 0 0 0)';
      case 'wipeDown':  return 'inset(0 0 100% 0)';
      case 'wipeLeft':  return 'inset(0 100% 0 0)';
      case 'wipeRight': return 'inset(0 0 0 100%)';
      case 'liquidRise': return 'inset(100% 0 0 0)';
    }
  }

  const p = clamp01(progress);
  const remaining = (1 - p) * 100;

  switch (mode) {
    case 'wipeUp':
      return `inset(${remaining}% 0 0 0)`;
    case 'wipeDown':
      return `inset(0 0 ${remaining}% 0)`;
    case 'wipeLeft':
      return `inset(0 ${remaining}% 0 0)`;
    case 'wipeRight':
      return `inset(0 0 0 ${remaining}%)`;
    case 'liquidRise': {
      // Línea base vertical (del 1.0 de abajo a 0.0 de arriba)
      const baseY = 1 - p; 
      // Amplitud de la onda reducida para caber en rango de 0.0 a 1.0
      const waveAmplitude = 0.07 * (1 - p); 
      const phase = letterCx * 0.02; // desfase espacial
      
      const points: string[] = [];
      for (let i = 0; i <= 10; i++) {
        const xVal = i / 10;
        // La onda tiene movimiento continuo gracias al parámetro de tiempo real t
        const wave = Math.sin(xVal * Math.PI * 4 + phase + t * 9) * waveAmplitude;
        const yVal = Math.max(0, Math.min(1, baseY + wave));
        points.push(`${xVal} ${yVal}`);
      }
      points.push('1 1', '0 1');
      return `polygon(${points.join(', ')})`;
    }
  }
  return 'none';
}

/**
 * Función pura del tiempo: usada tanto por el preview en vivo (rAF) como por el
 * exportador de frames (t = frameIndex / fps), así el video exportado es
 * visualmente idéntico a lo que se ve en pantalla.
 */
export function computeFrameState(t: number, letter: ParsedLetter, config: AnimConfig): LetterFrameState {
  const delay = letter.index * config.stagger;
  const localT = (t - delay) / config.duration;
  const localTClamped = clamp01(localT);
  const ease = easings[config.easing];
  const eased = localT <= 0 ? 0 : localT >= 1 ? 1 : ease(localT);

  const opacity = config.startOpacity + (1 - config.startOpacity) * clamp01(eased);
  const translateX = (1 - eased) * config.offsetX;
  const translateY = (1 - eased) * config.offsetY;
  // Si es Modo Imagen, la animación abre forzosamente desde 0% (0.0) de escala para un surgimiento natural
  const initialScale = config.imageModeActive ? 0 : config.startScale;
  const scale = initialScale + (1 - initialScale) * eased;
  const rotation = (1 - eased) * config.startRotation;

  let dashOffset: number | null = null;
  let fillOpacity: number | null = null;

  if (letter.kind === 'outline') {
    dashOffset = config.writeOn ? letter.length * (1 - localTClamped) : 0;
  } else if (letter.kind === 'fill') {
    const fillLocalT = clamp01((localTClamped - config.fillOffset) / Math.max(0.0001, 1 - config.fillOffset));
    fillOpacity = clamp01(easings.easeOut(fillLocalT));
  }

  // Clip-path para efectos de revelado (wipe, liquid, etc.)
  const clipPath = computeClipPath(config.revealMode, clamp01(eased), letter.cx, t);

  return {
    opacity,
    translateX,
    translateY,
    scale,
    rotation,
    dashOffset,
    fillOpacity,
    blurStdDeviation: 0,
    blurAngle: 0,
    clipPath,
  };
}

/** Duración total de la animación de entrada: última letra en iniciar + su propia duración. */
export function getTotalAnimationDuration(letters: ParsedLetter[], config: AnimConfig): number {
  if (letters.length === 0) return config.duration;
  const maxIndex = Math.max(...letters.map((l) => l.index));
  return maxIndex * config.stagger + config.duration;
}
