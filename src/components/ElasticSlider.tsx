import { useRef, useState, useCallback, useId } from 'react';

interface Props {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

/**
 * Slider elástico con micro-interacciones:
 * - La pista se ensancha al hacer clic/drag.
 * - El thumb escala y emite un "glow" al arrastrarlo.
 * - Al soltar, rebota con una animación spring via CSS keyframes.
 * - El fill de la pista muestra el progreso con un gradiente vivo.
 */
export function ElasticSlider({ min, max, step, value, onChange }: Props) {
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [hoverPct, setHoverPct] = useState<number | null>(null);

  const pct = ((value - min) / (max - min)) * 100;

  const computeValue = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return value;
      const rect = track.getBoundingClientRect();
      const raw = (clientX - rect.left) / rect.width;
      const clamped = Math.max(0, Math.min(1, raw));
      const raw_val = min + clamped * (max - min);
      // Snap to step
      const stepped = Math.round(raw_val / step) * step;
      return Math.max(min, Math.min(max, parseFloat(stepped.toFixed(10))));
    },
    [min, max, step, value],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      setBounce(false);
      const newVal = computeValue(e.clientX);
      onChange(newVal);
    },
    [computeValue, onChange],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragging) {
        const newVal = computeValue(e.clientX);
        onChange(newVal);
      } else {
        const track = trackRef.current;
        if (track) {
          const rect = track.getBoundingClientRect();
          const raw = (e.clientX - rect.left) / rect.width;
          setHoverPct(Math.max(0, Math.min(100, raw * 100)));
        }
      }
    },
    [dragging, computeValue, onChange],
  );

  const handlePointerUp = useCallback(() => {
    if (dragging) {
      setDragging(false);
      setBounce(true);
      setTimeout(() => setBounce(false), 500);
    }
  }, [dragging]);

  const handlePointerLeave = useCallback(() => {
    setHoverPct(null);
    if (dragging) {
      setDragging(false);
      setBounce(true);
      setTimeout(() => setBounce(false), 500);
    }
  }, [dragging]);

  return (
    <div
      id={id}
      className={`elastic-slider${dragging ? ' es-dragging' : ''}${bounce ? ' es-bounce' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      role="slider"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          onChange(Math.min(max, parseFloat((value + step).toFixed(10))));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          onChange(Math.max(min, parseFloat((value - step).toFixed(10))));
        }
      }}
    >
      <div className="es-track" ref={trackRef}>
        {/* Zona hover de brillo */}
        {hoverPct !== null && !dragging && (
          <div
            className="es-hover-glow"
            style={{ left: `${hoverPct}%` }}
          />
        )}
        {/* Fill de progreso */}
        <div className="es-fill" style={{ width: `${pct}%` }} />
        {/* Thumb */}
        <div className="es-thumb" style={{ left: `${pct}%` }} />
      </div>
    </div>
  );
}
