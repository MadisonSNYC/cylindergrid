# Ashfall Lab 3D Carousel

A performant, accessible 3D cylindrical carousel component for showcasing portfolio projects with lightbox integration and multiple view modes.

## Features

- **3D Cylindrical Layout**: Projects arranged in an interactive 3D cylinder
- **Lightbox Integration**: Full project details in an accessible modal
- **View Toggle**: Switch between carousel and grid layouts
- **Auto-rotation**: Configurable automatic rotation with pause on interaction
- **Accessibility First**: Full keyboard navigation, screen reader support, focus management
- **Performance Optimized**: GPU-accelerated transforms, lazy loading, CLS < 0.1
- **CSP Compliant**: No inline styles or scripts, CSS variable-based transforms

## Quick Start

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Production build
pnpm build

# Preview production build
pnpm preview
```

## Architecture

The carousel uses pure CSS transforms for GPU-accelerated performance:

- **Radius Calculation**: `radius = width / (2 * tan(π / tileCount))`
- **Tile Rotation**: `rotateY(index * 360° / tileCount)`
- **Container Rotation**: Single transform on parent for smooth rotation
- **CSP-Safe**: All transforms via CSS variables, no inline styles

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS Safari 14+, Chrome Android 90+

## Performance Targets

- **CLS**: < 0.1 (no layout shift)
- **LCP**: < 2.5s
- **FID**: < 100ms
- **FPS**: 60fps during animations
- **Bundle Size**: < 50KB gzipped

## Accessibility

- **Keyboard**: Full keyboard navigation with visible focus
- **Screen Readers**: Semantic HTML, ARIA labels, live regions
- **Motion**: Respects `prefers-reduced-motion`
- **Focus Management**: Focus trap in lightbox, logical tab order
- **Color Contrast**: WCAG AAA compliant

## Environment

- `VITE_SHOW_FX_TOGGLE` (optional): set to `true` to show Visual FX toggle UI in prod.
  By default, FX are OFF and the toggle is hidden in production.

## Project Structure

```
src/
├── components/
│   └── lab/
│       ├── LabCarousel.tsx    # Main carousel component
│       ├── LabTile.tsx        # Individual project tile
│       ├── LabGrid.tsx        # Grid view alternative
│       ├── LabLightbox.tsx    # Project detail modal
│       └── ViewToggle.tsx     # View mode switcher
├── hooks/
│   ├── useReducedMotionPref.ts
│   ├── useAutoRotation.ts
│   └── useFocusTrap.ts
├── data/
│   └── labProjects.ts         # Project data
└── styles/
    └── lab.css                # Component styles
```

## Configuration

```typescript
interface CarouselConfig {
  autoRotate?: boolean; // Enable auto-rotation (default: true)
  rotationSpeed?: number; // Seconds per rotation (default: 30)
  pauseOnHover?: boolean; // Pause on interaction (default: true)
  tileCount?: number; // Number of visible tiles
  perspective?: number; // 3D perspective value
  animationDuration?: number; // Transition duration in ms
}
```

## Development Workflow

1. **Phase 0**: Documentation & Planning ✓
2. **Phase 1**: Static Cylinder Implementation
3. **Phase 2**: Lightbox Modal Integration
4. **Phase 3**: View Toggle (Carousel ↔ Grid)
5. **Phase 4**: Auto-rotation & Pause Controls
6. **Phase 5**: Performance Optimization & Polish

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Accessibility audit
pnpm test:a11y

# Performance audit
npx lighthouse http://localhost:5173 --view
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT © 2024 Ashfall Lab

## Support

- **Issues**: [GitHub Issues](https://github.com/MadisonSNYC/cylindergrid/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MadisonSNYC/cylindergrid/discussions)

## Credits

Built with:

- React 18
- TypeScript
- Vite
- CSS Transforms
- Framer Motion (optional)

Inspired by Apple's product showcases and modern 3D web experiences.
