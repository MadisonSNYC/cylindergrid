import { test, expect } from '@playwright/test';

test.describe('Lab Carousel — Depth Fade', () => {
  test('front vs back tile opacity shows clear contrast', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('checkbox', { name: /enable visual fx/i }).check();

    // Wait for carousel to be ready
    await page.waitForSelector('[data-testid="lab-carousel"]');

    // Grab computed opacity for first (front) and mid (back) tiles
    const tiles = page.locator('[data-testid="lab-tile"]');
    const tileCount = await tiles.count();
    const firstTile = tiles.first();
    const midTile = tiles.nth(Math.floor(tileCount / 2));

    const frontOpacity = await firstTile.evaluate((el) => getComputedStyle(el).opacity);
    const backOpacity = await midTile.evaluate((el) => getComputedStyle(el).opacity);

    expect(Number(frontOpacity)).toBeGreaterThan(Number(backOpacity) + 0.15);
  });

  test('depth fade disabled with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Should default to grid view with reduced motion
    const gridView = page.locator('.lab-grid');
    await expect(gridView).toBeVisible();
  });
});
