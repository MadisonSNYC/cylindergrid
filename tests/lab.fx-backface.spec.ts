import { test, expect } from '@playwright/test';

test('FX ON: back tiles remain visible (no backface cull)', async ({ page }) => {
  await page.goto('/');
  // Enable FX
  const master = page.getByRole('checkbox', { name: /enable visual fx/i });
  await master.check();
  // Opposite tile (roughly half-way around)
  const tiles = page.getByTestId('lab-tile');
  const count = await tiles.count();
  const back = tiles.nth(Math.floor(count / 2));
  // Should render with size and opacity not too low
  const box = await back.boundingBox();
  expect(box?.width || 0).toBeGreaterThan(10);
  const opacity = await back.evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(opacity).toBeGreaterThanOrEqual(0.55);
});
