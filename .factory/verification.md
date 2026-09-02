# Independent verification — Couch Creatures

## Result: FAIL

- Candidate: `994b10c166bedb07ffdd44e775aeab048ff4bf84`
- Live URL: <https://couch-creatures.sociobot.in>
- Verified: 2026-09-02 UTC
- Work order: `couch-creatures-verify-1`

The deployed files match the candidate, and the game can be played to its
postcard ending. The release still fails the acceptance contract. The primary
sample action does not enter the isolated demo, the game has no loss condition
or advertised procedural hazards, it supports only two players, and a complete
keyboard run takes about 16 seconds rather than the advertised 8–12 minutes.

## Mandatory first-read test

PASS for wording and initial presentation.

- Cold desktop `/` says **Guide creatures home together**.
- The next sentence identifies families sharing one screen.
- **Try it with sample data** is visible and explains that it starts the
  three-habitat rescue.
- The first viewport includes a live rescue board, not a menu wall.
- At 390 × 844, the board, headline, audience sentence, and primary action are
  all visible in the first viewport. The action ends at y=816 px.

Evidence captured during the run:

- `/tmp/couch-first-read.png`, SHA-256 `4718a712455e9210d81c383674b01c2c4c2cd3cf5ebf8d6e8ef57ea68770c627`
- `/tmp/couch-mobile-first.png`, SHA-256 `b56baec523d290e0b1b50f93eef6e3450e33ac57d25556510431c6cbf2ac6d12`

The action itself fails the demo isolation contract; see CC-001.

## Claims gate

`.factory/claims.json` exists and contains five claims. As required, each exact
command was invoked before broader QA. In the untouched clone, all five first
invocations stopped before test collection because `@playwright/test` was not
installed. After the required clean install with `npm ci`, all five exact
commands passed:

| Claim | Exact command | Installed-checkout result |
| --- | --- | --- |
| `end-screen` | `npm test -- --grep @claim:end-screen` | PASS, 1 test |
| `restart-resets` | `npm test -- --grep @claim:restart-resets` | PASS, 1 test |
| `settings-persist` | `npm test -- --grep @claim:settings-persist` | PASS, 1 test |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS, 1 test |
| `shared-input` | `npm test -- --grep @claim:shared-input` | PASS, 1 test |

The tests pass mechanically but do not adequately prove the published claims:

- `end-screen` completes the run by pressing **Help herd creatures** 24 times,
  not by following the claimed shared-input path.
- `settings-persist` checks assist only, although the manifest claims assist
  and sound.
- `shared-input` does not assert that either input changes game state; it only
  checks unchanged status copy and canvas visibility.
- `local-only` opens `/demo` directly, so it misses the broken primary journey
  from `/` into `/demo`.
- Quantitative and functional claims such as 8–12 minutes, 2–4 players, changed
  weather/traits/routes, hazards, and 60 Hz are not listed in the manifest.

## Defects by severity

### Critical / release-blocking

#### CC-001 — The one-click sample action is not an isolated demo

From a fresh context, clicking **Try it with sample data** on `/` changed the
URL to `/demo` but showed no demo banner. Checking Assist and Mute wrote
`couch-creatures:assist` and `couch-creatures:mute`, not
`demo:couch-creatures:*`. Reloading the same URL then showed the demo banner and
both checkboxes became unchecked because reload recalculated demo mode and
switched storage namespaces.

Cause: `isDemo` is initialized once from the original URL and SPA navigation
does not update it (`src/main.ts:14`, `src/main.ts:28`, `src/main.ts:57`). This
violates the demo sandbox, README isolation promise, and the required primary
demo journey.

#### CC-002 — The required browser-game loop is incomplete

The only phases are `ready`, `playing`, `paused`, and `postcard`; there is no
loss or failure state. There are no hazards, hazard collisions, route choices,
or creature traits. The three habitats change labels and initial y positions,
but use the same board and rules (`src/main.ts:5`, `src/main.ts:7-10`,
`src/main.ts:88`, `src/main.ts:98-123`).

A deterministic keyboard-only run from the title action to the real postcard
completed in **15.81 seconds**. The end screen said “All 12 creatures are home”
and restart returned to habitat 1 with four creatures. This proves reachability,
but contradicts the advertised 8–12 minute session and does not supply the
required challenge or loss condition.

After restart, ready-state canvas data was byte-identical to the initial run:
SHA-256 `9bdb6d7955fe759e44d77993c79b16ba4e52c4e83c3b5660330826cda2b18a9d`.
The seed is always `moss-postcard`. Therefore “Every run changes the weather,
creature traits, and route markings” is false.

### High

#### CC-003 — The promised 2–4 player and phone-control scope is absent

README and metadata advertise 2–4 players, and the brief requires 2–4 players
with optional phone controls. The game exposes only player one A/D, player two
J/L, and four on-screen buttons for those same two players. There are no player
three/four controls, QR flow, room code, phone-controller route, or realtime
endpoint (`src/main.ts:59`, `src/main.ts:128-129`).

#### CC-004 — In-progress rescue state is lost on refresh

After advancing habitat 1 until three creatures remained, reload returned to
“Habitat 1 of 3: Drainway. 4 creatures still need shelter.” Only assist and mute
keys are persisted. This violates the game recovery requirement that progress
survive refresh.

#### CC-005 — Published claims are unlisted, false, or weakly tested

The landing page, README, design record, and metadata publish material claims
not represented in `.factory/claims.json`. The false claims include 8–12
minutes, 2–4 players, randomized weather/traits/routes, and 24 hazard layouts.
The claimed assist behavior is also wrong: assist lowers lantern speed from 160
to 118 while normal creature attraction stays 4.3; the help button moves
creatures farther under assist (`src/main.ts:97-108`). The mute setting has no
audio to mute.

This independently fails the “every claim is a test” acceptance gate even
though the five listed tests pass after installation.

### Medium

#### CC-006 — The landing artwork is severely distorted on mobile

At 390 px, the 1200 × 800 image renders at **358 × 800** instead of preserving
its aspect ratio. Lighthouse reports `image-aspect-ratio` score 0. The CSS sets
`width: 100%` without `height: auto` (`src/patch.css:1`). Evidence:
`/tmp/couch-mobile-world-viewport.png`.

#### CC-007 — Keyboard route focus and touch-target requirements fail

Axe reports no violations, and the skip link receives a visible 4 px focus
outline and moves focus to `<main>`. However, activating the Demo SPA link
leaves focus on `<body>`, not the new `<h1>`; the heading is not focusable even
though the code calls `focus()` (`src/main.ts:45`). Measured targets below the
44 px baseline include header links at 24–39 px high, footer links at 21 px,
and demo banner buttons at 32 px.

#### CC-008 — The development dependency set has known vulnerabilities

`npm audit` reports one high and one moderate vulnerability in Vite/esbuild,
including Vite development-server file-read advisories. `npm audit --omit=dev`
reports zero production vulnerabilities, so the deployed static bundle is not
directly exposed.

### Low

#### CC-009 — Unknown URLs return HTTP 200

`/not-a-route` renders the styled missing-route view but responds `200`, not
`404`. The navigation fallback intercepts the request before the configured 404
response override.

#### CC-010 — Static caching and metadata assets miss the documented baseline

- Hashed JS/CSS and the WebP all return `cache-control: public,
  must-revalidate, max-age=30`, not long-lived immutable caching.
- The Open Graph image is 1200 × 800 rather than 1200 × 630.
- `apple-touch-icon.png` is 180 × 120 rather than 180 × 180.

## Passing evidence

### Local checkout

- `npm ci`: PASS.
- `npm test`: PASS, 6/6 Playwright tests.
- `npm run build`: PASS, including TypeScript compilation; `dist/` produced.
- No lint script exists.
- Bundle: JS 15,030 B raw / 5.58 KB gzip; CSS 6,934 B raw / 2.18 KB
  gzip; world image 94,412 B. All are within budget.
- `npm audit --omit=dev`: zero production vulnerabilities.

### Live identity and deployment

The live HTML, JS, CSS, and world image are byte-identical to the fresh
candidate build:

| File | SHA-256 |
| --- | --- |
| `index.html` | `9579c8660856c14602a9df611151566f9632e8ca60769239ab7db15a43854496` |
| JS | `2b91d8944cf83dcf7ca36d09fcb4f1792a38edd590e1b5757f424c77ccc3b682` |
| CSS | `375e6e78f62dc4723cd6653c3fe64ecc5f589e01217eed5126a37876d1e76f5d` |
| `moss-rescue.webp` | `c1ed88eac90cd4390f66b0a5498b6e43209f9edf1a559fc1313c344426959f97` |

### Gameplay and platform checks

- Real keyboard play reached the postcard; **Play again** reset to habitat 1.
- A/D and J/L move both lanterns. On-screen player-two input keeps the board
  playable. Escape pauses and resumes.
- Direct `/demo` persists both Assist and Mute inside the demo namespace.
- Active gameplay measured **60.20 fps over 5.00 seconds** in a 390 px mobile
  context with 4× CPU throttling.
- The live page made no cross-origin requests during the complete run, restart,
  settings changes, and reload. No console errors, page errors, or HTTP errors
  were observed.
- Response headers include CSP with `frame-ancestors 'none'`, HSTS,
  `X-Content-Type-Options: nosniff`, and `Referrer-Policy`.
- Axe found zero serious/critical findings on `/`, `/demo`, `/privacy`,
  `/terms`, and the missing-route view at both 1440 px and 390 px.
- Each checked route has one `<h1>`, one `<main>`, a route-specific title, and
  labelled/alternative text for canvas and images.
- No horizontal overflow occurred at 390 px. The 64 × 58 game touch buttons
  meet the 44 px control minimum.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  96, SEO 100. A separate performance run measured FCP/LCP 1.714 s, CLS 0,
  TBT 25 ms, and total transfer 103,763 B.
- No service worker or manifest exists, so PWA/offline-update checks do not
  apply. There are no server-side product endpoints or sign-in flow, so API
  rate-limit and identity-provider checks do not apply.

## Required remediation before re-verification

1. Make every entry to `/demo`, including SPA navigation from the primary
   action, set demo mode and use only the demo namespace; add a journey test.
2. Complete the contracted game: meaningful hazards/challenge, a loss and
   recovery state, genuinely varying seeded runs, 2–4 player input, and the
   optional phone-controller path or an explicit approved scope change.
3. Make the advertised session length true and claim-tested, or correct the
   copy and brief deviation honestly.
4. Persist and restore an active run; make assist work as labelled; remove the
   inert sound setting until audio exists.
5. Add every public claim to the manifest and make each test assert the actual
   behavior through the primary demo entry point.
6. Correct the mobile image sizing, keyboard route focus, touch targets, 404
   status, immutable asset caching, metadata image sizes, and dev dependencies.
