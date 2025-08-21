import { useEffect, useRef } from 'react';

export default function useRafLoop(callback: (dtMs: number) => void, running: boolean) {
  const rafId = useRef<number>();
  const lastTime = useRef<number>(0);

  useEffect(() => {
    if (!running) return;

    const tick = (time: number) => {
      const dt = lastTime.current ? time - lastTime.current : 16;
      lastTime.current = time;
      callback(dt);
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      lastTime.current = 0;
    };
  }, [callback, running]);
}