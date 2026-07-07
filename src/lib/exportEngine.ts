import type { AnimConfig, ParsedSvg } from '../types';
import { AVIWriter } from './aviWriter';
import type { FrameRenderer } from './frameRenderer';

export interface ExportProgress {
  current: number;
  total: number;
}

function svgToImage(svgEl: SVGSVGElement): Promise<HTMLImageElement> {
  // Asegurar que el SVG tiene el namespace correcto para rasterización
  svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  const xml = new XMLSerializer().serializeToString(svgEl);
  // Usar Blob URL en vez de base64 para mayor compatibilidad con SVGs complejos
  // (gradientes, filtros, imágenes embebidas, etc.)
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo rasterizar el frame SVG'));
    };
    img.src = url;
  });
}

/**
 * Renderiza frame a frame el SVG (con la animación ya aplicada por FrameRenderer) sobre un
 * canvas offscreen y alimenta el AVIWriter. t = frameIndex / fps para cada frame, de modo
 * que el resultado es determinista e idéntico al preview.
 */
export async function exportToAvi(
  parsed: ParsedSvg,
  renderer: FrameRenderer,
  config: AnimConfig,
  totalDuration: number,
  onProgress: (progress: ExportProgress) => void,
): Promise<Blob> {
  const { svgEl, viewBox } = parsed;

  const exportWidth = 960;
  const exportHeight = 540;
  const EXPORT_VIDEO_DURATION = 10.0;
  const totalFrames = Math.max(1, Math.ceil(EXPORT_VIDEO_DURATION * config.fps));

  const originalViewBox = svgEl.getAttribute('viewBox');
  const originalWidth = svgEl.getAttribute('width');
  const originalHeight = svgEl.getAttribute('height');
  const originalOverflow = svgEl.getAttribute('overflow');

  // Determinar margen adicional si el resplandor luminoso (Glow) está activo para evitar recortes
  const glowPadding = (config.imageModeActive && config.imageGlowEnabled) 
    ? Math.ceil(config.imageGlowRadius * 1.5) 
    : 0;

  const paddingX = 40 + glowPadding;
  const currentCanvasPadding = config.canvasPadding + glowPadding;
  const svgWidth = (viewBox.width + paddingX * 2) || 1;
  const svgHeight = (viewBox.height + currentCanvasPadding * 2) || 1;
  
  // Calcular escala para ajustar el SVG dentro de los límites de 960x540 manteniendo el aspect ratio
  const fitScale = Math.min(exportWidth / svgWidth, exportHeight / svgHeight) * config.renderScale;
  const dWidth = Math.round(svgWidth * fitScale);
  const dHeight = Math.round(svgHeight * fitScale);

  // Centrado en el canvas
  const dx = Math.round((exportWidth - dWidth) / 2);
  const dy = Math.round((exportHeight - dHeight) / 2);

  // Aplicar dimensiones explícitas y viewBox al SVG antes de rasterizar
  svgEl.setAttribute('overflow', 'visible');
  svgEl.setAttribute(
    'viewBox',
    `${viewBox.minX - paddingX} ${viewBox.minY - currentCanvasPadding} ${svgWidth} ${svgHeight}`,
  );
  // Las dimensiones width/height deben coincidir exactamente con lo que dibujaremos en el canvas
  svgEl.setAttribute('width', String(dWidth));
  svgEl.setAttribute('height', String(dHeight));

  const canvas = document.createElement('canvas');
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('No se pudo crear el contexto 2D para exportar');

  const writer = new AVIWriter(exportWidth, exportHeight, config.fps);

  try {
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const t = frameIndex / config.fps;
      renderer.applyTime(t, config);

      const img = await svgToImage(svgEl);
      // Limpiar a transparente (no a negro)
      ctx.clearRect(0, 0, exportWidth, exportHeight);
      // Dibujar exactamente en las coordenadas calculadas — sin escalar de nuevo
      ctx.drawImage(img, dx, dy, dWidth, dHeight);
      const imageData = ctx.getImageData(0, 0, exportWidth, exportHeight);
      writer.addFrame(imageData);

      onProgress({ current: frameIndex + 1, total: totalFrames });
    }
  } finally {
    // Restaurar atributos originales del SVG
    if (originalViewBox !== null) svgEl.setAttribute('viewBox', originalViewBox);
    else svgEl.removeAttribute('viewBox');
    if (originalWidth !== null) svgEl.setAttribute('width', originalWidth);
    else svgEl.removeAttribute('width');
    if (originalHeight !== null) svgEl.setAttribute('height', originalHeight);
    else svgEl.removeAttribute('height');
    if (originalOverflow !== null) svgEl.setAttribute('overflow', originalOverflow);
    else svgEl.removeAttribute('overflow');
  }

  return writer.finalize();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
