import { useEffect, useRef, useState } from 'react';

const DURATION = 10000;

export function WelcomeToast() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  const elapsed = useRef(0);
  const lastTick = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setLeaving(true);
    setTimeout(() => setVisible(false), 400);
  };

  const startTicking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    lastTick.current = performance.now();
    intervalRef.current = setInterval(() => {
      if (paused.current) return;
      const now = performance.now();
      const delta = now - (lastTick.current ?? now);
      lastTick.current = now;
      elapsed.current += delta;
      const pct = Math.max(0, 100 - (elapsed.current / DURATION) * 100);
      setProgress(pct);
      if (elapsed.current >= DURATION) {
        clearInterval(intervalRef.current!);
        dismiss();
      }
    }, 50);
  };

  useEffect(() => {
    if (!visible) return;
    startTicking();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleMouseEnter = () => { paused.current = true; };
  const handleMouseLeave = () => {
    paused.current = false;
    lastTick.current = performance.now();
  };

  if (!visible) return null;

  return (
    <div
      className={`welcome-toast ${leaving ? 'welcome-toast--leaving' : ''}`}
      role="status"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="welcome-toast-progress">
        <div className="welcome-toast-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="welcome-toast-body">
        <div className="welcome-toast-header">
          <span className="welcome-toast-badge">v0.1 · Gratuito</span>
          <button className="welcome-toast-close" onClick={dismiss} aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="2" y1="2" x2="12" y2="12" />
              <line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>
        </div>

        <h2 className="welcome-toast-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', marginTop: '-2px' }}>
            <ellipse cx="12" cy="13" rx="7" ry="6" />
            <circle cx="8.5" cy="8.5" r="2.5" />
            <circle cx="15.5" cy="8.5" r="2.5" />
            <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
            <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
            <path d="M9.5 16 Q12 18 14.5 16" />
          </svg>
          Bienvenido a RIBBIT
        </h2>

        <p className="welcome-toast-text">
          El <strong>animador de SVG y exportador de video</strong> con canal alfa, completamente en tu navegador — sin servidores ni instalaciones.
        </p>

        <p className="welcome-toast-text">
          Este proyecto está en <strong>fase inicial v0.1</strong>. Podrían presentarse errores — agradecemos que los reportes.
          Algunas funcionalidades como <em>Activar Edición de Texto</em> aún están incompletas; por ahora funciona mejor animando archivos <strong>SVG y PNG</strong>.
        </p>

        <p className="welcome-toast-text welcome-toast-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', marginTop: '-1px' }}>
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          RIBBIT es <strong>open source</strong> y busca crecer con la comunidad. ¡Gracias por ser parte de esto!
        </p>
      </div>
    </div>
  );
}
