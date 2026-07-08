import { useEffect, useRef } from 'react';
import { UploadCloudIcon } from '../icons';

interface Props {
  svgEl: SVGSVGElement | null;
  onRequestUpload: () => void;
  imageModeActive: boolean;
}

export function SvgStage({ svgEl, onRequestUpload, imageModeActive }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgEl) return;

    // El SVG puede llegar con overflow="hidden" como atributo propio,
    // lo que anula el CSS overflow:visible. Forzamos visible aquí.
    svgEl.setAttribute('overflow', 'visible');
    svgEl.style.overflow = 'visible';

    // Forzamos al navegador a centrar y contener la escala del gráfico
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Forzamos que se escale y se contenga dentro de la mesa de reproducción sin desbordar
    svgEl.style.maxWidth = '100%';
    svgEl.style.maxHeight = '100%';
    svgEl.style.width = '100%';
    svgEl.style.height = '100%';
    svgEl.style.objectFit = 'contain';

    container.appendChild(svgEl);
    return () => {
      if (svgEl.parentElement === container) container.removeChild(svgEl);
    };
  }, [svgEl]);

  return (
    <div id="svg-holder" ref={containerRef}>
      {!svgEl && (
        <div className="svg-holder-empty" onClick={onRequestUpload} title={imageModeActive ? "Haz clic para subir una imagen PNG / JPG" : "Haz clic para subir un archivo SVG"}>
          <UploadCloudIcon />
          {imageModeActive ? "Carga o arrastra una imagen PNG / JPG" : "Carga o arrastra un archivo SVG"}
          <br />
          <span style={{ fontSize: 12, opacity: 0.6, color: 'var(--accent)' }}>
            Haz clic aquí o en el panel derecho para animar
          </span>
        </div>
      )}
    </div>
  );
}
