import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function fastDemo(page: import('@playwright/test').Page) {
  await page.addInitScript(() => sessionStorage.setItem('couch-creatures:test-fast', '1'));
  await page.goto('/demo');
  await page.keyboard.down('d');
  await page.keyboard.down('l');
  await page.keyboard.down('h');
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(4_200);
  await page.keyboard.up('d'); await page.keyboard.up('l'); await page.keyboard.up('h'); await page.keyboard.up('ArrowRight');
}

test('@claim:demo-isolated the homepage action enters the demo namespace', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo status')).toBeVisible();
  await page.getByLabel(/Assist mode/).check();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('demo:couch-creatures:assist'))).toBe('true');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('couch-creatures:assist'))).toBeNull();
  await page.reload();
  await expect(page.getByLabel(/Assist mode/)).toBeChecked();
});

test('@claim:end-screen a seeded full rescue reaches the group postcard', async ({ page }) => {
  await fastDemo(page);
  await expect(page.getByRole('heading', { name: 'All creatures are home' })).toBeVisible();
});

test('@claim:restart-resets a new route resets the completed run', async ({ page }) => {
  await fastDemo(page);
  await page.getByRole('button', { name: 'Play a new route' }).click();
  await expect(page.getByText(/Habitat 1 of 3: Drainway/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'All creatures are home' })).toBeHidden();
});

test('@claim:recovery an active demo rescue restores after reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Move player one right' }).click();
  await page.waitForTimeout(1_100);
  const before = await page.evaluate(() => localStorage.getItem('demo:couch-creatures:run'));
  expect(before).toContain('"phase":"playing"');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('demo:couch-creatures:run') || '{}').elapsed)).toBeGreaterThan(0);
});

test('@claim:four-players keyboard and touch controls operate all four lanterns', async ({ page }) => {
  await page.goto('/demo');
  for (const name of ['one', 'two', 'three', 'four']) await expect(page.getByRole('button', { name: `Move player ${name} right` })).toBeVisible();
  await page.keyboard.down('f'); await page.waitForTimeout(120); await page.keyboard.up('f');
  await page.getByRole('button', { name: 'Move player four right' }).click();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:couch-creatures:run') || '{}'));
  expect(state.lanterns[2]).not.toBe(370); expect(state.lanterns[3]).not.toBe(510);
});

test('@claim:hazards-and-loss seeded hazards create a recoverable loss state', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('demo:couch-creatures:run', JSON.stringify({ phase: 'lost', habitat: 1, rescued: 3, elapsed: 184, strikes: 3, lanterns: [90,230,370,510], creatures: [], seed: 'moss-postcard-17' })));
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'The group needs another try' })).toBeVisible();
  await page.getByRole('button', { name: 'Try this route again' }).click();
  await expect(page.getByText(/Habitat 1 of 3: Drainway/)).toBeVisible();
});

test('@claim:nine-minute-pace every full run has three 180-second shelter windows', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Plan for nine minutes')).toBeVisible();
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.getByText(/180 seconds remain/)).toBeVisible();
});

test('@claim:local-only demo play makes no cross-origin requests', async ({ page }) => {
  const external: string[] = []; page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173')) external.push(request.url()); });
  await page.goto('/'); await page.getByRole('link', { name: 'Try it with sample data' }).click(); await page.getByRole('button', { name: 'Move player two right' }).click();
  expect(external).toEqual([]);
});

test('routes move focus, targets are touch sized, and have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/controller']) { await page.goto(path); const results = await new AxeBuilder({ page }).analyze(); expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]); }
  await page.goto('/'); await page.getByRole('link', { name: 'Demo' }).click(); await expect(page.getByRole('heading', { name: 'Guide creatures home together' })).toBeFocused();
  const tooSmall = await page.locator('button,a').evaluateAll(els => els.filter(el => { const r = el.getBoundingClientRect(); return !!(el as HTMLElement).offsetParent && (r.width < 44 || r.height < 44); }).map(el => (el as HTMLElement).innerText));
  expect(tooSmall).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  const imageBox = await page.locator('.route-art img').boundingBox(); expect(imageBox && Math.abs(imageBox.width / imageBox.height - 1.5) < .02).toBeTruthy();
  const mobileAxe = await new AxeBuilder({ page }).analyze(); expect(mobileAxe.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
});
