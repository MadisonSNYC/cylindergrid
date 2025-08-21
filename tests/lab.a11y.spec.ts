import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Lab Carousel — A11y & Interaction (Phase 3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page has no critical a11y violations', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.lab-section');
    
    // Run axe on the page
    const results = await new AxeBuilder({ page }).analyze();
    
    // Check for critical violations
    const criticalViolations = results.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations).toEqual([]);
  });

  test('toggle button switches between views', async ({ page }) => {
    // Find toggle button
    const toggle = page.locator('button').first();
    await expect(toggle).toBeVisible();
    
    // Check initial state (should show carousel)
    await expect(page.locator('.lab-carousel')).toBeVisible();
    
    // Click to switch to grid
    await toggle.click();
    await expect(page.locator('.lab-grid')).toBeVisible();
    
    // Click to switch back to carousel
    await toggle.click();
    await expect(page.locator('.lab-carousel')).toBeVisible();
  });

  test('carousel has proper data-testid attributes', async ({ page }) => {
    // Check carousel has testid
    const carousel = page.getByTestId('lab-carousel');
    await expect(carousel).toBeVisible();
    
    // Check tiles have testids
    const tiles = page.getByTestId('lab-tile');
    await expect(tiles.first()).toBeVisible();
  });

  test('grid view has ARIA region', async ({ page }) => {
    // Switch to grid view
    const toggle = page.locator('button').first();
    await toggle.click();
    
    // Check for ARIA region
    const gridRegion = page.locator('[role="region"][aria-label="Project grid"]');
    await expect(gridRegion).toBeVisible();
  });

  test('skip link is present but visually hidden', async ({ page }) => {
    // Check skip link exists
    const skipLink = page.locator('a:has-text("Skip 3D view")');
    await expect(skipLink).toBeInViewport();
    
    // Check it has sr-only class
    await expect(skipLink).toHaveClass(/sr-only/);
  });

  test('reduced motion defaults to grid view', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    
    // Should default to grid view
    await expect(page.locator('.lab-grid')).toBeVisible();
  });
});