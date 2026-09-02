import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function publicWin(page: Page) {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Watch sample rescue" }).click();
  await expect(
    page.getByRole("heading", { name: /\d+ of 12 creatures reached shelter/ }),
  ).toBeVisible({ timeout: 15_000 });
}

async function demoState(page: Page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("demo:couch-creatures:run") || "{}"),
  );
}

test("@claim:demo-isolated the sample action uses only the demo namespace", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Try it with sample data", exact: true })
    .click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel("Demo status")).toContainText(
    "sample data, nothing is saved",
  );
  await page.getByLabel(/Assist mode/).check();
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("demo:couch-creatures:assist")),
    )
    .toBe("true");
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("couch-creatures:assist")),
    )
    .toBeNull();
  await page.reload();
  await expect(page.getByLabel(/Assist mode/)).toBeChecked();
});

test("@claim:end-screen a public seeded rescue reaches a truthful group postcard", async ({
  page,
}) => {
  await publicWin(page);
  const saved = await demoState(page);
  expect(saved.phase).toBe("postcard");
  expect(saved.rescued).toBeGreaterThanOrEqual(6);
  expect(saved.rescued).toBeLessThanOrEqual(12);
  await expect(
    page.getByRole("heading", {
      name: `${saved.rescued} of 12 creatures reached shelter`,
    }),
  ).toBeVisible();
  await expect(page.locator("#postcard-copy")).toContainText(
    `sheltered ${saved.rescued} creatures`,
  );
});

test("@claim:restart-resets playing a new route resets the naturally completed run", async ({
  page,
}) => {
  await publicWin(page);
  await page.getByRole("button", { name: "Play a new route" }).click();
  await expect(page.getByText(/Habitat 1 of 3: Drainway/)).toBeVisible();
  expect(await demoState(page)).toMatchObject({
    phase: "ready",
    habitat: 0,
    rescued: 0,
    elapsed: 0,
  });
  await expect(page.locator("#postcard")).toBeHidden();
});

test("@claim:recovery malformed and active saves recover without page errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("malformed-save-set")) {
      localStorage.setItem("demo:couch-creatures:run", "{}");
      sessionStorage.setItem("malformed-save-set", "yes");
    }
  });
  await page.goto("/demo");
  await expect(page.getByText(/Habitat 1 of 3: Drainway/)).toBeVisible();
  expect(errors).toEqual([]);
  await page.getByRole("button", { name: "Move player one right" }).click();
  await page.waitForTimeout(1_100);
  await page.reload();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
});

test("@claim:four-players keyboard and touch controls operate all four lanterns", async ({
  page,
}) => {
  await page.goto("/demo");
  for (const name of ["one", "two", "three", "four"])
    await expect(
      page.getByRole("button", { name: `Move player ${name} right` }),
    ).toBeVisible();
  await page.keyboard.down("f");
  await page.waitForTimeout(120);
  await page.keyboard.up("f");
  await page.getByRole("button", { name: "Move player four right" }).click();
  const state = await demoState(page);
  expect(state.lanterns[2]).not.toBe(370);
  expect(state.lanterns[3]).not.toBe(510);
});

test("@claim:hazards-and-loss public storm collisions end a route and retry keeps its seed", async ({
  page,
}) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Watch storm loss" }).click();
  await expect(
    page.getByRole("heading", { name: "The group needs another try" }),
  ).toBeVisible();
  const lost = await demoState(page);
  expect(lost).toMatchObject({ phase: "lost", lossReason: "storm" });
  await page.getByRole("button", { name: "Try this route again" }).click();
  const retry = await demoState(page);
  expect(retry).toMatchObject({
    phase: "ready",
    habitat: 0,
    rescued: 0,
    elapsed: 0,
  });
  expect(retry.seed).toBe(lost.seed);
});

test("@claim:nine-minute-pace the 180-second shelter deadline causes a real loss and retry", async ({
  page,
}) => {
  await page.goto("/demo");
  await page.evaluate(() => {
    const key = "demo:couch-creatures:run";
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    saved.phase = "playing";
    saved.elapsed = 180.1;
    saved.strikes = 0;
    saved.habitat = 0;
    saved.rescued = 0;
    saved.creatures.forEach(
      (creature: { progress: number }) => (creature.progress = 0),
    );
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.getByText(/0 seconds remain/)).toBeVisible();
  await page.getByRole("button", { name: "Resume" }).click();
  await expect(
    page.getByRole("heading", { name: "The shelter window closed" }),
  ).toBeVisible();
  const lost = await demoState(page);
  expect(lost.phase).toBe("lost");
  expect(lost.lossReason).toBe("deadline");
  expect(lost.elapsed).toBeLessThan(180.2);
  await page.getByRole("button", { name: "Try this route again" }).click();
  expect(await demoState(page)).toMatchObject({
    phase: "ready",
    habitat: 0,
    rescued: 0,
    elapsed: 0,
  });
  await page.getByRole("button", { name: "Watch sample rescue" }).click();
  await expect(page.locator("#postcard")).toBeVisible({ timeout: 15_000 });
  const completed = await demoState(page);
  expect(completed.phase).toBe("postcard");
  expect(completed.elapsed).toBeGreaterThanOrEqual(540);
  expect(completed.elapsed).toBeLessThan(540.1);
});

test("@claim:local-only demo play stores no child profile and makes no cross-origin requests", async ({
  page,
}) => {
  const expectedOrigin = new URL(
    process.env.COUCH_SITE_URL || "http://127.0.0.1:4173",
  ).origin;
  const external: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== expectedOrigin)
      external.push(request.url());
  });
  await page.goto("/demo");
  await page.getByRole("button", { name: "Move player two right" }).click();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(
    keys.every((storageKey) => storageKey.startsWith("demo:couch-creatures:")),
  ).toBe(true);
  expect(external).toEqual([]);
});

test("@claim:loaded-offline loaded shared-device play keeps working after the network drops", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(
    `${process.env.COUCH_SITE_URL || "http://127.0.0.1:4173"}/demo`,
  );
  await context.setOffline(true);
  await page.getByRole("button", { name: "Move player one right" }).click();
  await expect.poll(() => demoState(page)).toMatchObject({ phase: "playing" });
  await context.setOffline(false);
  await context.close();
});

test("@claim:free-play the game exposes no ads, checkout, or purchase action", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Free, with no ads or purchases.")).toBeVisible();
  expect(await page.locator("iframe").count()).toBe(0);
  expect(
    await page
      .locator('a[href*="checkout"],a[href*="billing"],[data-ad]')
      .count(),
  ).toBe(0);
  await page.goto("/terms");
  await expect(
    page.getByText("Couch Creatures is free to play and has no purchases."),
  ).toBeVisible();
});

test("@claim:phone-room the live room relay forwards concurrent moves, advances its cursor, expires rooms, and enforces its allowance", async ({
  page,
  context,
}) => {
  await page.goto("/demo");
  const health = await page.evaluate(async () => {
    const response = await fetch("/api/health");
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.json(),
    };
  });
  expect(health.status).toBe(200);
  expect(health.body).toMatchObject({
    ok: true,
    service: "couch-creatures-room-relay",
    storage: "sqlite",
    roomTtlSeconds: 1200,
    createLimit: { count: 8, windowSeconds: 60 },
    moveBuffer: 120,
  });
  if (process.env.COUCH_SITE_URL)
    expect(health.body.build).toMatch(/^[0-9a-f]{40}$/);
  expect(health.headers["content-type"]).toContain("application/json");
  expect(health.headers["x-content-type-options"]).toBe("nosniff");
  expect(health.headers["referrer-policy"]).toBe("no-referrer");
  expect(health.headers["content-security-policy"]).toContain(
    "default-src 'none'",
  );
  const identities = await page.evaluate(async () =>
    Promise.all(
      ["/api/version", "/api/build"].map(async (path) => {
        const response = await fetch(path);
        return { status: response.status, body: await response.json() };
      }),
    ),
  );
  expect(identities.map((identity) => identity.status)).toEqual([200, 200]);
  expect(
    identities.every((identity) => identity.body.build === health.body.build),
  ).toBe(true);
  const missing = await page.evaluate(async () => {
    const response = await fetch("/api/not-a-route");
    return {
      status: response.status,
      type: response.headers.get("content-type"),
      nosniff: response.headers.get("x-content-type-options"),
      referrer: response.headers.get("referrer-policy"),
      body: await response.json(),
    };
  });
  expect(missing).toMatchObject({
    status: 404,
    nosniff: "nosniff",
    referrer: "no-referrer",
    body: { error: "API route not found." },
  });
  expect(missing.type).toContain("application/json");

  await page.getByRole("button", { name: "Start phone room" }).click();
  await expect(page.locator("#qr-box")).toBeVisible();
  const room = (await page.locator("#room-code").textContent())!;
  expect(room).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);

  const phone = await context.newPage();
  await phone.goto(`/controller?room=${room}`);
  await expect(phone.getByText("Connected. Choose a lantern.")).toBeVisible();
  await phone.getByRole("button", { name: "Lantern 3" }).click();
  await phone.getByRole("button", { name: "Move left" }).click();
  await expect(phone.getByText("Lantern 3 moved left.")).toBeVisible();
  await expect.poll(async () => (await demoState(page)).lanterns[2]).toBe(342);

  const concurrent = await page.evaluate(
    async (roomCode) =>
      Promise.all(
        Array.from({ length: 20 }, async (_, index) => {
          const response = await fetch(`/api/rooms/${roomCode}/moves`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              player: index % 4,
              direction: index % 2 ? 1 : -1,
            }),
          });
          return response.status;
        }),
      ),
    room,
  );
  expect(concurrent).toEqual(Array(20).fill(202));

  let current = await page.evaluate(async (roomCode) => {
    const response = await fetch(`/api/rooms/${roomCode}/moves?after=0`);
    return response.json();
  }, room);
  expect(current.moves).toHaveLength(21);
  while (current.moves.length < 120) {
    const status = await page.evaluate(
      async (roomCode) =>
        (
          await fetch(`/api/rooms/${roomCode}/moves`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ player: 0, direction: 1 }),
          })
        ).status,
      room,
    );
    expect(status).toBe(202);
    current.moves.push({});
  }
  current = await page.evaluate(
    async (roomCode) =>
      (await fetch(`/api/rooms/${roomCode}/moves?after=0`)).json(),
    room,
  );
  expect(current.moves).toHaveLength(120);
  const previousCursor = current.cursor;
  const afterBuffer = await page.evaluate(
    async ({ roomCode, after }) => {
      const sent = await fetch(`/api/rooms/${roomCode}/moves`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ player: 2, direction: -1 }),
      });
      const received = await fetch(
        `/api/rooms/${roomCode}/moves?after=${after}`,
      );
      return { sent: sent.status, body: await received.json() };
    },
    { roomCode: room, after: previousCursor },
  );
  expect(afterBuffer.sent).toBe(202);
  expect(afterBuffer.body.cursor).toBeGreaterThan(previousCursor);
  expect(afterBuffer.body.moves).toEqual([
    { cursor: afterBuffer.body.cursor, player: 2, direction: -1 },
  ]);

  const allowance = await page.evaluate(async () => {
    const attempts = [];
    for (let index = 0; index < 8; index++) {
      const response = await fetch("/api/rooms", { method: "POST" });
      attempts.push({
        status: response.status,
        retryAfter: response.headers.get("Retry-After"),
        body: await response.json(),
      });
    }
    return attempts;
  });
  expect(allowance.slice(0, 7).map((item) => item.status)).toEqual(
    Array(7).fill(201),
  );
  for (const created of allowance.slice(0, 7)) {
    const remaining = new Date(created.body.expiresAt).getTime() - Date.now();
    expect(remaining).toBeGreaterThan(19 * 60 * 1000);
    expect(remaining).toBeLessThanOrEqual(20 * 60 * 1000);
  }
  expect(allowance[7].status).toBe(429);
  expect(Number(allowance[7].retryAfter)).toBeGreaterThan(0);
  expect(Number(allowance[7].retryAfter)).toBeLessThanOrEqual(60);
});

test("@claim:frame-rate active play renders at least 55 frames per second at 390px under 4x CPU slowdown", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(
    `${process.env.COUCH_SITE_URL || "http://127.0.0.1:4173"}/demo`,
  );
  await page.getByRole("button", { name: "Move player one right" }).click();
  const fps = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let frames = 0;
        const started = performance.now();
        const count = (now: number) => {
          frames += 1;
          if (now - started >= 3_000)
            resolve((frames * 1000) / (now - started));
          else requestAnimationFrame(count);
        };
        requestAnimationFrame(count);
      }),
  );
  console.log(`Measured active-play frame rate: ${fps.toFixed(2)} fps`);
  expect(fps).toBeGreaterThanOrEqual(55);
  await context.close();
});

test("normalized RNG keeps public seeded creatures and storms on the board", async ({
  page,
}) => {
  await page.goto("/demo");
  const state = await demoState(page);
  expect(state.creatures).toHaveLength(4);
  for (const creature of state.creatures) {
    expect(creature.x).toBeGreaterThanOrEqual(42);
    expect(creature.x).toBeLessThanOrEqual(558);
    expect(creature.y).toBeGreaterThanOrEqual(48);
    expect(creature.y).toBeLessThanOrEqual(306);
  }
  expect(
    new Set(
      state.creatures.map((creature: { trait: string }) => creature.trait),
    ).size,
  ).toBe(4);
});

test("cold desktop and mobile screens show the audience, sample action, facts, playable board, and accessible routes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("canvas#game")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Guide creatures home together" }),
  ).toBeVisible();
  await expect(
    page.getByText(/For families and friends sharing one device/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Try it with sample data", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("No account or child profile.")).toBeVisible();
  await expect(
    page.getByText("Loaded shared-device play works without a network."),
  ).toBeVisible();
  await expect(page.getByText("Free, with no ads or purchases.")).toBeVisible();

  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const path of ["/", "/demo", "/privacy", "/terms", "/controller"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact || ""),
      ),
    ).toEqual([]);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
  }

  await page.goto("/");
  await page
    .getByRole("link", { name: "Try it with sample data", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Guide creatures home together" }),
  ).toBeFocused();
  const tooSmall = await page.locator("button,a").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return (
          !!(element as HTMLElement).offsetParent &&
          (rect.width < 44 || rect.height < 44)
        );
      })
      .map((element) => (element as HTMLElement).innerText),
  );
  expect(tooSmall).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const canvas = await page.locator("canvas#game").boundingBox();
  expect(canvas).not.toBeNull();
  expect(canvas!.y).toBeLessThan(844);
  await expect(
    page.getByRole("link", { name: "Try it with sample data", exact: true }),
  ).toBeInViewport();
});
