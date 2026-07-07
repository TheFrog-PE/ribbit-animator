import { useCallback, useEffect, useRef, type DragEvent } from 'react';
import type { AnimConfig } from '../../types';
import type { FrameRenderer } from '../../lib/frameRenderer';
import { usePlayback } from '../../hooks/usePlayback';
import { PlaybackToolbar } from './PlaybackToolbar';
import { SvgStage } from './SvgStage';
import { PresetsFloatingBar } from './PresetsFloatingBar';
import { MotionBlurToggle } from './MotionBlurToggle';

interface Props {
  svgEl: SVGSVGElement | null;
  renderer: FrameRenderer | null;
  totalDuration: number;
  config: AnimConfig;
  onChange: (patch: Partial<AnimConfig>) => void;
  currentFileLabel: string;
  originalColors: { outline: string; fill: string } | null;
  onDropFiles: (files: FileList) => void;
  onRequestUpload: () => void;
  externalPause: boolean;
  resyncSignal: number;
  sceneError: string | null;
}

export function PreviewPane({
  svgEl,
  renderer,
  totalDuration,
  config,
  onChange,
  currentFileLabel,
  originalColors,
  onDropFiles,
  onRequestUpload,
  externalPause,
  resyncSignal,
  sceneError,
}: Props) {
  const rendererRef = useRef(renderer);
  const configRef = useRef(config);
  useEffect(() => {
    rendererRef.current = renderer;
    configRef.current = config;
  }, [renderer, config]);

  const onTick = useCallback((t: number) => {
    rendererRef.current?.applyTime(t, configRef.current);
  }, []);

  const { isPlaying, time, play, pause, replay } = usePlayback(totalDuration, onTick);

  // Repinta el frame actual cuando cambia el renderer (nuevo archivo/modo) o la config en pausa.
  useEffect(() => {
    renderer?.applyTime(time, config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderer, config, resyncSignal]);

  useEffect(() => {
    if (externalPause) pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPause]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) onDropFiles(e.dataTransfer.files);
  };

  return (
    <div
      className="preview-container"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <PlaybackToolbar
        isPlaying={isPlaying}
        time={time}
        onPlay={play}
        onPause={pause}
        onReplay={replay}
        fileLabel={currentFileLabel}
      />

      <div className="preview-window">
        <SvgStage svgEl={svgEl} onRequestUpload={onRequestUpload} imageModeActive={config.imageModeActive} />

        <PresetsFloatingBar config={config} onChange={onChange} originalColors={originalColors} />
        <MotionBlurToggle config={config} onChange={onChange} />

        {sceneError && (
          <div
            style={{
              position: 'absolute',
              top: -34,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--danger)',
            }}
          >
            {sceneError}
          </div>
        )}
      </div>
    </div>
  );
}
