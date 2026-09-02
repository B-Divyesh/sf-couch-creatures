# Independent verification 2 — Couch Creatures

## Result: FAIL

- Candidate: `3f44ffab81132d8e6a36f3cf7a524f61e9591f40`
- Live URL: <https://couch-creatures.sociobot.in>
- Verified: 2026-09-02 UTC
- Work order: `couch-creatures-verify-2`

The deployment is healthy and byte-for-byte matches the candidate, but the
browser game is not playable to completion. A precedence error in its seeded
random-number generator puts every creature and hazard far outside the canvas.
Normal play therefore has no visible creatures or storms, makes no rescue
progress, cannot lose, and cannot reach the postcard. The candidate also fails
the explicit capture rule because `/` shows a landing hero rather than the game.

## Mandatory claims gate

`.factory/claims.json` exists and lists eight claims. Per the work order, each
listed command was invoked before broader QA. In the untouched checkout those
first invocations stopped before collection because dependencies had not yet
been installed (`ERR_MODULE_NOT_FOUND: @playwright/test`). After the standard
clean setup, `npm ci`, every exact claim command collected and passed:

| Claim | Exact command | Result after clean install |
| --- | --- | --- |
| `demo-isolated` | `npm test -- --grep @claim:demo-isolated` | PASS, 1 test |
| `end-screen` | `npm test -- --grep @claim:end-screen` | PASS, 1 test |
| `restart-resets` | `npm test -- --grep @claim:restart-resets` | PASS, 1 test |
| `recovery` | `npm test -- --grep @claim:recovery` | PASS, 1 test |
| `four-players` | `npm test -- --grep @claim:four-players` | PASS, 1 test |
| `hazards-and-loss` | `npm test -- --grep @claim:hazards-and-loss` | PASS, 1 test |
| `nine-minute-pace` | `npm test -- --grep @claim:nine-minute-pace` | PASS, 1 test |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS, 1 test |

These green results do not establish the advertised game loop. The end and
restart tests set the private `couch-creatures:test-fast` session flag. In that
mode the implementation changes each 180-second habitat to 1.1 seconds and
hard-codes `ready = 2`, bypassing creature progress (`src/main.ts:14,35,46`).
The hazards/loss test injects a prebuilt `phase: "lost"` snapshot; it never
causes a collision. The pacing test checks only landing text and the initial
180-second counter. These tests can pass while public demo play is unwinnable.

## Mandatory first-read and first-capture test

Wording and demo access pass. Cold `/` says **Guide creatures home together**,
identifies families sharing one screen, explains that players guide creatures
through storms into shelter, and presents **Try it with sample data** with an
explanation of what starts. The action enters `/demo` in one click and shows the
required demo banner.

The browser-game capture requirement fails. At both 1440×900 and 390×844, the
first screen is a landing hero and static illustration. It does not show the
playable canvas. Evidence:

- `/tmp/couch-first-desktop.png`, SHA-256
  `c919eed24af76efbe5b7b4d5dd30766535ccc207b742bc3940abde48ac3edea5`
- `/tmp/couch-mobile-first.png`, SHA-256
  `0ce08b0c5741d76d4f5eec19814f7b49385c931a372f6427630b2fd6564a9170`

## Defects by severity

### Critical / release-blocking

#### CC2-001 — Normal gameplay can reach neither win nor loss

`rng()` shifts by the result of `0 / 4294967296` instead of converting the
unsigned integer and then dividing it (`src/main.ts:25`). It returns integers
rather than values in `[0,1)`. `setHabitat()` multiplies those integers into
canvas coordinates (`src/main.ts:40`).

Fresh live demo evidence for seed `moss-postcard-17`:

- Creature x positions were `211550023420`, `415865803180`,
  `1396539737520`, and `461853273960`; the board is only 600 units wide.
- The active canvas visibly contained four lanterns but no creatures or clay
  storms. Screenshot `/tmp/couch-live-active.png`, SHA-256
  `7335392cd247ea8fdafae3099c7f88020df957ee92ed265eed560b7db2acae65`.
- After 10.1 simulated seconds, progress remained `[0,0,0,0]` and strikes
  remained `0` despite exercising every keyboard lane and touch control.
- A boundary run restored at elapsed `541` seconds, resumed, and reached
  `542.03` seconds while still showing habitat 1, zero creatures ready,
  zero seconds remaining, no postcard, and no loss screen.

Because lantern x values are clamped to `42…558`, they can never approach the
off-board entities. The scripted public run therefore cannot reach the real end
screen, which is an explicit automatic failure for this work order. Seeded
traits also do not shuffle as advertised because the erroneous integer output
makes the trait modulo resolve to the same four-item order.

#### CC2-002 — The first captured screen is not the game

`/` renders headline, action, facts, and a static generated illustration. The
canvas exists only after navigation to `/demo`. This directly violates the
browser-game requirement that the captured first screen show the game rather
than a landing/menu wall.

### High

#### CC2-003 — The brief's optional-phone input mode is absent

The brief requires players to be able to scan a local QR code and use a phone
as a one-thumb controller. There is no QR flow, room code, realtime endpoint,
or separate phone-controller view. `/controller` instead explains that all
four touch pads remain on the shared game screen. This is an honest static
limitation, but it does not meet the accepted product scope. There are no
server endpoints, so request-allowance/429 testing is not applicable.

#### CC2-004 — Claim tests bypass the claimed behavior

The green end-screen/restart tests rely on a test-only shortcut that forces
readiness; the loss test injects an already-lost state; and the nine-minute test
does not run nine minutes. Public statements about moving hazards, rescue
completion, three-strike loss, shuffled traits, and a complete nine-minute run
are therefore not proven by their listed tests and are false in live normal
play. In test-only fast mode the postcard says **All creatures are home** after
recording only six protected creatures across habitats that each contain four.

### Medium

#### CC2-005 — A structurally invalid saved run breaks recovery

Invalid JSON is caught and starts a new run, but a valid JSON value with the
wrong shape is trusted. Loading `/demo` with `demo:couch-creatures:run = {}`
produced two page errors (`creatures.filter` and `creatures.forEach`) and an
empty status. Saved state needs schema validation and a clean-reset fallback.

#### CC2-006 — The true 404 page violates CSP and loses its design

`/not-a-route` correctly returns HTTP 404, but `public/404.html` contains an
inline `<style>` while the response allows only `style-src 'self'`. Chromium
logs a CSP error and renders an unstyled serif page. This violates the no-console
error gate and the required product-styled 404. Evidence:
`/tmp/couch-404.png`, SHA-256
`cacdf79adf8254a3abf4af555a68fc32008202e2739f84a5571a7328928dbc17`.

#### CC2-007 — Reduced-motion policy does not cover the canvas loop

The CSS disables CSS animation and transition timing, but the continuous
`requestAnimationFrame` simulation and canvas movement do not inspect
`prefers-reduced-motion`. This conflicts with `.factory/design.md`, which says
motion is removed under reduced motion. The media query was confirmed active
in the browser; it simply does not affect canvas rendering.

### Low

#### CC2-008 — Route metadata and skeleton have small gaps

`/controller` is a public navigation route but is omitted from `sitemap.xml`.
The standalone 404 also omits the standard header, footer, and skip link. The
canonical URL remains `/` on all SPA routes.

## Passing evidence

### Clean checkout and build

- Checkout was clean and exactly at the candidate commit.
- `npm ci`: PASS; 22 packages installed, zero audit findings.
- `npm test`: PASS, 9/9 Playwright tests.
- `npm run build`: PASS, including strict TypeScript compilation; `dist/`
  produced. No separate lint script exists.
- `npm audit --json`: zero vulnerabilities.
- Build sizes: JS 17,544 B raw / 6.67 kB gzip; CSS 6,818 B raw / 2.17 kB
  gzip; initial illustration 94,412 B. Lighthouse transferred 103 KiB.

### Candidate/deployment identity

The fresh build and live deployment are byte-identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `024d4dfc6121e9509b1de5e3407058102178c77c9328c0a008230fc612db5f0e` |
| `assets/index-D3mqBWpB.js` | `8c8e44dcd26e33b75dc565866827cfe8569b404792140e5ce67cde249fba68d9` |
| `assets/index-O3Ii99A_.css` | `7643a023a22c13ddffa39603395093b42e4ede58c388332f687eeff93d6498b0` |
| `moss-rescue.webp` | `c1ed88eac90cd4390f66b0a5498b6e43209f9edf1a559fc1313c344426959f97` |

The earlier deployment concern is not present. All documented routes respond,
and the live hashed files are the candidate artifacts.

### Privacy, security, caching, and routes

- A complete test-only demo-to-postcard/restart journey requested only `/`,
  the candidate JS/CSS, and `moss-rescue.webp`, all from the product origin.
  Normal play, settings, reload, and legal-route checks also made no
  cross-origin requests. There are no analytics, third-party scripts, runtime
  AI calls, accounts, or sign-in.
- Demo play wrote only `demo:couch-creatures:run` and
  `demo:couch-creatures:assist`. **Start for real** deleted demo keys; **Reset
  demo** cleared assist and recreated the fixed clean seed.
- Responses include HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive CSP
  with `frame-ancestors 'none'`.
- Hashed JS/CSS and static art return `Cache-Control: public,
  max-age=31536000, immutable`; HTML uses a 30-second revalidation policy.
- All navigation links resolve; `/not-a-route` returns HTTP 404.
- The product is static and is not a PWA. Service-worker update/offline tests,
  API rate limiting, persistence concurrency, health identity, and Entra sign-in
  checks do not apply.

### Accessibility, responsive behavior, and performance

- `/opt/fleet/lib/verify-url.sh` passes for live `/`: title, `lang`, one h1,
  main landmark, image alternatives, and no console errors.
- Axe found zero serious/critical findings on `/`, `/demo`, `/privacy`,
  `/terms`, and `/controller` at 1440×900 and 390×844.
- Each checked route has one `<h1>`, one `<main>`, a route-specific title, and
  no horizontal overflow. The landing image retains 3:2 proportions at 390 px.
- Keyboard focus starts on the visible skip link, moves to main, uses a visible
  4 px blue outline, and transfers to the route h1 on navigation/back. Native
  keyboard and touch buttons work. Lantern movement clamps correctly at 42 and
  558.
- Four advertised keyboard lanes and all four touch-control pairs change their
  lanterns. Escape pause/resume, assist persistence, demo isolation, and active
  run restore-as-paused work.
- Lighthouse 12.8.2 mobile: Performance 97, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 0.9 s, CLS 0, TBT 210 ms, 103 KiB transfer.
- Active `/demo` rendered 295 animation frames over 5.016 seconds at 390 px
  under 4× CPU throttling: 58.8 fps. This meets the practical 60 fps target,
  although the broken scene contains no visible creatures or hazards.

## Required remediation before acceptance

1. Correct and regression-test the seeded RNG using public demo gameplay. The
   scripted normal run must exercise visible hazards, reach a natural loss and
   retry, reach the real postcard, and reset cleanly without a readiness bypass.
2. Put the actual playable game in the first captured screen.
3. Implement the brief's QR/phone-controller path on a product-owned service,
   including its documented per-client allowance and 429/`Retry-After` test,
   or obtain an explicit scope change.
4. Replace shortcut/injected-state claim tests with observable public-flow
   tests, and cover every material claim.
5. Validate stored snapshots before restore; externalize 404 styles under CSP;
   cover canvas motion in reduced-motion mode; complete route metadata.
