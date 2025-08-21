# Contributing to Ashfall Lab 3D Carousel

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm 8+
- Git configured with your GitHub account
- VS Code or similar editor with TypeScript support
- Basic understanding of React and TypeScript

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cylindergrid.git
   cd cylindergrid
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

5. Start development:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Naming

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `perf/` - Performance improvements
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(carousel): add touch gesture support`
- `fix(lightbox): correct focus trap behavior`
- `docs(readme): update browser support section`
- `perf(animation): optimize transform calculations`

### Code Style

#### TypeScript

```typescript
// Use explicit types
interface TileProps {
  id: string;
  title: string;
  image: string;
  onClick?: (id: string) => void;
}

// Prefer const and arrow functions
const calculateRadius = (tileCount: number, tileWidth: number): number => {
  return tileWidth / (2 * Math.tan(Math.PI / tileCount));
};

// Use optional chaining and nullish coalescing
const value = props.data?.value ?? defaultValue;
```

#### React

```tsx
// Use functional components with TypeScript
const LabTile: React.FC<TileProps> = ({ id, title, image, onClick }) => {
  // Use hooks at the top
  const [isLoaded, setIsLoaded] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);
  
  // Memoize expensive computations
  const processedImage = useMemo(() => 
    processImage(image), [image]
  );
  
  // Use semantic HTML
  return (
    <article 
      ref={tileRef}
      className="lab-tile"
      onClick={() => onClick?.(id)}
    >
      <img 
        src={processedImage} 
        alt={title}
        onLoad={() => setIsLoaded(true)}
      />
      <h3>{title}</h3>
    </article>
  );
};
```

#### CSS

```css
/* Use CSS variables for theming */
:root {
  --carousel-radius: 400px;
  --tile-width: 300px;
  --animation-duration: 300ms;
}

/* Mobile-first approach */
.lab-carousel {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .lab-carousel {
    transform-style: preserve-3d;
  }
}

/* Prefer transforms for animations */
.lab-tile {
  transition: transform var(--animation-duration) ease-out;
  will-change: transform;
}
```

### Testing Requirements

#### Unit Tests

```typescript
describe('LabCarousel', () => {
  it('should render correct number of tiles', () => {
    const tiles = createMockTiles(8);
    const { getAllByRole } = render(
      <LabCarousel tiles={tiles} />
    );
    expect(getAllByRole('listitem')).toHaveLength(8);
  });
});
```

#### Accessibility Tests

```typescript
it('should be keyboard navigable', () => {
  const { getByRole } = render(<LabCarousel />);
  const carousel = getByRole('region');
  
  userEvent.tab();
  expect(carousel).toHaveFocus();
  
  userEvent.keyboard('{ArrowRight}');
  expect(getCurrentIndex()).toBe(1);
});
```

#### Performance Tests

```typescript
it('should maintain 60 FPS', async () => {
  const fps = await measureAnimationFPS();
  expect(fps).toBeGreaterThanOrEqual(59);
});
```

## Pull Request Process

### Before Submitting

1. **Run all checks:**
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```

2. **Test manually:**
   - Keyboard navigation works
   - Screen reader announces correctly
   - Animations are smooth (60 FPS)
   - No console errors or warnings
   - Works with `prefers-reduced-motion`

3. **Update documentation:**
   - Add JSDoc comments for new functions
   - Update README if adding features
   - Include usage examples

### PR Checklist

Your PR must:

- [ ] Pass all CI checks
- [ ] Include tests for new features
- [ ] Update documentation as needed
- [ ] Follow code style guidelines
- [ ] Be CSP-compliant (no inline styles/scripts)
- [ ] Maintain accessibility standards
- [ ] Keep CLS < 0.1
- [ ] Work across supported browsers
- [ ] Include before/after screenshots for UI changes

### PR Template

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome/Edge
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile
- [ ] Tested with keyboard
- [ ] Tested with screen reader

## Screenshots
[If applicable]

## Performance Impact
- Bundle size change: +0KB
- FPS during animation: 60
- CLS score: 0.05
```

## Performance Guidelines

### Bundle Size

- Keep individual components < 10KB gzipped
- Use dynamic imports for optional features
- Tree-shake unused code
- Monitor with `pnpm analyze`

### Runtime Performance

- Maintain 60 FPS during animations
- Use `transform` and `opacity` only for animations
- Debounce/throttle event handlers
- Use `will-change` sparingly
- Profile with Chrome DevTools

### Web Vitals

- **CLS**: Must be < 0.1
- **LCP**: Target < 2.5s
- **FID**: Target < 100ms
- **TTI**: Target < 3.8s

## Accessibility Standards

### Required

- Keyboard navigable (Tab, Arrow keys, Enter, Escape)
- Screen reader compatible (tested with NVDA/JAWS/VoiceOver)
- Focus indicators visible and clear
- Color contrast WCAG AA minimum
- Respects `prefers-reduced-motion`
- Semantic HTML structure
- ARIA labels where needed

### Testing Tools

- axe DevTools extension
- WAVE browser extension
- Lighthouse accessibility audit
- Manual keyboard testing
- Screen reader testing

## Security Guidelines

### Content Security Policy

- No inline styles (use classes or CSS variables)
- No inline scripts
- No `eval()` or `Function()` constructor
- Sanitize all user input
- Validate URLs before use

### Dependencies

- Keep dependencies up to date
- Run `pnpm audit` regularly
- Review dependency licenses
- Minimize dependency count

## Documentation

### Code Comments

```typescript
/**
 * Calculates the radius for cylindrical tile arrangement
 * @param tileCount - Number of tiles in the carousel
 * @param tileWidth - Width of each tile in pixels
 * @returns Radius in pixels for optimal spacing
 */
const calculateRadius = (tileCount: number, tileWidth: number): number => {
  // Prevent division by zero
  if (tileCount === 0) return 0;
  
  // Use trigonometry to calculate optimal radius
  return tileWidth / (2 * Math.tan(Math.PI / tileCount));
};
```

### README Updates

Document any:
- New features
- Configuration options
- Breaking changes
- Migration guides

## Questions & Support

- **Discord**: [Join our Discord](https://discord.gg/ashfall-lab)
- **Issues**: [GitHub Issues](https://github.com/MadisonSNYC/cylindergrid/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MadisonSNYC/cylindergrid/discussions)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in documentation

Thank you for contributing to making the web more accessible and performant!