import type { ParsedLetter } from '../types';

const SVG_NS = 'http://www.w3.org/2000/svg';

let measureCanvas: HTMLCanvasElement | null = null;
function getMeasureCtx(): CanvasRenderingContext2D {
  if (!measureCanvas) measureCanvas = document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo crear el contexto 2D para medir texto');
  return ctx;
}

export interface TextLineOptions {
  text: string;
  fontFamily: string;
  fontSize: number;
  yPos: number;
  letterSpacing: number;
  containerWidth: number;
  color: string;
}

export interface TextLineResult {
  group: SVGGElement;
  letters: ParsedLetter[];
}

/**
 * Distribuye cada carácter a lo largo de un arco circular (centro más alto que los extremos),
 * usando la relación sagitta-cuerda-radio para que la curvatura escale con el tamaño de fuente.
 */
export function buildTextLineLetters(opts: TextLineOptions, startIndex: number): TextLineResult {
  const { text, fontFamily, fontSize, yPos, letterSpacing, containerWidth, color } = opts;
  const ctx = getMeasureCtx();
  ctx.font = `900 ${fontSize}px ${fontFamily}`;

  const chars = Array.from(text);
  const widths = chars.map((c) => (c === ' ' ? fontSize * 0.35 : ctx.measureText(c).width));
  const totalWidth = widths.reduce((a, b) => a + b, 0) + letterSpacing * Math.max(0, chars.length - 1);
  const halfWidth = totalWidth / 2;

  const sagitta = totalWidth < 1 ? 0 : Math.min(fontSize * 0.6, halfWidth * 0.9);
  const radius = sagitta > 0.01 ? (halfWidth * halfWidth + sagitta * sagitta) / (2 * sagitta) : Infinity;

  const group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('data-role', 'text-line');

  const letters: ParsedLetter[] = [];
  let cursor = -halfWidth;
  let index = startIndex;

  chars.forEach((char, i) => {
    const w = widths[i];
    const centerFlat = cursor + w / 2;
    cursor += w + letterSpacing;

    let arcX = centerFlat;
    let arcY = 0;
    let rotationDeg = 0;
    if (Number.isFinite(radius) && radius > 0) {
      const theta = Math.asin(Math.max(-1, Math.min(1, centerFlat / radius)));
      arcX = radius * Math.sin(theta);
      arcY = radius * (1 - Math.cos(theta));
      rotationDeg = (theta * 180) / Math.PI;
    }

    const g = document.createElementNS(SVG_NS, 'g');
    const x = containerWidth / 2 + arcX;
    const y = yPos + arcY;
    g.setAttribute('data-base-transform', `rotate(${rotationDeg} ${x} ${y})`);
    g.setAttribute('transform', `rotate(${rotationDeg} ${x} ${y})`);

    const textEl = document.createElementNS(SVG_NS, 'text');
    textEl.setAttribute('x', String(x));
    textEl.setAttribute('y', String(y));
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('dominant-baseline', 'alphabetic');
    textEl.setAttribute('font-family', fontFamily);
    textEl.setAttribute('font-size', String(fontSize));
    textEl.setAttribute('font-weight', '900');
    textEl.setAttribute('fill', color);
    textEl.textContent = char === ' ' ? ' ' : char;

    g.appendChild(textEl);
    group.appendChild(g);

    letters.push({
      id: `text-${index}`,
      kind: 'text',
      el: g as unknown as SVGGraphicsElement,
      length: 0,
      originalStroke: null,
      originalFill: color,
      index,
      cx: x,
      cy: y,
      isCompoundPath: false,
    });
    index += 1;
  });

  return { group, letters };
}
