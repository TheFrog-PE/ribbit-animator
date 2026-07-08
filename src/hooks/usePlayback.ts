import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loop de rAF desacoplado del motor de animación: acumula tiempo real y lo reporta vía
 * onTick(t). El motor (FrameRenderer) es quien traduce t a transformaciones concretas.
 */
export function usePlayback(totalDuration: number, onTick: (t: number) => void) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const replay = useCallback(() => {
    timeRef.current = 0;
    setTime(0);
    onTickRef.current(0);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      stopLoop();
      return;
    }

    let last = performance.now();
    const step = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;

      let nextTime = timeRef.current + delta;
      if (totalDuration > 0) {
        if (nextTime >= totalDuration) {
          nextTime = 0; // Bucle infinito: vuelve a empezar
        }
      } else {
        nextTime = 0;
      }

      timeRef.current = nextTime;
      setTime(nextTime);
      onTickRef.current(nextTime);

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return stopLoop;
  }, [isPlaying, totalDuration, stopLoop]);

  useEffect(() => {
    if (timeRef.current > totalDuration) {
      timeRef.current = 0;
      setTime(0);
      onTickRef.current(0);
    }
  }, [totalDuration]);

  const seek = useCallback((newTime: number) => {
    const t = Math.max(0, Math.min(totalDuration, newTime));
    timeRef.current = t;
    setTime(t);
    onTickRef.current(t);
  }, [totalDuration]);

  return { isPlaying, time, play, pause, replay, seek };
}
