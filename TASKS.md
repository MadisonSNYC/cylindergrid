# Ashfall Lab 3D Carousel — Task Breakdown

## Phase 0: Planning & Documentation

### Task 0.1: Setup Project Documentation

**Goal:** Establish comprehensive project documentation
**Steps:**

1. Create TASKS.md with detailed micro-tasks
2. Create README.md with project overview
3. Create ARCHITECTURE.md with technical design
4. Create CONTRIBUTING.md with guidelines
5. Create QA_PLAN.md with quality assurance strategy
6. Create ACCESSIBILITY.md with a11y requirements

**Commands:**

```bash
touch TASKS.md README.md ARCHITECTURE.md CONTRIBUTING.md QA_PLAN.md ACCESSIBILITY.md
```

**Expected Output:** Six documentation files created
**Acceptance Criteria:** All docs contain complete initial content
**Rollback:** `git reset --hard HEAD~1`

### Task 0.2: Setup GitHub Templates

**Goal:** Create PR and issue templates for consistent workflow
**Steps:**

1. Create .github directory
2. Add PULL_REQUEST_TEMPLATE.md
3. Add issue templates

**Commands:**

```bash
mkdir -p .github
touch .github/PULL_REQUEST_TEMPLATE.md
```

**Expected Output:** Templates in .github directory
**Acceptance Criteria:** Templates enforce CSP, a11y, and performance checks
**Rollback:** `rm -rf .github`

## Phase 1: Static Cylinder Implementation ✅

### Task 1.1: Project Scaffold

**Goal:** Create base file structure for the carousel
**Steps:**

1. Create component directories
2. Add LabCarousel.tsx component
3. Add LabTile.tsx component
4. Setup hooks directory
5. Create data structure for projects

**Commands:**

```bash
mkdir -p src/components/lab src/hooks src/data src/styles
touch src/components/lab/LabCarousel.tsx
touch src/components/lab/LabTile.tsx
touch src/hooks/useReducedMotionPref.ts
touch src/data/labProjects.ts
touch src/styles/lab.css
```

**Expected Output:** Complete directory structure with empty files
**Acceptance Criteria:** All paths match architecture spec
**Rollback:** `git clean -fd src/`

**Run These Checks:**

```bash
# Verify structure created
ls -la src/components/lab/
ls -la src/hooks/
ls -la src/data/
ls -la src/styles/

# Expected: All directories exist with specified files
```

### Task 1.2: Static Cylinder Math Implementation

**Goal:** Implement radius calculation and tile positioning
**Steps:**

1. Calculate radius from tile count
2. Apply rotateY transforms per tile
3. Position tiles around cylinder
4. Use CSS variables for CSP compliance

**Commands:**

```bash
pnpm dev
# Verify in browser: http://localhost:5173
```

**Expected Output:** Tiles arranged in cylinder formation
**Acceptance Criteria:**

- Radius = width / (2 \* tan(π / tileCount))
- Each tile rotated by index \* (360° / tileCount)
- Transform-only positioning (no left/top)
  **Rollback:** `git checkout -- src/components/lab/`

**Run These Checks:**

```bash
# Verify transforms are GPU-accelerated
npm run dev
# Open Chrome DevTools > Rendering > Show layer borders
# Expected: Tiles on separate composite layers

# Check for layout shifts
npx lighthouse http://localhost:5173 \
  --only-audits=cumulative-layout-shift \
  --quiet \
  --chrome-flags="--headless"
# Expected: CLS < 0.1
```

### Task 1.3: Basic Rotation Controls

**Goal:** Add left/right navigation buttons
**Steps:**

1. Create rotation state (0-360°)
2. Add left/right buttons
3. Implement 360°/tileCount rotation steps
4. Apply container transform

**Commands:**

```bash
pnpm lint
pnpm typecheck
```

**Expected Output:** Functional rotation controls
**Acceptance Criteria:**

- Smooth rotation via transform
- Keyboard support (ArrowLeft/ArrowRight)
- Visible focus states
  **Rollback:** `git checkout -- src/components/lab/LabCarousel.tsx`

## Phase 2: Interaction + Lightbox Modal ✅

### Task 2.0: Setup ESLint & Prettier

**Goal:** Add linting and formatting tools
**Steps:**

1. Install ESLint, TypeScript ESLint, Prettier
2. Configure .eslintrc.cjs and .prettierrc
3. Add lint/format scripts

**Commands:**

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier prettier
npm run lint
```

**Expected Output:** No linting errors
**Acceptance Criteria:** Code passes ESLint and TypeScript checks
**Rollback:** `git checkout -- .eslintrc.cjs .prettierrc package.json`

**Run These Checks:**

```bash
npm run typecheck
npm run lint
# Expected: Both pass without errors
```

### Task 2.1: Drag & Scroll Rotation

**Goal:** Add interactive rotation controls
**Steps:**

1. Create useDragRotate hook for pointer events
2. Add wheel event handling
3. Implement inertia with damping
4. Use CSS variables for CSP-safe transforms

**Commands:**

```bash
npm run dev
# Test drag and wheel rotation
```

**Expected Output:** Smooth rotation with inertia
**Acceptance Criteria:**

- Drag rotates cylinder smoothly
- Release continues with decaying velocity
- Wheel adjusts rotation without page scroll issues
- 60 FPS maintained
  **Rollback:** `git checkout -- src/hooks/useDragRotate.ts src/components/lab/LabCarousel.tsx`

**Run These Checks:**

```bash
# Open DevTools > Performance
# Record during drag - verify 60 FPS
# Check no long tasks > 50ms
```

### Task 2.2: Pause/Resume Logic

**Goal:** Smart auto-rotation management
**Steps:**

1. Pause on hover/focus/drag
2. Track last interaction time
3. Resume after 2s idle
4. Use RAF loop for consistent timing

**Expected Output:** Auto-spin pauses and resumes intelligently
**Acceptance Criteria:**

- Hover pauses immediately
- Resumes 2s after mouse leaves
- Drag overrides auto-spin
- Focus also pauses
  **Rollback:** `git checkout -- src/components/lab/LabCarousel.tsx`

### Task 2.3: Accessible Lightbox Modal

**Goal:** Create accessible lightbox modal
**Steps:**

1. Create LabLightbox.tsx component
2. Implement focus trap
3. Add close on Escape
4. Portal rendering to body

**Commands:**

```bash
touch src/components/lab/LabLightbox.tsx
pnpm dev
```

**Expected Output:** Accessible modal overlay
**Acceptance Criteria:**

- Focus trapped within modal
- Closes on Escape key
- Background scroll locked
- ARIA attributes present
  **Rollback:** `git checkout -- src/components/lab/LabLightbox.tsx`

### Task 2.2: Gallery Integration

**Goal:** Connect tiles to lightbox
**Steps:**

1. Add click handlers to tiles
2. Pass project data to lightbox
3. Implement image gallery in lightbox
4. Add navigation within lightbox

**Commands:**

```bash
pnpm build
pnpm preview
```

**Expected Output:** Tiles open lightbox with project details
**Acceptance Criteria:**

- Smooth open/close animations
- Keyboard navigation works
- Images lazy-loaded
- CLS < 0.1
  **Rollback:** `git checkout -- src/components/lab/`

## Phase 3: View Toggle (Carousel ↔ Grid) ✅

### Task 3.1: Skip Link Implementation ✅

**Goal:** Add accessible skip navigation link
**Steps:**

1. Create skip link in header
2. Position off-screen until focused
3. Link to carousel main content
4. Test with keyboard navigation

**Commands:**

```bash
pnpm dev
# Tab to test skip link
```

**Expected Output:** Skip link appears on Tab, jumps to main content
**Acceptance Criteria:**

- Skip link visible on focus
- Properly positioned and styled
- Focus moves to carousel
- Keyboard-only flow verified
  **Rollback:** `git checkout -- src/components/`

### Task 3.2: Reduced Motion Defaults ✅

**Goal:** Implement reduced motion preferences
**Steps:**

1. Add useReducedMotionPref hook
2. Default to grid view when prefers-reduced-motion
3. Disable auto-rotation by default
4. Only enable 3D rotation on user interaction

**Commands:**

```bash
npm run dev
# Test with prefers-reduced-motion enabled
```

**Expected Output:** Static experience by default, enhanced on user action
**Acceptance Criteria:**

- Reduced motion defaults respected
- No auto-spin unless user-initiated
- Grid region and aspect-ratio guards in place
- CLS < 0.1 verified
  **Rollback:** `git checkout -- src/hooks/useReducedMotionPref.ts`

### Task 3.3: Playwright + Axe Integration ✅

**Goal:** Add automated accessibility testing
**Steps:**

1. Install @axe-core/playwright
2. Create lab.a11y.spec.ts test file
3. Test keyboard navigation paths
4. Verify ARIA patterns
5. Check focus management

**Commands:**

```bash
npm install -D @axe-core/playwright
npx playwright test tests/lab.a11y.spec.ts
```

**Expected Output:** All accessibility tests passing
**Acceptance Criteria:**

- Playwright + axe tests passing
- Keyboard navigation verified
- Focus trap in modal tested
- Skip link behavior validated
  **Rollback:** `git checkout -- tests/lab.a11y.spec.ts`

### Task 3.4: State Machine Implementation ✅

**Goal:** Implement proper state management for interactions
**Steps:**

1. Define state machine (idle, interacting, modal-open)
2. Implement state transitions
3. Add ARIA live region for announcements
4. Test state persistence

**Commands:**

```bash
pnpm typecheck
pnpm test
```

**Expected Output:** Predictable state management
**Acceptance Criteria:**

- Clear state transitions
- ARIA live regions announce changes
- Modal state properly managed
- Focus restoration working
  **Rollback:** `git checkout -- src/components/lab/`

### Task 3.5: Lighthouse CI Configuration ✅

**Goal:** Set up continuous performance monitoring
**Steps:**

1. Configure Lighthouse CI
2. Set performance thresholds
3. Add CI workflow
4. Test CLS < 0.1 requirement

**Commands:**

```bash
npx lighthouse http://localhost:5173 --view
# Check Performance ≥ 90, CLS < 0.1
```

**Expected Output:** Lighthouse CI configured with thresholds
**Acceptance Criteria:**

- Performance score ≥ 90
- CLS < 0.1 enforced
- Lighthouse CI configured
- E2E test scenarios documented
  **Rollback:** `git checkout -- playwright.config.ts`

### Task 3.1: Grid View Component

**Goal:** Create alternative grid layout
**Steps:**

1. Create LabGrid.tsx component
2. Implement CSS Grid layout
3. Share same data source
4. Match tile interaction patterns

**Commands:**

```bash
touch src/components/lab/LabGrid.tsx
```

**Expected Output:** Responsive grid layout
**Acceptance Criteria:**

- Same tiles, different layout
- Responsive columns (auto-fit)
- Maintains keyboard order
  **Rollback:** `git checkout -- src/components/lab/LabGrid.tsx`

### Task 3.2: Toggle Implementation

**Goal:** Add view switcher control
**Steps:**

1. Create ViewToggle component
2. Add state management for view mode
3. Implement smooth transitions
4. Persist preference in localStorage

**Commands:**

```bash
pnpm test
pnpm build
```

**Expected Output:** Functional view toggle
**Acceptance Criteria:**

- Toggle has aria-pressed state
- Smooth transition between views
- Preference persists on reload
- Reduced motion respected
  **Rollback:** `git checkout -- src/components/lab/`

## Phase 4: Visual Enhancements (Progressive) ✅

### Task 4.1: Feature Flags System ✅

**Goal:** Add feature flags with conservative defaults (OFF by default)
**Steps:**

1. Create flags.ts with VisualFxConfig type
2. Implement shouldEnableFx() with reduced-motion and hardware gating
3. Default all FX to OFF (master kill switch)
4. Gate on minimum 6 cores for mobile devices

**Acceptance Criteria:**

- FX disabled by default
- Reduced motion always disables FX
- Low-core devices auto-disable FX

### Task 4.2: CSS-Only Visual Effects ✅

**Goal:** Implement performant CSS-only visual effects
**Steps:**

1. **Scanlines overlay** - repeating linear gradient on container
2. **RGB split on hover** - pseudo-elements with channel offsets
3. **Depth fade** - opacity based on tile position via --depthFactor

**Acceptance Criteria:**

- No JavaScript per-frame calculations
- Effects use GPU compositing
- CLS remains < 0.1
- FPS stable at ~60

### Task 4.3: FX Toggle UI ✅

**Goal:** Manual override controls for visual effects
**Steps:**

1. Create FxToggle component with master switch
2. Individual toggles for each effect
3. Show disabled state when master is off
4. Add data-testid for testing

### Task 4.4: Tests & Documentation ✅

**Goal:** Ensure FX behavior is correct and documented
**Steps:**

1. Playwright tests for FX gating
2. Reduced motion enforcement tests
3. Update ARCHITECTURE.md with FX system
4. Document performance impact

**Commands:**

```bash
pnpm lint
pnpm build
```

**Expected Output:** Smart pause behavior
**Acceptance Criteria:**

- Pauses on any interaction
- Resumes after 10s idle
- Play/pause button accessible
- State clearly indicated
  **Rollback:** `git checkout -- src/components/lab/LabCarousel.tsx`

## Phase 5 — Depth Fade Refinement ✅

### Task 5.1: Depth Fade Enhancement

**Goal:** Increase visual contrast between front and back tiles
**Steps:**

1. Adjust opacity formula from calc(0.65 + factor*0.35) to calc(0.35 + factor*0.65)
2. Add subtle blur effect for distant tiles: blur(calc((1 - factor) \* 1.2px))
3. Maintain brightness/contrast/saturation adjustments
4. Keep GPU-safe transitions

**Acceptance Criteria:**

- Front tiles clearly more opaque (up to 100%) than back tiles (min 35%)
- Subtle blur adds depth without performance impact
- Smooth transitions maintained
- FPS remains ≥ 60

### Task 5.2: Depth Fade Testing

**Goal:** Add automated tests for depth fade contrast
**Steps:**

1. Create lab.depthfade.spec.ts Playwright test
2. Test opacity difference between front/back tiles (≥ 0.15 delta)
3. Verify reduced motion disables depth fade
4. Test performance impact with FX enabled

**Acceptance Criteria:**

- Clear opacity contrast visible (front pop, back recede)
- FPS ≥ 60, no CLS impact
- Reduced-motion mode still disables effects

## Phase 5: Performance & Polish

### Task 5.1: Image Optimization

**Goal:** Optimize image loading performance
**Steps:**

1. Implement lazy loading
2. Add loading placeholders
3. Use srcset for responsive images
4. Preload critical images

**Commands:**

```bash
npx lighthouse http://localhost:5173 --view
```

**Expected Output:** Optimized image loading
**Acceptance Criteria:**

- CLS < 0.1
- LCP < 2.5s
- No layout shift on load
- Progressive enhancement
  **Rollback:** `git checkout -- src/components/lab/LabTile.tsx`

### Task 5.2: Animation Polish

**Goal:** Refine all animations and transitions
**Steps:**

1. Add spring physics to rotation
2. Implement gesture support
3. Fine-tune timing functions
4. Add subtle tile hover effects

**Commands:**

```bash
pnpm analyze
pnpm build
```

**Expected Output:** Polished, professional animations
**Acceptance Criteria:**

- Natural motion feel
- No jank or stutter
- Touch-friendly on mobile
- Respects user preferences
  **Rollback:** `git checkout -- src/styles/lab.css`

## Testing Checklist

Run these checks after each phase:

```bash
# Lint & Type Check
pnpm lint
pnpm typecheck

# Build & Preview
pnpm build
pnpm preview

# Performance
npx lighthouse http://localhost:5173 --view

# Accessibility
# Manual: Test with keyboard only
# Manual: Test with screen reader
# Manual: Test with reduced motion enabled
```

## Rollback Strategy

Each task includes specific rollback commands. For phase-level rollback:

```bash
# Rollback entire phase
git tag -a phase-X-backup -m "Backup before rollback"
git reset --hard <previous-phase-tag>

# Nuclear option (full reset)
git fetch origin
git reset --hard origin/main
```
