import type { ParsedLetter, ParsedSvg, SvgTextNode } from '../types';

const SHAPE_SELECTOR = 'path, polygon, polyline, rect, circle, ellipse, line, image';
const EXTRA_GROUP_HINT = /bg|background|mascot|logo|deco/i;

let hiddenHost: HTMLDivElement | null = null;

/** Contenedor oculto pero adjunto al documento: necesario para que getBBox()/getComputedStyle() resuelvan de forma fiable en todos los navegadores. */
function getHiddenHost(): HTMLDivElement {
  if (!hiddenHost) {
    hiddenHost = document.createElement('div');
    hiddenHost.style.position = 'absolute';
    hiddenHost.style.left = '-99999px';
    hiddenHost.style.top = '0';
    hiddenHost.style.visibility = 'hidden';
    hiddenHost.style.pointerEvents = 'none';
    document.body.appendChild(hiddenHost);
  }
  return hiddenHost;
}

function parseViewBox(svgEl: SVGSVGElement) {
  const vb = svgEl.getAttribute('viewBox');
  if (vb) {
    const [minX, minY, width, height] = vb.trim().split(/[\s,]+/).map(Number);
    return { minX, minY, width, height };
  }
  const width = parseFloat(svgEl.getAttribute('width') || '0') || 300;
  const height = parseFloat(svgEl.getAttribute('height') || '0') || 150;
  return { minX: 0, minY: 0, width, height };
}

function isExtraGroup(g: SVGGElement): boolean {
  const id = g.getAttribute('id') || '';
  const cls = g.getAttribute('class') || '';
  return EXTRA_GROUP_HINT.test(id) || EXTRA_GROUP_HINT.test(cls);
}

function getGeometryLength(el: Element): number {
  const geo = el as unknown as { getTotalLength?: () => number };
  try {
    return typeof geo.getTotalLength === 'function' ? geo.getTotalLength() : 0;
  } catch {
    return 0;
  }
}

function getCenter(el: SVGGraphicsElement): { cx: number; cy: number } {
  try {
    if (el.tagName.toLowerCase() === 'image') {
      const w = parseFloat(el.getAttribute('width') || '0');
      const h = parseFloat(el.getAttribute('height') || '0');
      const x = parseFloat(el.getAttribute('x') || '0');
      const y = parseFloat(el.getAttribute('y') || '0');
      if (w > 0 && h > 0) {
        return { cx: x + w / 2, cy: y + h / 2 };
      }
    }
    const bbox = el.getBBox();
    return { cx: bbox.x + bbox.width / 2, cy: bbox.y + bbox.height / 2 };
  } catch {
    return { cx: 0, cy: 0 };
  }
}

/**
 * Detecta si un path es un compound path (múltiples subpaths).
 * Los compound paths tienen más de un comando M/m en su atributo `d`.
 * En polyline/polygon se detecta si hay segmentos discontinuos.
 * Para rect/circle/ellipse/line, siempre son subpaths simples.
 */
function detectCompoundPath(el: SVGGraphicsElement): boolean {
  const d = el.getAttribute('d');
  if (d) {
    // Cuenta cuántas veces aparece un comando MoveTo (M ó m) = nuevo subpath
    const moveCount = (d.match(/[Mm]/g) ?? []).length;
    return moveCount > 1;
  }
  // polyline/polygon con muchos puntos pueden tener gaps visuales pero
  // no tienen subpaths reales — se dejan pasar.
  return false;
}

/** Clave de geometría: el contorno y el relleno de una misma letra suelen ser dos paths duplicados con el mismo `d`/`points`. */
function shapeKey(el: SVGGraphicsElement): string {
  const d = el.getAttribute('d');
  if (d) return `d:${d}`;
  const points = el.getAttribute('points');
  if (points) return `points:${points}`;
  return '';
}

interface CollectCounter {
  /** Id único por elemento del DOM (usado para `letter.id`, p. ej. el filtro de blur). */
  rawId: number;
  /** Índice de "letra lógica" para el stagger: compartido entre el contorno y su relleno duplicado. */
  groupIndex: number;
  seen: Map<string, number>;
}

function classifyAndCollect(
  root: SVGSVGElement | SVGGElement,
  outlineLetters: ParsedLetter[],
  fillLetters: ParsedLetter[],
  extraGroups: SVGGraphicsElement[],
  counter: CollectCounter,
) {
  for (const child of Array.from(root.children)) {
    if (child.tagName.toLowerCase() === 'g') {
      const g = child as SVGGElement;
      if (isExtraGroup(g) && extraGroups.length < 2) {
        extraGroups.push(g);
        continue;
      }
      classifyAndCollect(g, outlineLetters, fillLetters, extraGroups, counter);
      continue;
    }
    if (!child.matches(SHAPE_SELECTOR)) continue;

    const el = child as SVGGraphicsElement;
    const style = getComputedStyle(el);
    const fillStyle = style.fill;
    const strokeStyle = style.stroke;
    // Obtenemos los valores de los atributos o estilos computados si los primeros no existen (soportando clases CSS inline/internas)
    const attrStroke = el.getAttribute('stroke');
    const attrFill = el.getAttribute('fill');

    const hasStroke = (attrStroke && attrStroke !== 'none' && attrStroke !== 'transparent') ||
      (!attrStroke && strokeStyle !== 'none' && strokeStyle !== '' && parseFloat(style.strokeWidth || '0') > 0);

    const hasFill = (attrFill && attrFill !== 'none' && attrFill !== 'transparent') ||
      (!attrFill && fillStyle !== 'none' && fillStyle !== '' && fillStyle !== 'rgba(0, 0, 0, 0)');

    const { cx, cy } = getCenter(el);
    const length = getGeometryLength(el);

    // Guardamos los colores originales usando la fuente de verdad (atributo o style computado)
    const originalStroke = hasStroke ? (attrStroke || strokeStyle) : null;
    const originalFill = hasFill ? (attrFill || fillStyle) : null;

    const key = shapeKey(el);
    let index: number;
    if (key && counter.seen.has(key)) {
      index = counter.seen.get(key)!;
    } else {
      index = counter.groupIndex;
      counter.groupIndex += 1;
      if (key) counter.seen.set(key, index);
    }

    const isCompoundPath = detectCompoundPath(el);

    // Si tiene stroke pero no fill, o si explícitamente es un elemento dibujado como outline
    const letter: ParsedLetter = {
      id: `letter-${counter.rawId}`,
      kind: (hasStroke && !hasFill) ? 'outline' : 'fill',
      el,
      length,
      originalStroke,
      originalFill,
      index,
      cx,
      cy,
      isCompoundPath,
    };
    counter.rawId += 1;

    if (letter.kind === 'outline') outlineLetters.push(letter);
    else fillLetters.push(letter);
  }
}

const TEXT_CONTAINER_SKIP_SELECTOR = 'defs, symbol, clipPath, mask';
const TEXT_CHILD_SELECTOR = ':scope > tspan, :scope > textPath';

/** Recolecta los elementos <text>/<tspan>/<textPath> reales del SVG subido, en orden de aparición. */
function collectTextNodes(root: SVGSVGElement): SvgTextNode[] {
  const nodes: SvgTextNode[] = [];
  let n = 0;
  for (const textEl of Array.from(root.querySelectorAll('text'))) {
    if (textEl.closest(TEXT_CONTAINER_SKIP_SELECTOR)) continue;
    const children = Array.from(textEl.querySelectorAll(TEXT_CHILD_SELECTOR)) as SVGTextContentElement[];
    const targets: SVGTextContentElement[] = children.length > 0 ? children : [textEl];
    for (const el of targets) {
      const originalText = el.textContent ?? '';
      if (!originalText.trim()) continue;
      nodes.push({ id: `text-${n}`, el, originalText });
      n += 1;
    }
  }
  return nodes;
}

export function parseSvgMarkup(svgText: string): ParsedSvg {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('El archivo SVG no es válido: ' + parserError.textContent);
  }
  const parsedRoot = doc.documentElement as unknown as SVGSVGElement;
  const svgEl = document.importNode(parsedRoot, true) as SVGSVGElement;

  const host = getHiddenHost();
  host.appendChild(svgEl);

  try {
    const viewBox = parseViewBox(svgEl);
    const outlineLetters: ParsedLetter[] = []
    const fillLetters: ParsedLetter[] = [];
    const extraGroups: SVGGraphicsElement[] = [];
    classifyAndCollect(svgEl, outlineLetters, fillLetters, extraGroups, {
      rawId: 0,
      groupIndex: 0,
      seen: new Map(),
    });

    const originalOutlineColor = outlineLetters[0]?.originalStroke || '#000000';
    const originalFillColor = fillLetters[0]?.originalFill || '#000000';
    const textNodes = collectTextNodes(svgEl);

    // --- Postprocesamiento de índices de stagger ---
    // Estrategia: preservar el orden DOM de izquierda a derecha (cx ascendente).
    // Los elementos grandes (fondo/tarjeta, área > 20% del viewBox) se animan todos
    // en index=0 (juntos), y el resto de contenido se va staggerando de izq a der
    // PERO usando índices individuales empezando desde 1 para que el efecto
    // letra-por-letra sea rápido y dinámico, no aplastado.
    const allLetters = [...outlineLetters, ...fillLetters];
    const viewBoxArea = (viewBox.width || 1) * (viewBox.height || 1);

    interface LetterInfo {
      letter: ParsedLetter;
      area: number;
      key: string;
    }

    const letterInfos: LetterInfo[] = allLetters.map((letter) => {
      let area = 0;
      try {
        const bbox = letter.el.getBBox();
        area = bbox.width * bbox.height;
      } catch {
        area = 0;
      }
      return { letter, area, key: shapeKey(letter.el) };
    });

    // Elementos "fondo" = rect/shape que cubren ≥20% del viewBox (la tarjeta).
    const bgInfos = letterInfos.filter((info) => info.area >= viewBoxArea * 0.20);
    const contentInfos = letterInfos.filter((info) => info.area < viewBoxArea * 0.20);

    // Ordenar contenido de izquierda a derecha por cx
    contentInfos.sort((a, b) => a.letter.cx - b.letter.cx);

    // Contenido: agrupamos formas extremadamente cercanas o solapadas (como partes de un emoji o icono)
    // para que se animen como una sola unidad lógica. Las letras de texto se mantienen staggeradas de izq a der.
    const keyToIndex = new Map<string, number>();
    let currentIndex = bgInfos.length > 0 ? 1 : 0;

    // Obtener los bounding boxes reales del contenido
    interface GroupableInfo {
      info: LetterInfo;
      x: number;
      y: number;
      width: number;
      height: number;
      assignedIndex: number | null;
    }

    const groupables: GroupableInfo[] = contentInfos.map((info) => {
      let x = info.letter.cx;
      let y = info.letter.cy;
      let width = 0;
      let height = 0;
      try {
        const bbox = info.letter.el.getBBox();
        x = bbox.x;
        y = bbox.y;
        width = bbox.width;
        height = bbox.height;
      } catch {}
      return { info, x, y, width, height, assignedIndex: null };
    });

    // Función para detectar si dos cajas de colisión se solapan o están muy cerca
    // (tolerancia de proximidad adaptada a iconos/emojis, restringiendo la unión en el eje X)
    const isNearbyOrOverlapping = (a: GroupableInfo, b: GroupableInfo) => {
      // Determinamos solapamiento o intersección real entre las cajas
      const hasHorizontalOverlap = a.x < b.x + b.width && b.x < a.x + a.width;
      const hasVerticalOverlap = a.y < b.y + b.height && b.y < a.y + a.height;

      // Si se solapan vertical y horizontalmente (uno dentro del otro o intersección real de trazados)
      if (hasHorizontalOverlap && hasVerticalOverlap) {
        return true;
      }

      // Si no hay solapamiento directo, permitimos cercanía solo si es vertical (ej: un ojo sobre una cara)
      // pero NUNCA agrupamos si están separados horizontalmente uno al lado del otro (ej: número al lado del logo)
      const toleranceY = Math.min(a.height, b.height) * 0.4 || 6;
      const nearbyX = hasHorizontalOverlap; // Deben compartir eje X (solapamiento horizontal)
      const nearbyY = (a.y - toleranceY <= b.y + b.height && b.y - toleranceY <= a.y + a.height);

      return nearbyX && nearbyY;
    };

    // Agrupación recursiva (Flood fill)
    for (let i = 0; i < groupables.length; i++) {
      const current = groupables[i];
      if (current.assignedIndex !== null) continue;

      // Si este shape comparte el mismo shapeKey que uno ya asignado ( outline + fill del mismo path )
      const key = current.info.key;
      if (key && keyToIndex.has(key)) {
        current.assignedIndex = keyToIndex.get(key)!;
        current.info.letter.index = current.assignedIndex;
        continue;
      }

      // Encontrar todos los elementos que forman parte de este mismo "clúster" o icono
      const cluster: GroupableInfo[] = [current];
      let foundNew = true;
      while (foundNew) {
        foundNew = false;
        for (let j = 0; j < groupables.length; j++) {
          const candidate = groupables[j];
          if (candidate.assignedIndex !== null || cluster.includes(candidate)) continue;

          // Si el candidato colisiona con CUALQUIER elemento del clúster actual, se une a él
          const belongsToCluster = cluster.some((item) => isNearbyOrOverlapping(item, candidate));
          if (belongsToCluster) {
            cluster.push(candidate);
            foundNew = true;
          }
        }
      }

      // Asignar el índice actual a todo el clúster (emoji/icono)
      for (const item of cluster) {
        item.assignedIndex = currentIndex;
        item.info.letter.index = currentIndex;
        const itemKey = item.info.key;
        if (itemKey) keyToIndex.set(itemKey, currentIndex);
      }
      currentIndex += 1;
    }

    return {
      svgEl,
      viewBox,
      outlineLetters,
      fillLetters,
      extraGroups,
      originalOutlineColor,
      originalFillColor,
      textNodes,
    };
  } finally {
    host.removeChild(svgEl);
  }
}
