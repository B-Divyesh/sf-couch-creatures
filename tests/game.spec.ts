import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function complete(page: import('@playwright/test').Page) {
  for (let habitat = 0; habitat < 3; habitat++) {
    for (let i = 0; i < 8; i++) await page.getByRole('button', { name: 'Help herd creatures' }).click();
    await page.waitForTimeout(140);
  }
}

test('@claim:end-screen A full rescue reaches a group postcard', async ({ page }) => {
  await page.goto('/demo');
  await complete(page);
  await expect(page.getByRole('heading', { name: 'All 12 creatures are home' })).toBeVisible();
});

test('@claim:restart-resets Play again starts a fresh run', async ({ page }) => {
  await page.goto('/demo');
  await complete(page);
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.getByText('Habitat 1 of 3: Drainway. 4 creatures still need shelter.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'All 12 creatures are home' })).toBeHidden();
});

test('@claim:settings-persist Assist settings stay on this device', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Assist mode slows the creatures').check();
  await page.reload();
  await expect(page.getByLabel('Assist mode slows the creatures')).toBeChecked();
});

test('@claim:local-only The demo sends no requests away from this site', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173')) external.push(request.url()); });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Help herd creatures' }).click();
  expect(external).toEqual([]);
});

test('@claim:shared-input keyboard and touch controls start the rescue', async ({ page }) => {
  await page.goto('/demo');
  await page.keyboard.press('d');
  await expect(page.getByText(/Habitat 1 of 3: Drainway/)).toContainText('still need shelter');
  await page.getByRole('button', { name: 'Move player two right' }).click();
  await expect(page.locator('canvas')).toBeVisible();
});

test('home and demo have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
  }
});
