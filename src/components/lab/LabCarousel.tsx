import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import projects from '../../data/labProjects';
import '../../styles/lab.css';
import LabTile from './LabTile';
import Lightbox from './Lightbox';
import useReducedMotionPref from '../../hooks/useReducedMotionPref';
import useRafLoop from '../../hooks/useRafLoop';
import useDragRotate from '../../hooks/useDragRotate';

/** Compute radius from tile width and count for tight circle */
function computeRadiusPx(count: number, tileWidthPx: number): number {
  if (count < 3) return 600;
  const r = (tileWidthPx / 2) / Math.tan(Math.PI / count);
  return Math.max(400, Math.min(1200, r));
}

export default function LabCarousel() {
  const prefersReduced = useReducedMotionPref();
  const [isGridView, setIsGridView] = useState<boolean>(() => {
    try {
      return localStorage.getItem('labViewMode') === 'grid';
    } catch {
      return false;
    }
  });

  // Rotation state
  const [rotationDeg, setRotationDeg] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(!prefersReduced && !isGridView);
  const [velocity, setVelocity] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Interaction tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const lastInteractionTime = useRef(0);
  const isHovered = useRef(false);
  const isFocused = useRef(false);

  // Drag handling
  const { dragging, velocity: dragVelocity, handlers } = useDragRotate();

  // Effect to switch to grid view if reduced motion is preferred
  useEffect(() => {
    if (prefersReduced && !isGridView) {
      setIsGridView(true);
      setIsAutoSpinning(false);
    }
  }, [prefersReduced, isGridView]);

  // Save view preference
  useEffect(() => {
    try {
      localStorage.setItem('labViewMode', isGridView ? 'grid' : 'carousel');
    } catch {
      // Ignore localStorage errors
    }
  }, [isGridView]);

  // Handle drag movement
  useEffect(() => {
    if (dragging) {
      setIsAutoSpinning(false);
      setVelocity(0);
      lastInteractionTime.current = Date.now();
    }
  }, [dragging]);

  // Apply drag velocity to rotation
  const handleDragMove = useCallback(() => {
    if (dragging && dragVelocity !== 0) {
      setRotationDeg((prev) => prev + dragVelocity * 0.2); // Convert px to degrees
    }
  }, [dragging, dragVelocity]);

  // Inertia when drag ends
  useEffect(() => {
    if (!dragging && Math.abs(dragVelocity) > 0.1) {
      setVelocity(dragVelocity * 0.2); // Initial velocity from drag
    }
  }, [dragging, dragVelocity]);

  // Handle wheel events
  const handleWheel = useCallback((e: WheelEvent) => {
    if (isGridView || !containerRef.current?.contains(e.target as Node)) return;
    
    e.preventDefault();
    setIsAutoSpinning(false);
    lastInteractionTime.current = Date.now();
    
    // Use deltaY for vertical scroll, deltaX for horizontal
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    setRotationDeg((prev) => prev + delta * 0.1);
  }, [isGridView]);

  // Add wheel listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Handle hover and focus for pause/resume
  const handleMouseEnter = useCallback(() => {
    isHovered.current = true;
    setIsAutoSpinning(false);
    lastInteractionTime.current = Date.now();
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHovered.current = false;
    lastInteractionTime.current = Date.now();
  }, []);

  const handleFocus = useCallback(() => {
    isFocused.current = true;
    setIsAutoSpinning(false);
    lastInteractionTime.current = Date.now();
  }, []);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    lastInteractionTime.current = Date.now();
  }, []);

  // RAF loop for inertia and auto-spin
  useRafLoop((dt) => {
    // Handle drag movement
    handleDragMove();

    // Apply inertia
    if (!dragging && Math.abs(velocity) > 0.01) {
      setRotationDeg((prev) => prev + velocity);
      setVelocity((v) => v * 0.95); // Damping
    }

    // Auto-resume spinning after idle (only if not reduced motion)
    const idleTime = Date.now() - lastInteractionTime.current;
    if (!prefersReduced && !isGridView && !dragging && !isHovered.current && 
        !isFocused.current && idleTime > 2000 && !isAutoSpinning && activeIndex === null) {
      setIsAutoSpinning(true);
    }

    // Auto-spin
    if (isAutoSpinning && !dragging) {
      setRotationDeg((prev) => prev + dt * 0.018); // ~20s for 360°
    }
  }, !isGridView);

  // Calculate tile arrangement
  const count = projects.length;
  const angleDeg = 360 / Math.max(count, 1);
  const approxTileWidthPx = 256;
  const radius = useMemo(() => computeRadiusPx(count, approxTileWidthPx), [count]);

  // Handle tile click for lightbox
  const handleTileClick = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveIndex(index);
    // Announce to screen readers
    const announcement = `Opened project: ${projects[index].title}`;
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = announcement;
      setTimeout(() => { liveRegion.textContent = ''; }, 1000);
    }
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
  }, []);

  return (
    <>
      <section className="lab-section" aria-label="Project showcase">
        <div className="mb-6">
          <button
            type="button"
            className="px-4 py-2 border border-white/80 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            aria-pressed={isGridView}
            aria-label={
              isGridView
                ? 'Switch to immersive 3D carousel view'
                : 'Switch to accessible grid view'
            }
            onClick={() => setIsGridView((v) => !v)}
          >
            {isGridView ? 'View as Carousel' : 'View as Grid'}
          </button>
        </div>

        {!isGridView ? (
          <>
            {/* Skip link for keyboard users */}
            <a 
              href="#skip-to-grid"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
              onClick={(e) => {
                e.preventDefault();
                setIsGridView(true);
                // Focus will move to grid via useEffect
              }}
            >
              Skip 3D view
            </a>
            <div 
            className="lab-root"
            style={{ ['--rotation' as string]: `${rotationDeg}deg` }}
          >
            <div
              ref={containerRef}
              className="lab-carousel"
              data-testid="lab-carousel"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...handlers}
              style={{
                cursor: dragging ? 'grabbing' : 'grab',
                animation: 'none', // We control rotation via --rotation now
                transform: `rotateY(var(--rotation))`,
              }}
            >
              {projects.map((p, i) => {
                // Use CSS variables for CSP-safe transforms
                return (
                  <div
                    key={p.href}
                    className="lab-tile"
                    data-testid="lab-tile"
                    style={{
                      ['--tile-index' as string]: String(i),
                      ['--tile-angle' as string]: `${angleDeg}deg`,
                      ['--radius' as string]: `${radius}px`,
                      transform: `rotateY(calc(var(--tile-index) * var(--tile-angle))) translateZ(var(--radius))`,
                    }}
                  >
                    <LabTile project={p} onTileClick={(e) => handleTileClick(i, e)} />
                  </div>
                );
              })}
            </div>
          </div>
          </>
        ) : (
          <div className="lab-grid" role="region" aria-label="Project grid">
            {projects.map((p, i) => (
              <div key={p.href} className="lab-grid-item" data-testid="lab-tile">
                <LabTile project={p} onTileClick={(e) => handleTileClick(i, e)} />
              </div>
            ))}
          </div>
        )}
      </section>

      <Lightbox
        open={activeIndex !== null}
        onClose={closeLightbox}
        project={activeIndex !== null ? projects[activeIndex] : null}
      />
      
      {/* ARIA live region for announcements */}
      <div 
        id="aria-live-region" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      />
    </>
  );
}