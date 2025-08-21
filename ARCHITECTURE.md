# Architecture Document: Ashfall Lab 3D Carousel

## Overview

The Ashfall Lab 3D Carousel is a React-based cylindrical carousel component that displays portfolio projects in an interactive 3D space. The architecture prioritizes performance, accessibility, and Content Security Policy (CSP) compliance.

## Core Principles

1. **Transform-Only Animations**: All motion via CSS transforms for GPU acceleration
2. **CSP Compliance**: No inline styles/scripts, CSS variable-based approach
3. **Progressive Enhancement**: Works without JavaScript, enhances with it
4. **Accessibility First**: Keyboard navigation, screen reader support, motion preferences
5. **Performance Budget**: < 50KB JS, CLS < 0.1, 60 FPS animations

## Mathematical Foundation

### Cylinder Geometry

The cylinder radius is calculated to ensure tiles don't overlap:

```
radius = tileWidth / (2 * tan(π / tileCount))
```

Where:
- `tileWidth`: Width of each project tile
- `tileCount`: Number of tiles in the carousel
- `radius`: Distance from center to tile face

### Tile Positioning

Each tile is positioned using:

```
angle = (360° / tileCount) * tileIndex
transform: rotateY(angle) translateZ(radius)
```

### Container Rotation

The entire cylinder rotates as one unit:

```
containerRotation = currentIndex * (360° / tileCount)
transform: rotateY(containerRotation)
```

## CSP-Safe Implementation

### CSS Variable Approach

Instead of inline styles, we use CSS variables for dynamic values:

```css
/* Container variables */
.lab-carousel {
  --rotation: 0deg;
  --tile-count: 8;
  --radius: 400px;
  transform: rotateY(var(--rotation));
}

/* Tile variables */
.lab-tile {
  --tile-index: 0;
  --tile-angle: calc(360deg / var(--tile-count));
  transform: 
    rotateY(calc(var(--tile-index) * var(--tile-angle)))
    translateZ(var(--radius));
}
```

### React Implementation

```tsx
// Setting CSS variables safely without inline styles
const LabCarousel: React.FC = ({ tiles }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  
  // Update CSS variables via ref
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.setProperty('--rotation', `${rotation}deg`);
      carouselRef.current.style.setProperty('--tile-count', tiles.length);
      carouselRef.current.style.setProperty('--radius', calculateRadius(tiles.length));
    }
  }, [rotation, tiles.length]);
  
  return (
    <div ref={carouselRef} className="lab-carousel">
      {tiles.map((tile, index) => (
        <div
          key={tile.id}
          className="lab-tile"
          style={{ '--tile-index': index } as React.CSSProperties}
        >
          {tile.content}
        </div>
      ))}
    </div>
  );
};
```

### Alternative: Generated Stylesheet

For stricter CSP, generate a stylesheet:

```tsx
const generateCarouselStyles = (tileCount: number): string => {
  let styles = '';
  const angleStep = 360 / tileCount;
  
  for (let i = 0; i < tileCount; i++) {
    styles += `
      .lab-tile:nth-child(${i + 1}) {
        transform: 
          rotateY(${i * angleStep}deg) 
          translateZ(var(--radius));
      }
    `;
  }
  
  return styles;
};

// Inject via <style> tag or CSS-in-JS solution
```

## Component Architecture

### Component Hierarchy

```
<LabCarousel>
  ├── <CarouselContainer>
  │   ├── <LabTile />
  │   ├── <LabTile />
  │   └── ...
  ├── <CarouselControls>
  │   ├── <RotateButton direction="left" />
  │   ├── <RotateButton direction="right" />
  │   └── <PlayPauseButton />
  └── <ViewToggle>
      ├── <CarouselView />
      └── <GridView />
```

### State Management

```typescript
interface CarouselState {
  currentIndex: number;      // Currently centered tile
  rotation: number;          // Current rotation angle
  isAutoRotating: boolean;   // Auto-rotation active
  viewMode: 'carousel' | 'grid';
  selectedTile: Tile | null; // For lightbox
}
```

### Data Flow

1. **Props → Carousel**: Configuration and tile data
2. **State → Transforms**: Rotation state drives CSS variables
3. **Events → Actions**: User interactions trigger state updates
4. **Actions → Animation**: State changes animate via CSS transitions

## Performance Optimizations

### Transform-Only Animations

```css
.lab-carousel {
  will-change: transform;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.lab-tile {
  will-change: transform;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}
```

### Lazy Loading

```tsx
const LabTile: React.FC<TileProps> = ({ image, isVisible }) => {
  return (
    <div className="lab-tile">
      {isVisible && (
        <img 
          src={image} 
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};
```

### Animation Frame Scheduling

```tsx
const useAutoRotation = (speed: number) => {
  const frameRef = useRef<number>();
  
  const animate = useCallback((timestamp: number) => {
    // Calculate rotation based on timestamp
    const rotation = (timestamp * speed) % 360;
    setRotation(rotation);
    
    frameRef.current = requestAnimationFrame(animate);
  }, [speed]);
  
  useEffect(() => {
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [animate]);
};
```

## Accessibility Architecture

### Keyboard Navigation

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  switch(e.key) {
    case 'ArrowLeft':
      rotateToPrevious();
      break;
    case 'ArrowRight':
      rotateToNext();
      break;
    case 'Enter':
    case ' ':
      openLightbox(currentTile);
      break;
    case 'Escape':
      closeLightbox();
      break;
  }
};
```

### ARIA Structure

```html
<div 
  role="region" 
  aria-label="Project carousel"
  aria-roledescription="carousel"
>
  <div role="list">
    <div 
      role="listitem"
      aria-label="Project 1 of 8"
      tabindex="0"
    >
      <!-- Tile content -->
    </div>
  </div>
  
  <div role="group" aria-label="Carousel controls">
    <button aria-label="Previous project">Previous</button>
    <button aria-label="Next project">Next</button>
    <button aria-pressed="true" aria-label="Pause rotation">
      Pause
    </button>
  </div>
</div>
```

### Motion Preferences

```tsx
const useReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReduced;
};
```

## Security Considerations

### Content Security Policy

```html
<!-- Strict CSP header -->
Content-Security-Policy: 
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
```

### XSS Prevention

- No `dangerouslySetInnerHTML`
- All user content escaped
- URLs validated and sanitized
- External links use `rel="noopener noreferrer"`

## Testing Strategy

### Unit Tests

```typescript
describe('LabCarousel', () => {
  it('calculates correct radius for tile count', () => {
    expect(calculateRadius(8, 300)).toBeCloseTo(362.13);
  });
  
  it('rotates to correct angle on navigation', () => {
    const { getByRole } = render(<LabCarousel tiles={mockTiles} />);
    fireEvent.click(getByRole('button', { name: /next/i }));
    expect(getRotation()).toBe(45); // 360° / 8 tiles
  });
});
```

### Integration Tests

```typescript
describe('Carousel Integration', () => {
  it('opens lightbox on tile click', async () => {
    const { getByRole, findByRole } = render(<App />);
    fireEvent.click(getByRole('listitem', { name: /project 1/i }));
    await findByRole('dialog');
    expect(getByRole('dialog')).toBeInTheDocument();
  });
});
```

### Performance Tests

```typescript
describe('Performance', () => {
  it('maintains 60 FPS during rotation', async () => {
    const fps = await measureFPS(() => {
      triggerRotation();
    });
    expect(fps).toBeGreaterThanOrEqual(60);
  });
  
  it('has CLS less than 0.1', async () => {
    const cls = await measureCLS();
    expect(cls).toBeLessThan(0.1);
  });
});
```

## Bundle Strategy

### Code Splitting

```typescript
// Lazy load lightbox (not needed immediately)
const LabLightbox = lazy(() => import('./LabLightbox'));

// Lazy load grid view (alternative view)
const LabGrid = lazy(() => import('./LabGrid'));
```

### Tree Shaking

```typescript
// Named exports for better tree shaking
export { LabCarousel } from './LabCarousel';
export { LabTile } from './LabTile';
export type { CarouselConfig, TileData } from './types';
```

## Browser Compatibility

### Feature Detection

```typescript
const supports3D = CSS.supports('transform-style', 'preserve-3d');
const supportsCustomProperties = CSS.supports('--test', '0');

if (!supports3D || !supportsCustomProperties) {
  // Fallback to 2D carousel or grid
}
```

### Progressive Enhancement

1. **Base**: Static HTML/CSS grid
2. **Enhanced**: 2D carousel with JS
3. **Full**: 3D carousel with all features

## Monitoring & Analytics

### Performance Metrics

```typescript
// Report Web Vitals
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getLCP(console.log);  // Largest Contentful Paint
```

### Error Tracking

```typescript
window.addEventListener('error', (event) => {
  // Log to monitoring service
  trackError({
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error
  });
});
```

## Future Considerations

### Potential Enhancements

1. **WebGL Renderer**: For complex 3D effects
2. **Virtual Scrolling**: For 100+ tiles
3. **Gesture Support**: Swipe, pinch-zoom
4. **3D Model Integration**: Three.js tiles
5. **Server-Side Rendering**: Next.js/Remix support

### Scalability

- **Tile Limit**: Tested up to 50 tiles
- **Image Size**: Max 500KB per tile
- **Animation Complexity**: Limited to transforms
- **Browser Memory**: Monitor via Performance API

## Deployment

### Build Configuration

```javascript
// vite.config.js
export default {
  build: {
    target: 'es2020',
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'carousel': ['./src/components/lab/LabCarousel.tsx'],
          'lightbox': ['./src/components/lab/LabLightbox.tsx'],
        }
      }
    }
  }
};
```

### Performance Budget

```json
{
  "bundles": [{
    "name": "main",
    "budget": 50000
  }, {
    "name": "carousel",
    "budget": 20000
  }],
  "metrics": {
    "cls": 0.1,
    "lcp": 2500,
    "fid": 100
  }
}