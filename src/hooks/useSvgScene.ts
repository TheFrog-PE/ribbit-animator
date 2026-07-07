import { useLayoutEffect, useMemo } from 'react';
import type { AnimConfig, SvgFileEntry } from '../types';
import { parseSvgMarkup } from '../lib/svgParser';
import { buildScene, FrameRenderer } from '../lib/frameRenderer';
import { getTotalAnimationDuration } from '../lib/animationEngine';

export function useSvgScene(activeFile: SvgFileEntry | null, config: AnimConfig) {
  const { parsed, error } = useMemo(() => {
    if (!activeFile) return { parsed: null, error: null };
    try {
      return { parsed: parseSvgMarkup(activeFile.content), error: null };
    } catch (e) {
      return { parsed: null, error: e instanceof Error ? e.message : String(e) };
    }
    // Sólo se re-parsea cuando cambia el archivo activo, no en cada cambio de config.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile?.id]);

  // Aplica las ediciones de texto persistidas (o el texto original) sobre el DOM en vivo.
  // Corre tanto al reparsear (recupera ediciones tras cambiar de archivo y volver) como en cada edición.
  // useLayoutEffect (no useEffect) para que corra antes del useEffect de SvgStage que adjunta
  // el svgEl al DOM visible, evitando un flash del texto original al volver a un archivo editado.
  useLayoutEffect(() => {
    if (!parsed) return;
    for (const node of parsed.textNodes) {
      const value = activeFile?.textEdits?.[node.id] ?? node.originalText;
      if (node.el.textContent !== value) node.el.textContent = value;
    }
  }, [parsed, activeFile?.textEdits]);

  const letters = useMemo(() => {
    if (!parsed) return [];
    return buildScene(parsed, config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    parsed,
    config.textEditActive,
    config.line1,
    config.line2,
    config.fontFamily1,
    config.fontFamily2,
    config.fontSize1,
    config.fontSize2,
    config.yPos1,
    config.yPos2,
    config.letterSpacing,
  ]);

  const renderer = useMemo(() => {
    if (!parsed) return null;
    return new FrameRenderer(parsed.svgEl, letters);
  }, [parsed, letters]);

  const totalDuration = 10.0;

  return { parsed, renderer, totalDuration, error };
}
