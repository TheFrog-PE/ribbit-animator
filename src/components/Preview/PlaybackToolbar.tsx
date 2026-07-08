import { PauseIcon, PlayIcon, ReplayIcon } from '../icons';
import type { AnimConfig } from '../../types';

interface Props {
  isPlaying: boolean;
  time: number;
  totalDuration: number;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onSeek: (newTime: number) => void;
  onChange: (patch: Partial<AnimConfig>) => void;
  fileLabel: string;
}

export function PlaybackToolbar({
  isPlaying,
  time,
  totalDuration,
  onPlay,
  onPause,
  onReplay,
  onSeek,
  onChange,
  fileLabel
}: Props) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0) {
      onChange({ clipDuration: val });
    }
  };

  return (
    <div className="preview-top-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
      {/* Botones de reproducción */}
      {isPlaying ? (
        <button className="toolbar-btn" title="Pausar" onClick={onPause}>
          <PauseIcon />
        </button>
      ) : (
        <button className="toolbar-btn" title="Reproducir" onClick={onPlay}>
          <PlayIcon />
        </button>
      )}
      <button className="toolbar-btn" title="Reiniciar" onClick={onReplay}>
        <ReplayIcon />
      </button>

      {/* Tiempos de reproducción: Actual / Total (Editable) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>
        <span>{time.toFixed(2)}s</span>
        <span>/</span>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.45)',
          borderRadius: '6px',
          padding: '2px 6px',
          boxShadow: '0 0 10px rgba(99, 102, 241, 0.1)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
          <input
            type="number"
            min="0.1"
            max="120"
            step="0.1"
            value={totalDuration}
            onChange={handleDurationChange}
            style={{
              width: '44px',
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontWeight: '700',
              fontFamily: 'monospace',
              fontSize: '12px',
              textAlign: 'center',
              outline: 'none',
              padding: 0,
            }}
            title="Editar duración total del clip"
          />
          <span style={{ color: 'var(--accent)', fontWeight: '600', marginLeft: '1px', fontSize: '11px' }}>s</span>
        </div>
      </div>

      {/* Línea de tiempo interactiva (Scrubber Slider) */}
      <input
        type="range"
        min={0}
        max={totalDuration || 10}
        step={0.01}
        value={time}
        onChange={handleSliderChange}
        className="playback-timeline"
        style={{
          flex: 1,
          cursor: 'pointer',
          accentColor: 'var(--accent)',
          height: '4px',
          borderRadius: '2px',
          background: 'rgba(255, 255, 255, 0.1)',
          outline: 'none',
          WebkitAppearance: 'none'
        }}
      />

      <span style={{ fontSize: 11, color: 'var(--text-sub)', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={fileLabel}>
        {fileLabel}
      </span>
    </div>
  );
}
