import { PauseIcon, PlayIcon, ReplayIcon } from '../icons';

interface Props {
  isPlaying: boolean;
  time: number;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  fileLabel: string;
}

export function PlaybackToolbar({ isPlaying, time, onPlay, onPause, onReplay, fileLabel }: Props) {
  return (
    <div className="preview-top-bar">
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
      <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-sub)' }}>{time.toFixed(2)}s</span>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 12, color: 'var(--text-sub)', fontStyle: 'italic' }}>{fileLabel}</span>
    </div>
  );
}
