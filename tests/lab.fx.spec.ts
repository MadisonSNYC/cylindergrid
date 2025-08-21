import { test, expect } from '@playwright/test';

test.describe('Lab Carousel — Visual FX (Phase 4)', () => {
  test('reduced motion: FX remains disabled even if toggled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    
    // Ensure FX toggle exists
    const fxToggle = page.getByTestId('fx-toggle');
    await expect(fxToggle).toBeVisible();
    
    // Try to enable master FX
    const master = page.locator('#fx-master');
    await master.check();
    
    // Hover a tile and verify FX classes are not applied
    const section = page.locator('.lab-section');
    const hasFxClass = await section.evaluate(el => el.classList.contains('lab-fx--on'));
    expect(hasFxClass).toBeFalsy();
  });

  test('fx enabled: scanlines overlay present on container', async ({ page }) => {
    await page.goto('/');
    
    // Enable master fx
    const master = page.locator('#fx-master');
    await master.check();
    
    // Container should have fx class
    const section = page.locator('.lab-section');
    const hasFxClass = await section.evaluate(el => el.classList.contains('lab-fx--on'));
    expect(hasFxClass).toBeTruthy();
    
    // Check scanlines container exists
    const scanlines = page.locator('#fx-scanlines');
    await scanlines.check();
    const root = page.locator('.lab-root');
    const hasScanlines = await root.evaluate(el => el.classList.contains('lab-scanlines'));
    expect(hasScanlines).toBeTruthy();
  });

  test('fx toggles work independently', async ({ page }) => {
    await page.goto('/');
    
    // Enable master
    await page.locator('#fx-master').check();
    
    // Toggle individual effects
    const scanlines = page.locator('#fx-scanlines');
    const rgbSplit = page.locator('#fx-rgb-split');
    const depthFade = page.locator('#fx-depth-fade');
    
    await expect(scanlines).toBeChecked();
    await expect(rgbSplit).toBeChecked();
    await expect(depthFade).toBeChecked();
    
    // Uncheck them
    await scanlines.uncheck();
    await expect(scanlines).not.toBeChecked();
  });

  test('depth fade applies to tiles when enabled', async ({ page }) => {
    await page.goto('/');
    
    // Enable FX with depth fade
    await page.locator('#fx-master').check();
    await page.locator('#fx-depth-fade').check();
    
    // Check that tiles have depth factor CSS variable
    const tile = page.getByTestId('lab-tile').first();
    const hasDepthFactor = await tile.evaluate(el => {
      const style = el.getAttribute('style');
      return style?.includes('--depthFactor') ?? false;
    });
    expect(hasDepthFactor).toBeTruthy();
  });
});