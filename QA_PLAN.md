# QA Plan: Ashfall Lab 3D Carousel

## Overview

This QA plan ensures the carousel meets performance, accessibility, and user experience standards. All tests must pass before merging to main.

## Performance Requirements

### Core Web Vitals

| Metric | Target | Maximum | Tool |
|--------|--------|---------|------|
| CLS (Cumulative Layout Shift) | < 0.05 | **< 0.1** | Lighthouse |
| LCP (Largest Contentful Paint) | < 2.0s | < 2.5s | Lighthouse |
| FID (First Input Delay) | < 50ms | < 100ms | Lighthouse |
| FPS (During Animation) | 60 | 55 | Chrome DevTools |
| TTI (Time to Interactive) | < 3.5s | < 3.8s | Lighthouse |

### Lighthouse Command

```bash
# Run Lighthouse audit
npx lighthouse http://localhost:5173 \
  --view \
  --only-categories=performance,accessibility,best-practices \
  --throttling.cpuSlowdownMultiplier=4 \
  --output=html \
  --output-path=./lighthouse-report.html

# Quick check for CLS specifically
npx lighthouse http://localhost:5173 \
  --only-audits=cumulative-layout-shift \
  --quiet \
  --chrome-flags="--headless"
```

### Web Vitals Monitoring

```typescript
// Add to your app for real-time monitoring
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

const vitalsCallback = (metric: any) => {
  console.log(metric.name, metric.value);
  // Assert CLS < 0.1
  if (metric.name === 'CLS' && metric.value > 0.1) {
    console.error('❌ CLS exceeds 0.1:', metric.value);
  }
};

getCLS(vitalsCallback);
getFID(vitalsCallback);
getLCP(vitalsCallback);
getFCP(vitalsCallback);
getTTFB(vitalsCallback);
```

## Test Scenarios

### 1. Initial Load Tests

#### Test 1.1: Cold Load Performance
```bash
# Clear cache and test
rm -rf node_modules/.cache
pnpm build && pnpm preview

# Measure
time curl -s http://localhost:4173 > /dev/null
```

**Expected:**
- Page interactive < 3s
- No layout shift (CLS = 0)
- All tiles visible within viewport

#### Test 1.2: Image Loading
**Steps:**
1. Open Network tab, throttle to "Fast 3G"
2. Load page
3. Monitor CLS in Performance tab

**Expected:**
- Images load progressively
- No layout shift as images load
- Placeholder maintains dimensions

### 2. Interaction Tests

#### Test 2.1: Keyboard Navigation
```javascript
// Automated test
describe('Keyboard Navigation', () => {
  it('navigates with arrow keys', () => {
    cy.visit('/');
    cy.get('.lab-carousel').focus();
    
    // Test right arrow
    cy.type('{rightarrow}');
    cy.get('[data-index="1"]').should('have.class', 'active');
    
    // Test left arrow
    cy.type('{leftarrow}');
    cy.get('[data-index="0"]').should('have.class', 'active');
    
    // Test enter to open lightbox
    cy.type('{enter}');
    cy.get('[role="dialog"]').should('be.visible');
    
    // Test escape to close
    cy.type('{esc}');
    cy.get('[role="dialog"]').should('not.exist');
  });
});
```

#### Test 2.2: Touch Gestures (Mobile)
**Manual Steps:**
1. Open on mobile device/emulator
2. Swipe left/right
3. Tap tile to open lightbox
4. Pinch to zoom in lightbox

**Expected:**
- Smooth swipe response
- No jank during gesture
- Natural momentum scrolling

### 3. Animation Performance

#### Test 3.1: Rotation FPS
```javascript
// Performance test
const measureFPS = async () => {
  const frames = [];
  let lastTime = performance.now();
  
  const measure = (time) => {
    frames.push(1000 / (time - lastTime));
    lastTime = time;
    if (frames.length < 100) {
      requestAnimationFrame(measure);
    } else {
      const avgFPS = frames.reduce((a, b) => a + b) / frames.length;
      console.assert(avgFPS >= 55, `FPS too low: ${avgFPS}`);
    }
  };
  
  // Trigger rotation
  document.querySelector('.rotate-button').click();
  requestAnimationFrame(measure);
};
```

#### Test 3.2: Auto-rotation Smoothness
**Steps:**
1. Enable auto-rotation
2. Open Performance tab
3. Record for 10 seconds
4. Check FPS graph

**Expected:**
- Consistent 60 FPS
- No frame drops
- GPU acceleration active

### 4. Accessibility Tests

#### Test 4.1: Screen Reader Navigation
```bash
# Using axe-core
npm install -D @axe-core/cli
npx axe http://localhost:5173
```

**Manual NVDA/JAWS Test:**
1. Navigate with Tab key
2. Listen to announcements
3. Use arrow keys in carousel
4. Verify button states announced

**Expected:**
- "Carousel, 8 items"
- "Project 1 of 8"
- "Pause rotation, pressed"

#### Test 4.2: Focus Management
```javascript
describe('Focus Management', () => {
  it('maintains logical tab order', () => {
    cy.visit('/');
    
    // Tab through elements
    const expectedOrder = [
      '.skip-link',
      '.lab-carousel',
      '.rotate-left',
      '.rotate-right',
      '.play-pause',
      '.view-toggle'
    ];
    
    expectedOrder.forEach(selector => {
      cy.tab();
      cy.focused().should('match', selector);
    });
  });
  
  it('traps focus in lightbox', () => {
    cy.get('.lab-tile').first().click();
    cy.focused().should('be.within', '[role="dialog"]');
    
    // Tab should cycle within dialog
    cy.tab().tab().tab();
    cy.focused().should('be.within', '[role="dialog"]');
  });
});
```

#### Test 4.3: Reduced Motion
```javascript
// Test with prefers-reduced-motion
describe('Reduced Motion', () => {
  it('respects user preference', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win, 'matchMedia')
          .withArgs('(prefers-reduced-motion: reduce)')
          .returns({ matches: true });
      }
    });
    
    // Verify no animations
    cy.get('.lab-carousel').should('have.css', 'animation', 'none');
    cy.get('.lab-tile').should('have.css', 'transition', 'none');
  });
});
```

### 5. View Toggle Tests

#### Test 5.1: Carousel ↔ Grid Transition
**Steps:**
1. Start in carousel view
2. Click toggle button
3. Verify grid layout
4. Toggle back

**Expected:**
- Smooth transition (< 300ms)
- No layout shift
- Focus maintained
- Preference saved to localStorage

#### Test 5.2: State Persistence
```javascript
it('persists view preference', () => {
  cy.visit('/');
  cy.get('.view-toggle').click();
  cy.reload();
  cy.get('.lab-grid').should('be.visible');
});
```

### 6. Browser Compatibility

#### Test Matrix

| Browser | Version | Desktop | Mobile |
|---------|---------|---------|--------|
| Chrome | 90+ | ✓ | ✓ |
| Firefox | 88+ | ✓ | ✓ |
| Safari | 14+ | ✓ | ✓ |
| Edge | 90+ | ✓ | ✓ |

#### Test 6.1: Cross-Browser Rendering
```bash
# Using Playwright for cross-browser testing
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### 7. Error Handling

#### Test 7.1: Image Load Failures
```javascript
it('handles image load errors gracefully', () => {
  cy.intercept('*.jpg', { statusCode: 404 });
  cy.visit('/');
  
  // Should show placeholder
  cy.get('.lab-tile img').should('have.attr', 'alt');
  cy.get('.image-error').should('not.exist');
});
```

#### Test 7.2: JavaScript Disabled
**Steps:**
1. Disable JavaScript in browser
2. Load page

**Expected:**
- Static grid layout displayed
- Basic functionality intact
- No broken UI

## Regression Tests

### Critical Path Tests (Run on Every PR)

```bash
#!/bin/bash
# regression-test.sh

echo "🧪 Running regression tests..."

# 1. Build succeeds
pnpm build || exit 1

# 2. No TypeScript errors
pnpm typecheck || exit 1

# 3. No lint errors
pnpm lint || exit 1

# 4. Tests pass
pnpm test || exit 1

# 5. CLS check
CLS=$(npx lighthouse http://localhost:5173 \
  --only-audits=cumulative-layout-shift \
  --output=json \
  --quiet \
  --chrome-flags="--headless" | \
  jq '.audits["cumulative-layout-shift"].numericValue')

if (( $(echo "$CLS > 0.1" | bc -l) )); then
  echo "❌ CLS exceeds 0.1: $CLS"
  exit 1
fi

echo "✅ All regression tests passed!"
```

## Manual Testing Checklist

### Before Each Release

- [ ] **Performance**
  - [ ] Lighthouse score > 90
  - [ ] CLS < 0.1 confirmed
  - [ ] 60 FPS during animations
  - [ ] No memory leaks (check DevTools Memory)

- [ ] **Accessibility**
  - [ ] Keyboard fully functional
  - [ ] Screen reader tested (NVDA/JAWS/VoiceOver)
  - [ ] Focus indicators visible
  - [ ] Color contrast passes WCAG AA

- [ ] **Functionality**
  - [ ] Carousel rotates smoothly
  - [ ] Lightbox opens/closes properly
  - [ ] View toggle works
  - [ ] Auto-rotation pauses on interaction

- [ ] **Cross-Device**
  - [ ] Desktop: Chrome, Firefox, Safari
  - [ ] Mobile: iOS Safari, Chrome Android
  - [ ] Tablet: iPad Safari, Android Chrome
  - [ ] Touch gestures work

- [ ] **Edge Cases**
  - [ ] Single tile
  - [ ] 50+ tiles
  - [ ] Slow network (3G)
  - [ ] JavaScript disabled

## Monitoring

### Production Metrics

```javascript
// Add to production build
if (process.env.NODE_ENV === 'production') {
  // Report to analytics
  getCLS((metric) => {
    analytics.track('web-vital', {
      name: 'CLS',
      value: metric.value,
      rating: metric.value < 0.1 ? 'good' : 'poor'
    });
  });
}
```

### Alerts

Set up alerts for:
- CLS > 0.1 (critical)
- LCP > 2.5s (warning)
- FPS < 55 (warning)
- Error rate > 1% (critical)

## Test Data

### Sample Projects

```typescript
export const testProjects = [
  {
    id: 'test-1',
    title: 'Test Project 1',
    image: '/test-assets/1.jpg', // 300x400px
    description: 'Lorem ipsum...',
    tags: ['web', 'design']
  },
  // ... 8 total for standard testing
  // ... 50 total for stress testing
];
```

### Test Images

- Small: 300x400px, < 50KB
- Medium: 600x800px, < 150KB
- Large: 1200x1600px, < 500KB
- Formats: JPEG, WebP, AVIF

## Reporting

### Bug Report Template

```markdown
**Environment:**
- Browser/Version:
- OS:
- Screen size:
- Network:

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:**

**Actual:**

**Screenshots/Video:**

**Console Errors:**

**Performance Metrics:**
- CLS:
- LCP:
- FPS:
```

## Automation

### CI/CD Integration

```yaml
# .github/workflows/qa.yml
name: QA Tests
on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test:performance
      - run: |
          # Check CLS
          CLS=$(npx lighthouse http://localhost:5173 \
            --only-audits=cumulative-layout-shift \
            --output=json \
            --chrome-flags="--headless" | \
            jq '.audits["cumulative-layout-shift"].numericValue')
          
          if (( $(echo "$CLS > 0.1" | bc -l) )); then
            echo "::error::CLS exceeds 0.1: $CLS"
            exit 1
          fi
```

## Sign-off Criteria

Before marking any task complete:

1. ✅ All automated tests pass
2. ✅ Manual testing checklist complete
3. ✅ CLS < 0.1 verified in production build
4. ✅ Cross-browser testing done
5. ✅ Accessibility audit passes
6. ✅ Performance budget met
7. ✅ No console errors/warnings
8. ✅ Documentation updated