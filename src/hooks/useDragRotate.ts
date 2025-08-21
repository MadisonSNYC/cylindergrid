import { useRef, useState, useCallback } from 'react';

interface DragHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
}

interface DragRotateResult {
  dragging: boolean;
  velocity: number;
  handlers: DragHandlers;
}

export default function useDragRotate(): DragRotateResult {
  const startX = useRef(0);
  const lastX = useRef(0);
  const velocityRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Capture pointer
    (e.target as Element).setPointerCapture?.(e.pointerId);
    startX.current = lastX.current = e.clientX;
    velocityRef.current = 0;
    setDragging(true);
    // Prevent text selection
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    // Store velocity in px/frame for inertia calculation
    velocityRef.current = dx;
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const onPointerLeave = useCallback(() => {
    setDragging(false);
  }, []);

  return {
    dragging,
    velocity: velocityRef.current,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave,
    },
  };
}