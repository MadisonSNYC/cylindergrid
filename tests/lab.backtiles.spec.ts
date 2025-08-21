import { test, expect } from '@playwright/test';

test('back tiles remain visible with depth fade enabled', async ({ page }) => {
  await page.goto('/');
  // enable FX master
  const master = page.getByRole('checkbox', { name: /enable visual fx/i });
  await master.check();
  // pick a tile opposite the first (midway around)
  const tiles = page.getByTestId('lab-tile');
  const count = await tiles.count();
  const back = tiles.nth(Math.floor(count / 2));
  const opacity = await back.evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(opacity).toBeGreaterThanOrEqual(0.55);
});
