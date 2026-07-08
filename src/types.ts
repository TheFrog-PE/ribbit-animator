export type EasingType = 'backOut' | 'elasticOut' | 'easeOut' | 'bounceOut' | 'easeInOut' | 'circOut';

export type RevealMode = 'none' | 'wipeUp' | 'wipeDown' | 'wipeLeft' | 'wipeRight' | 'liquidRise';

export interface AnimConfig {
  duration: number;
  stagger: number;
  easing: EasingType;
  offsetX: number;
  offsetY: number;
  startScale: number;
  startOpacity: number;
  startRotation: number;
  revealMode: RevealMode;
  writeOn: boolean;
  fillOffset: number;
  fps: number;
  renderScale: number;
  canvasPadding: number;

  motionBlurEnabled: boolean;
  dropShadowEnabled: boolean;

  textEditActive: boolean;
  fontFamily1: string;
  fontFamily2: string;
  line1: string;
  fontSize1: number;
  yPos1: number;
  line2: string;
  fontSize2: number;
  yPos2: number;
  letterSpacing: number;

  outlineColor: string;
  fillColor: string;

  // Parámetros de MODO IMAGEN
  imageModeActive: boolean;
  imageGlowEnabled: boolean;
  imageGlowColor: string;
  imageGlowRadius: number;
  image3DEnabled: boolean;
  image3DDepth: number;
  imageWiggleEnabled: boolean;
  imageWiggleIntensity: number;
  imageShineEnabled: boolean;
  imageShineColor: string;

  // Duración total del clip editable por el usuario
  clipDuration: number;
}

export const DEFAULT_CONFIG: AnimConfig = {
  duration: 0.6,
  stagger: 0.06,
  easing: 'backOut',
  offsetX: 0,
  offsetY: 60,
  startScale: 0.4,
  startOpacity: 0,
  startRotation: -15,
  revealMode: 'none',
  writeOn: true,
  fillOffset: 0.4,
  fps: 30,
  renderScale: 1,
  canvasPadding: 80,

  motionBlurEnabled: false,
  dropShadowEnabled: false,

  textEditActive: false,
  fontFamily1: '"Arial Black", Impact, sans-serif',
  fontFamily2: '"Arial Black", Impact, sans-serif',
  line1: '¿SABES QUE CON TECHO PROPIO',
  fontSize1: 46,
  yPos1: 76,
  line2: 'COMPRAS TU CASA?',
  fontSize2: 84,
  yPos2: 174,
  letterSpacing: 0,

  outlineColor: '#204197',
  fillColor: '#ffffff',

  // Parámetros de MODO IMAGEN por defecto
  imageModeActive: false,
  imageGlowEnabled: false,
  imageGlowColor: '#6366f1',
  imageGlowRadius: 20,
  image3DEnabled: false,
  image3DDepth: 15,
  imageWiggleEnabled: false,
  imageWiggleIntensity: 5,
  imageShineEnabled: false,
  imageShineColor: '#ffffff',

  // Duración por defecto del clip
  clipDuration: 10.0,
};

export interface PresetDef {
  id: string;
  name: string;
  swatch: string;
  outlineColor: string;
}

export const PRESETS: PresetDef[] = [
  { id: 'green', name: 'Verde Píldora', swatch: '#5cb82a', outlineColor: '#2f6d10' },
  { id: 'blue', name: 'Azul Clásico', swatch: '#204197', outlineColor: '#204197' },
  { id: 'gold', name: 'Dorado Premium', swatch: '#f59e0b', outlineColor: '#8a5405' },
  { id: 'neon', name: 'Cyber Neon', swatch: '#06b6d4', outlineColor: '#0a4c56' },
  { id: 'dark', name: 'Sombra Obscura', swatch: '#111827', outlineColor: '#000000' },
];

/** Un trazo individual extraído del SVG (path/polygon), ya con su longitud calculada. */
export interface ParsedLetter {
  id: string;
  kind: 'outline' | 'fill' | 'text';
  el: SVGGraphicsElement;
  length: number;
  originalStroke: string | null;
  originalFill: string | null;
  /** índice de orden de aparición, usado para el stagger */
  index: number;
  /** centro del bounding box, usado como pivote de escala/rotación */
  cx: number;
  cy: number;
  /**
   * true si el path tiene múltiples subpaths (comando M/m repetido).
   * En ese caso stroke-dasharray produce artefactos visuales (líneas
   * fantasma, trazos cortados), así que se anima sólo con opacity.
   */
  isCompoundPath: boolean;
}

/** Un elemento <text> o <tspan> real encontrado dentro del SVG subido, editable por el usuario. */
export interface SvgTextNode {
  id: string;
  el: SVGTextContentElement;
  originalText: string;
}

export interface ParsedSvg {
  svgEl: SVGSVGElement;
  viewBox: { minX: number; minY: number; width: number; height: number };
  outlineLetters: ParsedLetter[];
  fillLetters: ParsedLetter[];
  extraGroups: SVGGraphicsElement[];
  originalOutlineColor: string;
  originalFillColor: string;
  textNodes: SvgTextNode[];
}

export interface SvgFileEntry {
  id: string;
  name: string;
  content: string;
  thumbnail?: string;
  /** Ediciones del usuario sobre el texto original del SVG, indexadas por SvgTextNode.id. */
  textEdits?: Record<string, string>;
}

/** Estado calculado para una letra en un instante t, listo para aplicar como transform/estilo. */
export interface LetterFrameState {
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  rotation: number;
  dashOffset: number | null;
  fillOpacity: number | null;
  blurStdDeviation: number;
  blurAngle: number;
  /** CSS clip-path value for reveal effects (wipe, liquid, etc.) */
  clipPath: string;
}
