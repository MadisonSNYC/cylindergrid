import { useEffect, useMemo, useState } from "react";
import projects from "../../data/labProjects";
import "../../styles/lab.css";
import LabTile from "./LabTile";
import useReducedMotionPref from "../../hooks/useReducedMotionPref";

/** Optional: compute radius from tile width and count for tight circle.
 * radius H (tileWidth / 2) / tan(� / count)
 */
function computeRadiusPx(count: number, tileWidthPx: number): number {
  if (count < 3) return 600;
  const r = (tileWidthPx / 2) / Math.tan(Math.PI / count);
  return Math.max(400, Math.min(1200, r)); // clamp for sanity
}

export default function LabCarousel() {
  const prefersReduced = useReducedMotionPref();
  const [isGridView, setIsGridView] = useState<boolean>(() => {
    try { return localStorage.getItem("labViewMode") === "grid"; } catch { return false; }
  });

  useEffect(() => {
    if (prefersReduced) setIsGridView(true);
  }, [prefersReduced]);

  useEffect(() => {
    try { localStorage.setItem("labViewMode", isGridView ? "grid" : "carousel"); } catch {}
  }, [isGridView]);

  const count = projects.length;
  const angleDeg = 360 / Math.max(count, 1);
  // Base on our CSS .lab-tile default width: 16rem -> 256px (approx, depends on root font-size)
  const approxTileWidthPx = 256;
  const radius = useMemo(() => computeRadiusPx(count, approxTileWidthPx), [count]);

  return (
    <section className="lab-section">
      <div className="mb-6">
        <button
          type="button"
          className="px-4 py-2 border border-white/80 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
          aria-pressed={isGridView}
          aria-label={isGridView ? "Switch to immersive 3D carousel view" : "Switch to accessible grid view"}
          onClick={() => setIsGridView(v => !v)}
        >
          {isGridView ? "View as Carousel" : "View as Grid"}
        </button>
      </div>

      {!isGridView ? (
        <div
          className="lab-root"
          /* If you want container-level rotation control later, expose a --rotation variable */
          style={{} /* { ['--rotation' as any]: '0deg' } */}
        >
          <div className="lab-carousel">
            {projects.map((p, i) => {
              // Inline transform (simple path). If CSP disallows style attributes,
              // switch to CSS variable approach (see commented style below).
              const rotate = `rotateY(${angleDeg * i}deg) translateZ(${radius}px)`;
              return (
                <div
                  key={p.href}
                  className="lab-tile"
                  style={{
                    transform: rotate
                    // CSP-safe variable path (requires enabling the CSS shown in lab.css header comment):
                    // ['--tile-index' as any]: String(i),
                    // ['--tile-angle' as any]: `${angleDeg}deg`,
                    // ['--radius' as any]: `${radius}px`,
                  }}
                >
                  <LabTile project={p} />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="lab-grid">
          {projects.map((p) => (
            <div key={p.href} className="lab-grid-item">
              <LabTile project={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}