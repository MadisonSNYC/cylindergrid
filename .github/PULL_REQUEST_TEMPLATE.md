## Summary
- What this PR does (1–2 lines)

## Checklists
- [ ] No inline scripts/styles (CSP-safe)
- [ ] a11y: keyboard order, visible focus, hover==focus
- [ ] Respects `prefers-reduced-motion`
- [ ] CLS < 0.1 (no layout shift on image load)
- [ ] Rotation is transform-only (GPU-friendly)
- [ ] Links sanitized (`rel="noopener noreferrer"` where needed)

## Testing
- Browsers/devices tested:
- Screen reader / keyboard:
- Perf (FPS) + Lighthouse notes: