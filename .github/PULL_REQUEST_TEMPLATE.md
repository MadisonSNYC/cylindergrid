## Summary
<!-- Brief description of what this PR does (1-2 lines) -->

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Performance improvement
- [ ] Documentation update
- [ ] Code refactoring

## Checklists

### Code Quality
- [ ] No inline scripts/styles (CSP-safe)
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] No console.log or debug statements

### Accessibility
- [ ] Keyboard navigation works correctly
- [ ] Focus order is logical
- [ ] Focus indicators are visible
- [ ] Hover states have focus parity
- [ ] Screen reader tested (NVDA/JAWS/VoiceOver)
- [ ] Respects `prefers-reduced-motion`
- [ ] ARIA attributes used correctly
- [ ] Color contrast meets WCAG AA standards

### Performance
- [ ] CLS < 0.1 (no layout shift on image load)
- [ ] LCP < 2.5s
- [ ] 60 FPS maintained during animations
- [ ] Rotation is transform-only (GPU-friendly)
- [ ] Images are optimized and lazy-loaded
- [ ] Bundle size increase is justified

### Security
- [ ] Links sanitized (`rel="noopener noreferrer"` where needed)
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] CSP compliant

## Testing
### Browsers/Devices Tested
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Testing Performed
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Keyboard-only navigation
- [ ] Screen reader testing
- [ ] Reduced motion mode
- [ ] Different viewport sizes

### Performance Metrics
```
Before:
- Bundle size: ___KB
- Lighthouse score: ___
- CLS: ___
- LCP: ___s

After:
- Bundle size: ___KB (+/- ___KB)
- Lighthouse score: ___
- CLS: ___
- LCP: ___s
```

## Screenshots/Videos
<!-- Add screenshots or videos demonstrating the changes, especially for UI updates -->

## Related Issues
<!-- Link any related issues using #issue-number -->
Closes #

## Additional Notes
<!-- Any additional context, decisions made, or areas that need special attention during review -->