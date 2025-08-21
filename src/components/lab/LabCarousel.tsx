import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import projects from '../../data/labProjects';
import '../../styles/lab.css';
import LabTile from './LabTile';
import Lightbox from './Lightbox';
import useReducedMotionPref from '../../hooks/useReducedMotionPref';
import useRafLoop from '../../hooks/useRafLoop';
import useDragRotate from '../../hooks/useDragRotate';
import { defaultFxConfig, shouldEnableFx } from '../../lib/flags';
import FxToggle from '../settings/FxToggle';

/** Compute radius from tile width and count for tight circle */
function computeRadiusPx(count: number, tileWidthPx: number): number {
  if (count < 3) return 600;
  const r = tileWidthPx / 2 / Math.tan(Math.PI / count);
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

  // Visual FX state (OFF by default)
  const [fx, setFx] = useState({
    enabled: false,
    scanlines: defaultFxConfig.scanlines,
    rgbSplitOnHover: defaultFxConfig.rgbSplitOnHover,
    depthFade: defaultFxConfig.depthFade,
  });

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
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isGridView || !containerRef.current?.contains(e.target as Node)) return;

      e.preventDefault();
      setIsAutoSpinning(false);
      lastInteractionTime.current = Date.now();

      // Use deltaY for vertical scroll, deltaX for horizontal
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      setRotationDeg((prev) => prev + delta * 0.1);
    },
    [isGridView],
  );

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
    if (
      !prefersReduced &&
      !isGridView &&
      !dragging &&
      !isHovered.current &&
      !isFocused.current &&
      idleTime > 2000 &&
      !isAutoSpinning &&
      activeIndex === null
    ) {
      setIsAutoSpinning(true);
    }

    // Auto-spin
    if (isAutoSpinning && !dragging) {
      setRotationDeg((prev) => prev + dt * 0.018); // ~20s for 360° - normal speed
    }
  }, !isGridView);

  // Calculate tile arrangement
  const count = projects.length;
  const angleDeg = 360 / Math.max(count, 1);
  const approxTileWidthPx = 256;
  const radius = useMemo(() => computeRadiusPx(count, approxTileWidthPx), [count]);

  // Helper for depth factor in [0..1], simple cosine of angle to camera (0deg front)
  const depthForIndex = useCallback(
    (i: number) => {
      // Calculate the current angle of this tile relative to the viewer
      const tileAngle = angleDeg * i + rotationDeg;
      // Normalize to 0-360 range
      const normalizedAngle = ((tileAngle % 360) + 360) % 360;
      // Convert to radians
      const rad = (normalizedAngle * Math.PI) / 180;
      // front ≈ 0deg -> cos(0) = 1; back ≈ 180deg -> cos(π) = -1
      // Map from [-1, 1] to [0, 1] where 1 is front, 0 is back
      const depth = (Math.cos(rad) + 1) / 2;
      return depth;
    },
    [angleDeg, rotationDeg],
  );

  // Handle tile click for lightbox
  const handleTileClick = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveIndex(index);
    // Announce to screen readers
    const announcement = `Opened project: ${projects[index]?.title ?? 'Unknown'}`;
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = announcement;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
  }, []);

  // Apply FX only if enabled AND environment allows it
  // TEMP: Force FX on for testing (bypass hardware/motion checks)
  const fxActive = fx.enabled; // && shouldEnableFx(prefersReduced);

  // Debug: log the FX state
  console.log('FX Debug:', {
    'fx.enabled': fx.enabled,
    prefersReduced: prefersReduced,
    shouldEnableFx: shouldEnableFx(prefersReduced),
    fxActive: fxActive,
    hardwareConcurrency: navigator.hardwareConcurrency,
  });

  return (
    <>
      <section
        className={`lab-section ${fxActive ? 'lab-fx--on' : ''}`}
        aria-label="Project showcase"
      >
        <div className="mb-6">
          <button
            type="button"
            className="px-4 py-2 border border-white/80 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            aria-pressed={isGridView}
            aria-label={
              isGridView ? 'Switch to immersive 3D carousel view' : 'Switch to accessible grid view'
            }
            onClick={() => setIsGridView((v) => !v)}
          >
            {isGridView ? 'View as Carousel' : 'View as Grid'}
          </button>
          {/* Visual FX toggle (optional UI). Master off by default. */}
          <FxToggle value={fx} onChange={setFx} />
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
              className={`lab-root ${fxActive && fx.scanlines ? 'lab-scanlines' : ''}`}
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
                  // Position the tile around the cylinder:
                  const rotate = `rotateY(${angleDeg * i}deg) translateZ(${radius}px)`;
                  // Inner card faces the camera by undoing (tileAngle + containerRotation):
                  const faceBack = `rotateY(${-(angleDeg * i + rotationDeg)}deg)`;
                  return (
                    <div
                      key={p.href}
                      className="lab-tile"
                      data-testid="lab-tile"
                      style={{
                        transform: rotate,
                        // CSS-vars path alternative (Phase 3+):
                        // ['--tile-index' as string]: String(i),
                        // ['--tile-angle' as string]: `${angleDeg}deg`,
                        // ['--radius' as string]: `${radius}px`,
                        ...(fxActive && fx.depthFade
                          ? { ['--depthFactor' as string]: String(depthForIndex(i)) }
                          : {}),
                      }}
                      data-depth={
                        fxActive && fx.depthFade ? depthForIndex(i).toFixed(2) : undefined
                      }
                    >
                      <div className="lab-card" style={{ transform: faceBack }}>
                        <LabTile
                          project={p}
                          onTileClick={(e) => handleTileClick(i, e)}
                          fxEnabled={fxActive}
                        />
                      </div>
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
                <LabTile
                  project={p}
                  onTileClick={(e) => handleTileClick(i, e)}
                  fxEnabled={fxActive}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <Lightbox
        open={activeIndex !== null}
        onClose={closeLightbox}
        project={activeIndex !== null ? (projects[activeIndex] ?? null) : null}
      />

      {/* ARIA live region for announcements */}
      <div id="aria-live-region" className="sr-only" aria-live="polite" aria-atomic="true" />
    </>
  );
}
