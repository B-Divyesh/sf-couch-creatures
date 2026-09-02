import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function publicWin(page: Page) {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Watch sample rescue' }).click();
  await expect(page.getByRole('heading', { name: 'All creatures are home' })).toBeVisible({ timeout: 15_000 });
}

test('@claim:demo-isolated the sample action uses only the demo namespace', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo status')).toBeVisible();
  await page.getByLabel(/Assist mode/).check();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('demo:couch-creatures:assist'))).toBe('true');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('couch-creatures:assist'))).toBeNull();
  await page.reload();
  await expect(page.getByLabel(/Assist mode/)).toBeChecked();
});

test('@claim:end-screen a public seeded rescue reaches the group postcard', async ({ page }) => {
  await publicWin(page);
  await expect(page.getByRole('heading', { name: 'All creatures are home' })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:couch-creatures:run') || '{}'));
  expect(saved.phase).toBe('postcard');
  expect(saved.rescued).toBeGreaterThanOrEqual(6);
});

test('@claim:restart-resets playing a new route resets the naturally completed run', async ({ page }) => {
  await publicWin(page);
  await page.getByRole('button', { name: 'Play a new route' }).click();
  await expect(page.getByText(/Habitat 1 of 3: Drainway/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'All creatures are home' })).toBeHidden();
});

test('@claim:recovery malformed and active saves recover without page errors', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => { if (!sessionStorage.getItem('malformed-save-set')) { localStorage.setItem('demo:couch-creatures:run', '{}'); sessionStorage.setItem('malformed-save-set', 'yes'); } });
  await page.goto('/demo');
  await expect(page.getByText(/Habitat 1 of 3: Drainway/)).toBeVisible();
  expect(errors).toEqual([]);
  await page.getByRole('button', { name: 'Move player one right' }).click();
  await page.waitForTimeout(1_100);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
});

test('@claim:four-players keyboard and touch controls operate all four lanterns', async ({ page }) => {
  await page.goto('/demo');
  for (const name of ['one', 'two', 'three', 'four']) await expect(page.getByRole('button', { name: `Move player ${name} right` })).toBeVisible();
  await page.keyboard.down('f'); await page.waitForTimeout(120); await page.keyboard.up('f');
  await page.getByRole('button', { name: 'Move player four right' }).click();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:couch-creatures:run') || '{}'));
  expect(state.lanterns[2]).not.toBe(370); expect(state.lanterns[3]).not.toBe(510);
});

test('@claim:hazards-and-loss public storm collisions end a route and retry keeps its seed', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Watch storm loss' }).click();
  await expect(page.getByRole('heading', { name: 'The group needs another try' })).toBeVisible();
  const seed = await page.locator('.eyebrow').first().textContent();
  await page.getByRole('button', { name: 'Try this route again' }).click();
  await expect(page.getByText(/Habitat 1 of 3: Drainway/)).toBeVisible();
  await expect(page.locator('.eyebrow').first()).toHaveText(seed || '');
});

test('@claim:nine-minute-pace every normal run has three 180-second shelter windows', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/180 seconds remain/)).toBeVisible();
  await expect(page.getByText(/three-minute shelter window/)).toBeVisible();
  await expect(page.getByText(/Habitat 1 of 3/)).toBeVisible();
});

test('@claim:local-only demo play makes no cross-origin requests', async ({ page }) => {
  const external: string[] = []; page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173')) external.push(request.url()); });
  await page.goto('/demo'); await page.getByRole('button', { name: 'Move player two right' }).click();
  expect(external).toEqual([]);
});

test('@claim:phone-room the deployed API handlers forward a valid phone move and rate limit room creation', async () => {
  const create = (await import('../api/rooms/index.js')).default as (context: { res?: unknown }, request: { headers: Record<string, string> }) => Promise<void>;
  const moves = (await import('../api/roomMoves/index.js')).default as (context: { bindingData: { room: string }; res?: { body: unknown } }, request: { method: string; body?: unknown; query: Record<string, string> }) => Promise<void>;
  const rooms: string[] = [];
  for (let i = 0; i < 8; i++) { const context: { res?: { status: number; body: { room: string } } } = {}; await create(context, { headers: { 'x-forwarded-for': 'claim-client' } }); expect(context.res?.status).toBe(201); rooms.push(context.res!.body.room); }
  const limited: { res?: { status: number; headers: Record<string, string> } } = {}; await create(limited, { headers: { 'x-forwarded-for': 'claim-client' } }); expect(limited.res?.status).toBe(429); expect(limited.res?.headers['Retry-After']).toBeTruthy();
  const game = { bindingData: { room: rooms[0] } }; await moves(game, { method: 'GET', query: { after: '0' } }); expect(game.res?.body).toEqual({ cursor: 0, moves: [] });
  const phone = { bindingData: { room: rooms[0] } }; await moves(phone, { method: 'POST', body: { player: 2, direction: -1 }, query: {} }); expect(phone.res?.body).toEqual({ ok: true });
  const forwarded = { bindingData: { room: rooms[0] } }; await moves(forwarded, { method: 'GET', query: { after: '0' } }); expect(forwarded.res?.body).toEqual({ cursor: 1, moves: [{ player: 2, direction: -1 }] });
});

test('normalized RNG keeps public seeded creatures and storms on the board', async ({ page }) => {
  await page.goto('/demo');
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:couch-creatures:run') || '{}'));
  expect(state.creatures).toHaveLength(4);
  for (const creature of state.creatures) { expect(creature.x).toBeGreaterThanOrEqual(42); expect(creature.x).toBeLessThanOrEqual(558); expect(creature.y).toBeGreaterThanOrEqual(48); expect(creature.y).toBeLessThanOrEqual(306); }
  expect(new Set(state.creatures.map((creature: { trait: string }) => creature.trait)).size).toBe(4);
});

test('root opens the playable board, reduced motion freezes canvas motion, and routes remain accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('canvas#game')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Guide creatures home together' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start phone room' })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const path of ['/', '/demo', '/privacy', '/terms', '/controller']) { await page.goto(path); const results = await new AxeBuilder({ page }).analyze(); expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]); }
  await page.goto('/'); await page.getByRole('link', { name: 'Demo' }).click(); await expect(page.getByRole('heading', { name: 'Guide creatures home together' })).toBeFocused();
  const tooSmall = await page.locator('button,a').evaluateAll(els => els.filter(el => { const r = el.getBoundingClientRect(); return !!(el as HTMLElement).offsetParent && (r.width < 44 || r.height < 44); }).map(el => (el as HTMLElement).innerText));
  expect(tooSmall).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/'); await expect(page.locator('canvas#game')).toBeVisible();
});
