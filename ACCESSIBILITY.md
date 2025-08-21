# Accessibility Guidelines: Ashfall Lab 3D Carousel

## Core Principles

1. **Perceivable**: Information must be presentable in ways users can perceive
2. **Operable**: Interface must be operable via keyboard, mouse, touch, and assistive tech
3. **Understandable**: Information and UI operation must be understandable
4. **Robust**: Content must work with a wide variety of user agents and assistive technologies

## WCAG 2.1 Compliance

We target **WCAG 2.1 Level AA** compliance with some AAA enhancements.

## Keyboard Navigation

### Required Key Bindings

| Key | Action | Component |
|-----|--------|-----------|
| `Tab` | Move focus forward | All |
| `Shift+Tab` | Move focus backward | All |
| `Enter` / `Space` | Activate button/tile | Buttons, Tiles |
| `ArrowLeft` | Previous tile | Carousel |
| `ArrowRight` | Next tile | Carousel |
| `ArrowUp` / `ArrowDown` | Navigate within lightbox | Lightbox |
| `Escape` | Close modal/cancel | Lightbox, Menus |
| `Home` | First tile | Carousel |
| `End` | Last tile | Carousel |

### Implementation

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  const { key, shiftKey } = e;
  
  switch(key) {
    case 'ArrowLeft':
      e.preventDefault();
      rotateToPrevious();
      announcePosition();
      break;
      
    case 'ArrowRight':
      e.preventDefault();
      rotateToNext();
      announcePosition();
      break;
      
    case 'Home':
      e.preventDefault();
      rotateToFirst();
      announce('First project');
      break;
      
    case 'End':
      e.preventDefault();
      rotateToLast();
      announce('Last project');
      break;
      
    case 'Enter':
    case ' ':
      e.preventDefault();
      openLightbox(currentTile);
      break;
      
    case 'Escape':
      if (isLightboxOpen) {
        closeLightbox();
        returnFocusToTrigger();
      }
      break;
  }
};
```

## Focus Management

### Focus Indicators

```css
/* Visible focus for all interactive elements */
:focus-visible {
  outline: 3px solid var(--focus-color, #0066CC);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Remove focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :focus-visible {
    outline-width: 4px;
    outline-color: CanvasText;
  }
}
```

### Focus Order

1. Skip link (hidden until focused)
2. Carousel container
3. Navigation buttons (left, right)
4. Play/pause button
5. View toggle
6. Individual tiles (when in grid view)

### Focus Trap

```typescript
const useFocusTrap = (containerRef: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!containerRef.current) return;
    
    const focusableElements = containerRef.current.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', trapFocus);
    firstElement?.focus();
    
    return () => document.removeEventListener('keydown', trapFocus);
  }, [containerRef]);
};
```

## Hover-Focus Parity

### Principle

Any interaction available on hover must also be available on focus.

### Implementation

```css
/* Ensure hover and focus have same styles */
.lab-tile:hover,
.lab-tile:focus-within {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.lab-tile:hover .tile-overlay,
.lab-tile:focus-within .tile-overlay {
  opacity: 1;
}

/* Button states */
.control-button:hover,
.control-button:focus-visible {
  background: var(--button-hover-bg);
  color: var(--button-hover-color);
}
```

```typescript
// JavaScript enhancement for focus
const LabTile: React.FC = ({ tile }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Show overlay on both hover and focus
  const showOverlay = isFocused || isHovered;
  
  return (
    <div
      className="lab-tile"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      role="button"
      aria-label={`View ${tile.title} project`}
    >
      <img src={tile.image} alt="" /> {/* Decorative, alt="" */}
      <div className={`tile-overlay ${showOverlay ? 'visible' : ''}`}>
        <h3>{tile.title}</h3>
        <p>{tile.description}</p>
      </div>
    </div>
  );
};
```

## ARIA Implementation

### Carousel Structure

```html
<div 
  role="region" 
  aria-label="Project carousel"
  aria-roledescription="carousel"
  aria-live="polite"
>
  <div 
    role="list"
    aria-label="Projects"
  >
    <div 
      role="listitem"
      aria-label="Project 1 of 8: Website Redesign"
      aria-setsize="8"
      aria-posinset="1"
      tabindex="0"
    >
      <!-- Tile content -->
    </div>
  </div>
  
  <div role="group" aria-label="Carousel controls">
    <button 
      aria-label="Previous project"
      aria-controls="carousel-content"
    >
      Previous
    </button>
    
    <button 
      aria-label="Next project"
      aria-controls="carousel-content"
    >
      Next
    </button>
    
    <button 
      aria-label="Pause automatic rotation"
      aria-pressed="false"
    >
      Pause
    </button>
  </div>
</div>
```

### View Toggle with aria-pressed

```typescript
const ViewToggle: React.FC = ({ currentView, onChange }) => {
  const isCarousel = currentView === 'carousel';
  
  return (
    <div role="group" aria-label="View options">
      <button
        aria-label="Carousel view"
        aria-pressed={isCarousel}
        onClick={() => onChange('carousel')}
        className={isCarousel ? 'active' : ''}
      >
        <IconCarousel />
        <span className="sr-only">Carousel view</span>
      </button>
      
      <button
        aria-label="Grid view"
        aria-pressed={!isCarousel}
        onClick={() => onChange('grid')}
        className={!isCarousel ? 'active' : ''}
      >
        <IconGrid />
        <span className="sr-only">Grid view</span>
      </button>
    </div>
  );
};
```

### Lightbox Modal

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="lightbox-title"
  aria-describedby="lightbox-description"
>
  <button
    aria-label="Close dialog"
    onClick={close}
  >
    ×
  </button>
  
  <h2 id="lightbox-title">Project Title</h2>
  <div id="lightbox-description">
    <!-- Project details -->
  </div>
  
  <div role="group" aria-label="Image gallery navigation">
    <button aria-label="Previous image">Previous</button>
    <span aria-live="polite" aria-atomic="true">
      Image 1 of 5
    </span>
    <button aria-label="Next image">Next</button>
  </div>
</div>
```

## Screen Reader Announcements

### Live Regions

```typescript
const useAnnounce = () => {
  const [announcement, setAnnouncement] = useState('');
  
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(''); // Clear first to ensure re-announcement
    setTimeout(() => setAnnouncement(message), 100);
  };
  
  return {
    announce,
    announcer: (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    )
  };
};
```

### Usage

```typescript
const LabCarousel: React.FC = () => {
  const { announce, announcer } = useAnnounce();
  
  const rotateToNext = () => {
    const newIndex = (currentIndex + 1) % tiles.length;
    setCurrentIndex(newIndex);
    announce(`Project ${newIndex + 1} of ${tiles.length}: ${tiles[newIndex].title}`);
  };
  
  return (
    <>
      {announcer}
      {/* Carousel content */}
    </>
  );
};
```

## Motion and Animation

### Respecting User Preferences

```css
/* Default: animations enabled */
.lab-carousel {
  transition: transform 300ms ease-out;
}

.lab-tile {
  animation: slideIn 500ms ease-out;
}

/* Reduced motion: instant transitions */
@media (prefers-reduced-motion: reduce) {
  .lab-carousel,
  .lab-tile {
    animation: none !important;
    transition: none !important;
  }
  
  /* Maintain visual feedback without motion */
  .lab-tile:hover {
    opacity: 0.9;
  }
}
```

```typescript
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
};

// Usage
const LabCarousel: React.FC = () => {
  const reducedMotion = useReducedMotion();
  
  return (
    <div 
      className={`lab-carousel ${reducedMotion ? 'reduced-motion' : ''}`}
      style={{
        transition: reducedMotion ? 'none' : 'transform 300ms ease-out'
      }}
    >
      {/* Content */}
    </div>
  );
};
```

## Color and Contrast

### Requirements

- Normal text: 4.5:1 contrast ratio (AA)
- Large text (18pt+): 3:1 contrast ratio (AA)
- UI components: 3:1 contrast ratio
- Focus indicators: 3:1 against adjacent colors

### CSS Variables for Theming

```css
:root {
  /* Light theme (default) */
  --text-primary: #1a1a1a;      /* 15.3:1 on white */
  --text-secondary: #666666;     /* 5.7:1 on white */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --accent: #0066cc;             /* 4.5:1 on white */
  --focus-color: #0066cc;
  --error: #cc0000;              /* 5.9:1 on white */
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #f0f0f0;     /* 14.1:1 on black */
    --text-secondary: #b0b0b0;    /* 7.5:1 on black */
    --bg-primary: #1a1a1a;
    --bg-secondary: #2a2a2a;
    --accent: #66b3ff;            /* 8.2:1 on black */
    --focus-color: #66b3ff;
    --error: #ff6666;             /* 7.1:1 on black */
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --text-primary: CanvasText;
    --bg-primary: Canvas;
    --focus-color: Highlight;
  }
}
```

## Touch Accessibility

### Touch Targets

```css
/* Minimum 44x44px touch targets (WCAG 2.1 AA) */
.control-button,
.lab-tile {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* Spacing between targets */
.control-button + .control-button {
  margin-left: 8px;
}

/* Larger targets on mobile */
@media (pointer: coarse) {
  .control-button,
  .lab-tile {
    min-width: 48px;
    min-height: 48px;
  }
}
```

## Text Alternatives

### Images

```typescript
const LabTile: React.FC<TileProps> = ({ tile }) => {
  return (
    <div className="lab-tile">
      {/* Decorative image with empty alt */}
      <img 
        src={tile.thumbnail} 
        alt=""
        role="presentation"
      />
      
      {/* Informative image with descriptive alt */}
      <img 
        src={tile.screenshot}
        alt={`Screenshot of ${tile.title} showing ${tile.description}`}
      />
      
      {/* Complex image with long description */}
      <figure>
        <img 
          src={tile.infographic}
          alt="Project timeline"
          aria-describedby="timeline-description"
        />
        <figcaption id="timeline-description" className="sr-only">
          The timeline shows three phases: Design (2 weeks), 
          Development (4 weeks), and Testing (1 week).
        </figcaption>
      </figure>
    </div>
  );
};
```

### Icons

```typescript
const Icon: React.FC<IconProps> = ({ name, label }) => {
  if (label) {
    // Icon with visible label: decorative
    return <span className={`icon icon-${name}`} aria-hidden="true" />;
  } else {
    // Icon without visible label: needs alternative
    return (
      <span 
        className={`icon icon-${name}`}
        role="img"
        aria-label={name.replace('-', ' ')}
      />
    );
  }
};
```

## Testing Tools

### Automated Testing

```bash
# axe DevTools CLI
npm install -g @axe-core/cli
axe http://localhost:5173

# Pa11y
npm install -g pa11y
pa11y http://localhost:5173 --standard WCAG2AA

# Lighthouse
npx lighthouse http://localhost:5173 --only-categories=accessibility
```

### Manual Testing Checklist

#### Keyboard Testing
- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators visible
- [ ] No keyboard traps
- [ ] Logical tab order
- [ ] Skip links work
- [ ] Modal focus management correct

#### Screen Reader Testing (NVDA/JAWS/VoiceOver)
- [ ] Page structure announced correctly
- [ ] All controls properly labeled
- [ ] State changes announced
- [ ] Form validation messages read
- [ ] Images have appropriate alt text
- [ ] Live regions work

#### Visual Testing
- [ ] Text readable at 200% zoom
- [ ] No horizontal scrolling at 320px width
- [ ] Colors distinguishable without color
- [ ] Focus indicators have 3:1 contrast
- [ ] Error states not color-only

#### Motion Testing
- [ ] Animations respect prefers-reduced-motion
- [ ] Auto-playing content can be paused
- [ ] No seizure-inducing flashing

## Common Pitfalls and Solutions

### Pitfall 1: Focus Lost on Route Change

```typescript
// Solution: Manage focus on route change
const useFocusOnRouteChange = () => {
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    headingRef.current?.focus();
  }, [location]);
  
  return headingRef;
};
```

### Pitfall 2: Decorative Images Announced

```typescript
// Wrong
<img src="decoration.png" alt="decoration" />

// Right
<img src="decoration.png" alt="" role="presentation" />
```

### Pitfall 3: Inaccessible Custom Controls

```typescript
// Wrong
<div onClick={handleClick}>Click me</div>

// Right
<button onClick={handleClick}>Click me</button>
// Or
<div 
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

### Pitfall 4: Missing Loading States

```typescript
// Solution: Announce loading states
const [isLoading, setIsLoading] = useState(false);

return (
  <>
    <button 
      onClick={load}
      aria-busy={isLoading}
      aria-label={isLoading ? 'Loading projects' : 'Load projects'}
    >
      {isLoading ? 'Loading...' : 'Load'}
    </button>
    
    <div 
      role="status" 
      aria-live="polite"
      className="sr-only"
    >
      {isLoading ? 'Loading projects' : ''}
    </div>
  </>
);
```

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools
- [axe DevTools](https://www.deque.com/axe/)
- [WAVE](https://wave.webaim.org/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Testing Services
- [Accessibility Insights](https://accessibilityinsights.io/)
- [Pa11y](https://pa11y.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)