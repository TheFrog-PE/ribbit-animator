import type { AnimConfig, ParsedLetter, ParsedSvg } from '../types';
import { computeFrameStateWithBlur, blurStdDeviationPair } from './motionBlur';
import { buildTextLineLetters } from './textLayout';
import { getTotalAnimationDuration } from './animationEngine';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Reconstruye qué letras están activas según el modo (vectorial puro vs edición de texto):
 * oculta/muestra los trazos originales e inyecta los grupos de texto en arco cuando corresponde.
 * Los grupos "extra" (fondos/mascotas) siempre permanecen visibles.
 */
export function buildScene(parsed: ParsedSvg, config: AnimConfig): ParsedLetter[] {
  // Limpia cualquier grupo de texto inyectado en una construcción de escena previa.
  parsed.svgEl.querySelectorAll('[data-role="text-line"]').forEach((n) => n.remove());

  for (const letter of [...parsed.outlineLetters, ...parsed.fillLetters]) {
    (letter.el as unknown as HTMLElement).style.display = config.textEditActive ? 'none' : '';
  }

  if (!config.textEditActive) {
    return [...parsed.outlineLetters, ...parsed.fillLetters];
  }

  const containerWidth = parsed.viewBox.width;
  const line1 = buildTextLineLetters(
    {
      text: config.line1,
      fontFamily: config.fontFamily1,
      fontSize: config.fontSize1,
      yPos: config.yPos1,
      letterSpacing: config.letterSpacing,
      containerWidth,
      color: config.fillColor,
    },
    0,
  );
  const line2 = buildTextLineLetters(
    {
      text: config.line2,
      fontFamily: config.fontFamily2,
      fontSize: config.fontSize2,
      yPos: config.yPos2,
      letterSpacing: config.letterSpacing,
      containerWidth,
      color: config.fillColor,
    },
    line1.letters.length,
  );

  parsed.svgEl.appendChild(line1.group);
  parsed.svgEl.appendChild(line2.group);

  return [...line1.letters, ...line2.letters];
}

/** Aplica transform/opacidad/dash/color/blur a cada letra para un instante t. Se usa igual en preview y en export. */
export class FrameRenderer {
  private svgEl: SVGSVGElement;
  private letters: ParsedLetter[];
  private defs: SVGDefsElement;
  private blurFilters = new Map<string, SVGFEGaussianBlurElement>();

  constructor(svgEl: SVGSVGElement, letters: ParsedLetter[]) {
    this.svgEl = svgEl;
    this.letters = letters;
    this.defs = this.ensureDefs();
    this.ensureBlurFilters();
  }

  private ensureDefs(): SVGDefsElement {
    let defs = this.svgEl.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      this.svgEl.insertBefore(defs, this.svgEl.firstChild);
    }
    return defs as SVGDefsElement;
  }

  private ensureBlurFilters() {
    for (const letter of this.letters) {
      const filterId = `blur-${letter.id}`;
      let fe = this.defs.querySelector<SVGFEGaussianBlurElement>(`#${filterId} feGaussianBlur`);
      if (!fe) {
        const filter = document.createElementNS(SVG_NS, 'filter');
        filter.setAttribute('id', filterId);
        filter.setAttribute('x', '-60%');
        filter.setAttribute('y', '-60%');
        filter.setAttribute('width', '220%');
        filter.setAttribute('height', '220%');
        fe = document.createElementNS(SVG_NS, 'feGaussianBlur') as unknown as SVGFEGaussianBlurElement;
        fe.setAttribute('stdDeviation', '0 0');
        filter.appendChild(fe);
        this.defs.appendChild(filter);
      }
      this.blurFilters.set(letter.id, fe);
    }
  }

  applyTime(t: number, config: AnimConfig): void {
    // Drop Shadow del SVG raíz: usar filtro SVG nativo en lugar de CSS.
    // CSS style.filter se pierde cuando el SVG se serializa para exportar via drawImage.
    const rootShadowId = 'ribbit-root-dropshadow';
    let rootFilterEl = this.defs.querySelector(`#${rootShadowId}`);
    if (config.dropShadowEnabled) {
      if (!rootFilterEl) {
        rootFilterEl = document.createElementNS(SVG_NS, 'filter');
        rootFilterEl.setAttribute('id', rootShadowId);
        rootFilterEl.setAttribute('x', '-20%');
        rootFilterEl.setAttribute('y', '-20%');
        rootFilterEl.setAttribute('width', '140%');
        rootFilterEl.setAttribute('height', '140%');
        const feDs = document.createElementNS(SVG_NS, 'feDropShadow');
        feDs.setAttribute('dx', '4');
        feDs.setAttribute('dy', '6');
        feDs.setAttribute('stdDeviation', '8');
        feDs.setAttribute('flood-color', 'rgba(0,0,0,0.45)');
        rootFilterEl.appendChild(feDs);
        this.defs.appendChild(rootFilterEl);
      }
      this.svgEl.setAttribute('filter', `url(#${rootShadowId})`);
      this.svgEl.style.filter = '';
    } else {
      if (rootFilterEl) rootFilterEl.remove();
      this.svgEl.removeAttribute('filter');
      this.svgEl.style.filter = '';
    }

    // Quitamos la sobreescritura forzada de overflow visible
    // this.svgEl.setAttribute('overflow', 'visible');

    // Stagger normalizado: si hay muchos elementos, comprimimos el stagger
    // automáticamente para que la animación de entrada nunca dure más de 2s.
    // Esto mantiene la interfaz ágil sin cambiar el control del usuario.
    const MAX_ENTRANCE_SECONDS = 2.0;
    const rawEntrance = getTotalAnimationDuration(this.letters, config);
    let effectiveConfig = config;
    if (rawEntrance > MAX_ENTRANCE_SECONDS && this.letters.length > 1) {
      const maxIndex = Math.max(...this.letters.map((l) => l.index));
      const normalizedStagger = maxIndex > 0
        ? Math.max(0.001, (MAX_ENTRANCE_SECONDS - config.duration) / maxIndex)
        : config.stagger;
      effectiveConfig = { ...config, stagger: normalizedStagger };
    }

    const entranceDuration = getTotalAnimationDuration(this.letters, effectiveConfig);
    const VISUAL_DURATION = config.clipDuration;
    const animDuration = Math.min(entranceDuration, VISUAL_DURATION / 2);
    let evalTime = t;
    if (t < animDuration) {
      evalTime = t;
    } else if (t > VISUAL_DURATION - animDuration) {
      evalTime = VISUAL_DURATION - t;
    } else {
      evalTime = animDuration;
    }

    for (const letter of this.letters) {
      const state = computeFrameStateWithBlur(evalTime, letter, effectiveConfig);
      const { cx, cy } = letter;
      
      // Calcular Wiggle (temblor suave y delicado en su eje central)
      let wiggleX = 0;
      let wiggleY = 0;
      let wiggleRot = 0;
      const isImgNode = letter.el.tagName.toLowerCase() === 'image';
      
      // Obtener el factor de progreso de la animación de entrada para amortiguar el Wiggle al surgir
      const delay = letter.index * config.stagger;
      const localT = (evalTime - delay) / config.duration;
      const entryProgress = Math.max(0, Math.min(1, localT)); // 0.0 al inicio, 1.0 al terminar la entrada

      if (isImgNode && config.imageModeActive && config.imageWiggleEnabled) {
        // Multiplicamos por entryProgress para que el Wiggle sea 0.0 al inicio y no desvíe el centro de surgimiento
        const tScaled = t * 2.5;
        wiggleX = Math.sin(tScaled) * Math.cos(tScaled * 0.6) * config.imageWiggleIntensity * entryProgress;
        wiggleY = Math.cos(tScaled * 0.8) * Math.sin(tScaled * 0.4) * config.imageWiggleIntensity * entryProgress;
        wiggleRot = Math.sin(tScaled * 0.5) * (config.imageWiggleIntensity * 0.3) * entryProgress;
      }

      // 1. Transformación de Entrada clásica (Escala, Traslación y Rotación)
      const transX = state.translateX + wiggleX;
      const transY = state.translateY + wiggleY;
      const rot = state.rotation + wiggleRot;
      const scale = state.scale;

      const base = letter.el.getAttribute('data-base-transform');

      // 2. Unificar transformaciones si es un nodo de Imagen para evitar que CSS anule a SVG transform
      if (isImgNode && config.imageModeActive) {
        const htmlStyle = (letter.el as unknown as HTMLElement).style;
        htmlStyle.transformOrigin = `${cx}px ${cy}px`;
        
        // Base de entrada SVG expresada en sintaxis de transformación CSS standard
        let transformStr = `translate(${transX}px, ${transY}px) rotate(${rot}deg) scale(${scale})`;
        
        // Si además tiene 3D activado, añadimos perspectiva y rotación de costado
        if (config.image3DEnabled) {
          const angleX = Math.sin(t * 1.8) * 1.5; 
          const angleY = Math.sin(t * 2.2) * config.image3DDepth; // Yaw de costado
          transformStr = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(0) ${transformStr}`;
        }
        
        htmlStyle.transform = transformStr;
        
        // Limpiamos atributo SVG para evitar duplicaciones
        letter.el.removeAttribute('transform');
      } else {
        // Modo Texto u otros vectores: usar atributos SVG nativos estables
        const entrance = `translate(${cx} ${cy}) translate(${transX} ${transY}) rotate(${rot}) scale(${scale}) translate(${-cx} ${-cy})`;
        letter.el.setAttribute('transform', base ? `${base} ${entrance}` : entrance);
        
        // Limpiamos estilo CSS residual
        const htmlStyle = (letter.el as unknown as HTMLElement).style;
        htmlStyle.transform = '';
      }

      letter.el.setAttribute('opacity', String(state.opacity));

      // Filtros visuales: Resplandor (Glow) + Sombra Proyectada 3D reactiva
      // IMPORTANTE: usamos filtros SVG nativos (<filter> en <defs>) en lugar de CSS style.filter.
      // CSS filter se pierde cuando el SVG se serializa para exportar (drawImage ignora CSS externos).
      if (isImgNode && config.imageModeActive) {
        const imgFilterId = `img-filter-${letter.id}`;
        let imgFilter = this.defs.querySelector(`#${imgFilterId}`);

        const needs3DShadow = config.image3DEnabled;
        const needsGlow = config.imageGlowEnabled;

        if (needs3DShadow || needsGlow) {
          if (!imgFilter) {
            imgFilter = document.createElementNS(SVG_NS, 'filter');
            imgFilter.setAttribute('id', imgFilterId);
            imgFilter.setAttribute('x', '-60%');
            imgFilter.setAttribute('y', '-60%');
            imgFilter.setAttribute('width', '220%');
            imgFilter.setAttribute('height', '220%');
            imgFilter.setAttribute('color-interpolation-filters', 'sRGB');
            this.defs.appendChild(imgFilter);
          }
          // Reconstruir el filtro compuesto en cada frame para valores dinámicos
          imgFilter.innerHTML = '';

          // Merge source: empezamos siempre desde SourceGraphic
          let lastResult = 'SourceGraphic';
          let primitiveIndex = 0;

          if (needs3DShadow) {
            const yawAngle = Math.sin(t * 2.2) * config.image3DDepth;
            const shadowOffsetX = -Math.round(yawAngle * 0.8);
            const shadowOffsetY = 10;
            const shadowBlur = Math.max(0.1, (12 + Math.abs(yawAngle) * 0.4) / 2);
            const resultId = `r${primitiveIndex++}`;

            const feDs = document.createElementNS(SVG_NS, 'feDropShadow');
            feDs.setAttribute('in', lastResult);
            feDs.setAttribute('dx', String(shadowOffsetX));
            feDs.setAttribute('dy', String(shadowOffsetY));
            feDs.setAttribute('stdDeviation', String(shadowBlur));
            feDs.setAttribute('flood-color', 'rgba(0,0,0,0.45)');
            feDs.setAttribute('result', resultId);
            imgFilter.appendChild(feDs);
            lastResult = resultId;
          }

          if (needsGlow) {
            const glowBlur = Math.max(0.1, config.imageGlowRadius / 2);
            const resultBlur = `r${primitiveIndex++}`;
            const resultFlood = `r${primitiveIndex++}`;
            const resultComp = `r${primitiveIndex++}`;
            const resultMerge = `r${primitiveIndex++}`;

            // Blur de la imagen para el glow
            const feBlur = document.createElementNS(SVG_NS, 'feGaussianBlur');
            feBlur.setAttribute('in', 'SourceGraphic');
            feBlur.setAttribute('stdDeviation', String(glowBlur));
            feBlur.setAttribute('result', resultBlur);
            imgFilter.appendChild(feBlur);

            // Color del glow
            const feFlood = document.createElementNS(SVG_NS, 'feFlood');
            feFlood.setAttribute('flood-color', config.imageGlowColor);
            feFlood.setAttribute('flood-opacity', '1');
            feFlood.setAttribute('result', resultFlood);
            imgFilter.appendChild(feFlood);

            // Compositar el color del flood sobre el blur (silueta del glow)
            const feComp = document.createElementNS(SVG_NS, 'feComposite');
            feComp.setAttribute('in', resultFlood);
            feComp.setAttribute('in2', resultBlur);
            feComp.setAttribute('operator', 'in');
            feComp.setAttribute('result', resultComp);
            imgFilter.appendChild(feComp);

            // Combinar: glow debajo + imagen original encima
            const feMerge = document.createElementNS(SVG_NS, 'feMerge');
            feMerge.setAttribute('result', resultMerge);
            const n1 = document.createElementNS(SVG_NS, 'feMergeNode');
            n1.setAttribute('in', resultComp);
            const n2 = document.createElementNS(SVG_NS, 'feMergeNode');
            n2.setAttribute('in', lastResult);
            feMerge.appendChild(n1);
            feMerge.appendChild(n2);
            imgFilter.appendChild(feMerge);
            lastResult = resultMerge;
          }

          letter.el.setAttribute('filter', `url(#${imgFilterId})`);
          letter.el.style.filter = '';
        } else {
          // Sin filtros: limpiar
          if (imgFilter) imgFilter.remove();
          letter.el.removeAttribute('filter');
          letter.el.style.filter = '';
        }
      } else if (!isImgNode) {
        // Para paths de texto: limpiar cualquier filter de imagen residual
        letter.el.style.filter = '';
      }

      // Animación de Brillo (Sheen / Flash de Luz único durante la entrada)
      const shineId = `shine-grad-${letter.id}`;
      const maskId = `shine-mask-${letter.id}`;
      const overlayId = `shine-overlay-${letter.id}`;
      let shineGrad = this.defs.querySelector(`#${shineId}`);
      if (isImgNode && config.imageModeActive && config.imageShineEnabled) {
        // 1. Crear gradiente lineal de brillo delgado y elegante si no existe
        if (!shineGrad) {
          shineGrad = document.createElementNS(SVG_NS, 'linearGradient');
          shineGrad.setAttribute('id', shineId);
          shineGrad.setAttribute('gradientUnits', 'objectBoundingBox');
          shineGrad.setAttribute('x1', '0');
          shineGrad.setAttribute('y1', '0');
          shineGrad.setAttribute('x2', '1');
          shineGrad.setAttribute('y2', '0');
          // Gradiente metálico más estrecho (paradas juntas en 42%, 50%, 58%) para una línea delgada y definida
          shineGrad.innerHTML = `
            <stop offset="0%" stop-color="${config.imageShineColor}" stop-opacity="0" />
            <stop offset="42%" stop-color="${config.imageShineColor}" stop-opacity="0" />
            <stop offset="50%" stop-color="${config.imageShineColor}" stop-opacity="0.95" />
            <stop offset="58%" stop-color="${config.imageShineColor}" stop-opacity="0" />
            <stop offset="100%" stop-color="${config.imageShineColor}" stop-opacity="0" />
          `;
          this.defs.appendChild(shineGrad);
        } else {
          // Siempre reconstruir el innerHTML para garantizar que el color picker se actualice instantáneamente sin bugs
          shineGrad.innerHTML = `
            <stop offset="0%" stop-color="${config.imageShineColor}" stop-opacity="0" />
            <stop offset="42%" stop-color="${config.imageShineColor}" stop-opacity="0" />
            <stop offset="50%" stop-color="${config.imageShineColor}" stop-opacity="0.95" />
            <stop offset="58%" stop-color="${config.imageShineColor}" stop-opacity="0" />
            <stop offset="100%" stop-color="${config.imageShineColor}" stop-opacity="0" />
          `;
        }

        // 2. Crear una máscara SVG (<mask>) que use los píxeles alfa reales de la propia imagen
        // Esto elimina por completo el recuadro blanco en las esquinas transparentes del PNG.
        let maskEl = this.defs.querySelector(`#${maskId}`) as SVGMaskElement | null;
        if (!maskEl) {
          maskEl = document.createElementNS(SVG_NS, 'mask') as unknown as SVGMaskElement;
          maskEl.setAttribute('id', maskId);
          maskEl.setAttribute('maskUnits', 'userSpaceOnUse');
          this.defs.appendChild(maskEl);
        }
        
        // Clonar o actualizar la imagen de referencia dentro de la máscara para pintar la silueta en blanco (opaco)
        maskEl.innerHTML = '';
        const imgRef = letter.el.cloneNode(true) as SVGImageElement;
        imgRef.removeAttribute('id');
        imgRef.removeAttribute('filter');
        imgRef.removeAttribute('clip-path');
        // Aplicamos filter brightness para forzar a que el PNG tenga opacidad blanca pura para la máscara
        imgRef.style.filter = 'brightness(0) invert(1)';
        imgRef.style.mixBlendMode = 'normal';
        maskEl.appendChild(imgRef);

        // 3. Crear el rect de superposición de brillo
        let overlay = this.svgEl.querySelector(`#${overlayId}`) as SVGGraphicsElement;
        if (!overlay) {
          overlay = document.createElementNS(SVG_NS, 'rect') as unknown as SVGGraphicsElement;
          overlay.setAttribute('id', overlayId);
          overlay.setAttribute('pointer-events', 'none');
          // mixBlendMode color-dodge le da un brillo de destello luminoso muy real
          overlay.style.mixBlendMode = 'color-dodge';
          letter.el.parentNode?.insertBefore(overlay, letter.el.nextSibling);
        }

        // Animación de barrido: el gradiente se traslada de izquierda a derecha usando el tiempo real t
        const delay = letter.index * config.stagger;
        const totalDurationShine = config.duration * 1.8;
        const shineTime = t - delay;
        const progress = Math.max(0, Math.min(1, shineTime / totalDurationShine));
        
        // Calcular desvanecimiento:
        // 1. Si no ha empezado el tiempo del brillo (shineTime < 0) o ya culminó por completo (shineTime > totalDurationShine),
        //    forzamos opacidad a 0 absoluta y ocultamos el elemento para evitar cualquier mancha o fuga.
        let shineFade = 1.0;
        if (shineTime <= 0.0 || shineTime >= totalDurationShine) {
          shineFade = 0.0;
        } else if (progress > 0.7) {
          // Desvanecimiento progresivo al final del barrido
          shineFade = (1.0 - progress) / 0.3; 
        }
        
        // Sincronizar dimensiones, transformaciones y aplicar la máscara alfa del PNG
        try {
          const widthAttr = letter.el.getAttribute('width') || '100';
          const heightAttr = letter.el.getAttribute('height') || '100';
          const xAttr = letter.el.getAttribute('x') || '0';
          const yAttr = letter.el.getAttribute('y') || '0';
          overlay.setAttribute('x', xAttr);
          overlay.setAttribute('y', yAttr);
          overlay.setAttribute('width', widthAttr);
          overlay.setAttribute('height', heightAttr);
          overlay.setAttribute('transform', letter.el.getAttribute('transform') || '');
          
          if (shineFade <= 0) {
            overlay.style.display = 'none';
          } else {
            overlay.style.display = '';
          }
          
          // La opacidad combina la opacidad de entrada de la propia imagen (fade-in) 
          // con la rampa de desvanecimiento del destello (fade-out)
          const baseOpacity = parseFloat(letter.el.getAttribute('opacity') || '1');
          overlay.setAttribute('opacity', String(baseOpacity * shineFade));
          
          // Aplicamos la máscara de silueta PNG nativa
          overlay.setAttribute('mask', `url(#${maskId})`);
        } catch {}

        // Ampliamos el rango de recorrido (Offset de -4.0 a 4.0 para un total de delta 8.0)
        // Esto garantiza que la línea metálica empiece y termine COMPLETAMENTE FUERA de la imagen
        const gradientOffset = -4.0 + progress * 8.0; 
        shineGrad.setAttribute('gradientTransform', `translate(${gradientOffset}, 0) rotate(30 0.5 0.5)`);
        overlay.setAttribute('fill', `url(#${shineId})`);
      } else {
        // Limpieza si se desactiva
        if (shineGrad) shineGrad.remove();
        const maskEl = this.defs.querySelector(`#${maskId}`);
        if (maskEl) maskEl.remove();
        const overlay = this.svgEl.querySelector(`#${overlayId}`);
        if (overlay) overlay.remove();
      }

      // Garantizar que exista un elemento de máscara nativa <clipPath> en <defs> para esta letra
      const clipId = `clip-${letter.id}`;
      let clipEl = this.defs.querySelector(`#${clipId}`);
      if (!clipEl) {
        clipEl = document.createElementNS(SVG_NS, 'clipPath');
        clipEl.setAttribute('id', clipId);
        // Indicamos objectBoundingBox para que el clipPath escale automáticamente
        // de 0.0 a 1.0 según la forma de la letra (bounding box de la letra)
        clipEl.setAttribute('clipPathUnits', 'objectBoundingBox');
        this.defs.appendChild(clipEl);
      }

      // Actualizar el contenido de la máscara nativa
      if (state.clipPath && state.clipPath !== 'none') {
        // En los tipos definimos el valor retornado por computeClipPath para que sea una forma válida de SVG
        // ej: "rect(0 0 0 0)" o "polygon(...)". Convertimos la instrucción del state
        // en elementos SVG nativos internos del <clipPath>
        clipEl.innerHTML = '';
        if (state.clipPath.startsWith('inset(')) {
          // Parsear inset(top% right% bottom% left%)
          // ej: inset(20% 0 0 0)
          const matches = state.clipPath.match(/[\d.]+/g);
          if (matches) {
            const top = parseFloat(matches[0]) / 100;
            const right = parseFloat(matches[1]) / 100;
            const bottom = parseFloat(matches[2]) / 100;
            const left = parseFloat(matches[3]) / 100;
            const rect = document.createElementNS(SVG_NS, 'rect');
            rect.setAttribute('x', String(left));
            rect.setAttribute('y', String(top));
            rect.setAttribute('width', String(1 - left - right));
            rect.setAttribute('height', String(1 - top - bottom));
            clipEl.appendChild(rect);
          }
        } else if (state.clipPath.startsWith('polygon(')) {
          // Parsear polygon(x y, x y, ...)
          const pointsStr = state.clipPath.replace('polygon(', '').replace(')', '');
          const polygon = document.createElementNS(SVG_NS, 'polygon');
          polygon.setAttribute('points', pointsStr);
          clipEl.appendChild(polygon);
        }
        letter.el.setAttribute('clip-path', `url(#${clipId})`);
      } else {
        clipEl.innerHTML = '';
        letter.el.removeAttribute('clip-path');
      }

      if (letter.kind === 'outline') {
        // En modo text edit: usar el color del editor. En modo SVG importado: respetar el original.
        if (config.textEditActive) {
          letter.el.setAttribute('stroke', config.outlineColor);
        } else if (letter.originalStroke) {
          // Restaurar siempre el stroke original del SVG diseñado
          letter.el.setAttribute('stroke', letter.originalStroke);
        }

        // Solo aplicamos stroke-dasharray (write-on) en paths simples.
        // Los compound paths (múltiples subpaths con M/m) producen artefactos:
        // líneas fantasma y trazos cortados, porque el dash pattern se reinicia
        // en cada subpath con una longitud total incorrecta.
        const canWriteOn = config.writeOn && !letter.isCompoundPath && letter.length > 0;
        if (canWriteOn) {
          letter.el.setAttribute('stroke-dasharray', `${letter.length} ${letter.length}`);
          letter.el.setAttribute('stroke-dashoffset', String(state.dashOffset ?? 0));
        } else {
          // Limpiamos cualquier dasharray residual de frames anteriores
          letter.el.removeAttribute('stroke-dasharray');
          letter.el.removeAttribute('stroke-dashoffset');
        }

        // Restaurar fill original si lo tenía (ej: elemento con stroke Y fill como un rect de tarjeta)
        if (config.textEditActive) {
          // En modo texto, no tocar el fill del outline (lo gestiona el motor de texto)
        } else if (letter.originalFill) {
          letter.el.setAttribute('fill', letter.originalFill);
        }
      } else {
        // Modo fill
        if (config.textEditActive) {
          // En edición de texto, usar color del editor
          letter.el.setAttribute('fill', config.fillColor);
        } else if (letter.originalFill) {
          // SVG importado: restaurar fill original, NUNCA sobreescribir con el color del editor
          letter.el.setAttribute('fill', letter.originalFill);
        }

        // fill-opacity para el efecto de aparición con fundido
        letter.el.setAttribute('fill-opacity', String(state.fillOpacity ?? 1));

        // Restaurar stroke original si lo tenía (ej: icono vectorial con contorno y relleno)
        if (!config.textEditActive && letter.originalStroke) {
          letter.el.setAttribute('stroke', letter.originalStroke);
        } else if (config.textEditActive) {
          // En modo texto, limpiar stroke heredado
          letter.el.removeAttribute('stroke');
        }

        // Siempre limpiar dasharray en fills para evitar artefactos de frames anteriores
        letter.el.removeAttribute('stroke-dasharray');
        letter.el.removeAttribute('stroke-dashoffset');
      }

      const fe = this.blurFilters.get(letter.id);
      if (fe) {
        if (state.blurStdDeviation > 0.01) {
          fe.setAttribute('stdDeviation', blurStdDeviationPair(state));
          letter.el.setAttribute('filter', `url(#blur-${letter.id})`);
        } else {
          letter.el.removeAttribute('filter');
        }
      }
    }
  }
}
