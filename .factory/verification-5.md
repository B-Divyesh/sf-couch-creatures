# Verification 5 — shared creature rescue game

## Verdict: PASS

**PASS.** There are zero findings at every severity and zero untested public
claims.

- Work order: `couch-creatures-verify-5`
- Verified: 2026-09-05 UTC
- Live URL: <https://couch-creatures.sociobot.in>
- Static implementation reviewed: `189bf09db9b59631c5902b819fc9f4b3f16ebaab`
- Relay implementation reviewed: `b91da00c4b99851377fb5465f58ad8a3fd90e553`
- Documentation baseline reviewed: `fb42b0a4bebab9279029f64273d18e55baba3ea8`

The documentation commit differs from the static implementation. Its product
source change is the static commit above; the later commit records repair-four
evidence. The live HTML, hashed JavaScript, CSS, and `moss-rescue.webp` match a
fresh local build of `189bf09` byte for byte. The live health endpoint reports
the relay SHA above, SQLite storage, a 1,200-second room TTL, an eight-per-60
second create allowance, and a 120-move buffer.

## First screen

Fresh desktop (1280×720) and phone (390×844) browser contexts both showed the
actual rescue board on the first screen. Before scrolling, the page states the
job, **Guide creatures home together**; the audience, families and friends
sharing one device; and the first action, **Try it with sample data**. It also
states what clicking does and shows the three facts: no account or child
profile, loaded play continues without a network, and free with no ads or
purchases. The phone page has no horizontal overflow and no console errors.

Evidence: `/work/.evidence/couch-creatures-v5-desktop.png`,
`/work/.evidence/couch-creatures-v5-phone.png`, and
`/work/.evidence/couch-creatures-v5-verify/verify.json`.

## Demo and complete game run

One click from the home page entered `/demo` with the persistent label
**Demo — sample data, nothing is saved**. The sample board contains four
lanterns, four creatures, hazards, controls, settings, and the replay controls;
it is populated game output rather than a blank example.

The deterministic sample rescue reached **6 of 12 creatures reached shelter**.
**Play a new route** returned it to ready, habitat 1, zero rescued, and zero
elapsed. The storm replay reached **The group needs another try**. Leaving
demo removed every `demo:couch-creatures:*` key while the pre-existing real
assist value and real storage marker remained unchanged. The demo path made no
room-relay request; phone rooms are explicitly unavailable there.

Evidence: the live `@claim:end-screen`, `@claim:restart-resets`,
`@claim:hazards-and-loss`, `@claim:demo-isolated`, and `@claim:local-only`
tests; `/work/.evidence/couch-creatures-v5-win.png`,
`/work/.evidence/couch-creatures-v5-loss.png`, and
`/work/.evidence/couch-creatures-v5-win-card.png`.

## Claims gate

All 16 declared claim commands were run after `npm ci`; all passed. The listed
test is the exact command from `.factory/claims.json`.

| Claim | Result |
| --- | --- |
| `demo-isolated` | PASS — `npm test -- --grep @claim:demo-isolated` |
| `end-screen` | PASS — `npm test -- --grep @claim:end-screen` |
| `restart-resets` | PASS — `npm test -- --grep @claim:restart-resets` |
| `recovery` | PASS — `npm test -- --grep @claim:recovery` |
| `assist-mode` | PASS — `npm test -- --grep @claim:assist-mode` |
| `pause-control` | PASS — `npm test -- --grep @claim:pause-control` |
| `four-players` | PASS — `npm test -- --grep @claim:four-players` |
| `hazards-and-loss` | PASS — `npm test -- --grep @claim:hazards-and-loss` |
| `nine-minute-pace` | PASS — `npm test -- --grep @claim:nine-minute-pace` |
| `local-only` | PASS — `npm test -- --grep @claim:local-only` |
| `loaded-offline` | PASS — `npm test -- --grep @claim:loaded-offline` |
| `free-play` | PASS — `npm test -- --grep @claim:free-play` |
| `frame-rate` | PASS — `npm test -- --grep @claim:frame-rate`; 60.15 fps locally |
| `site-structure` | PASS — `npm test -- --grep @claim:site-structure` |
| `phone-room` | PASS — `npm run test:phone-claim` |
| `phone-data` | PASS — `npm run test:unit -- --test-name-pattern='@claim:phone-data'` |

No additional public, testable claim was found in the rendered routes, README,
or first-screen facts without a matching claim record. The copy audit remains
current: plain wording, no sentence over 22 words, and consistent terminology.

## Local checks

- `npm ci`: PASS; 57 packages installed.
- `npm audit --json`: PASS; zero vulnerabilities.
- Claim commands: PASS, as listed above.
- Local browser claim coverage: every local browser claim command above passed;
  the local frame-rate measurement was 60.15 fps under 4× CPU slowdown at
  390×844.
- Relay tests: PASS, 5/5. These include room isolation, persistence across a
  store restart, expiry cleanup, and the 120-move boundary.
- `npm run build`: PASS; `dist/` produced. JavaScript is 49.52 kB raw / 18.54
  kB gzip and CSS is 8.88 kB raw / 2.59 kB gzip.

## Live checks

- Live browser suite: all 17 test cases passed. The first 13 completed through
  the published `test:live` script; the remaining four (frame rate, seeded
  board, site structure, and cold desktop/mobile accessibility) passed in the
  same live Playwright configuration. The live frame-rate result was 60.22 fps.
- The phone-room test used independent shared-screen and phone pages, delivered
  20 concurrent moves, crossed the 120-move buffer, confirmed ordered delivery,
  verified 20-minute expiry metadata, and saw the ninth creation return HTTP
  429 with a positive `Retry-After` value.
- The live API health request returned HTTP 200 with `no-store`, HSTS,
  `default-src 'none'`, `nosniff`, and `no-referrer`. API unknown-route handling
  is deliberate JSON HTTP 404, not a defect.
- The controller rejects an invalid room code with **Enter the six-character
  room code.** Recovery, deadline loss, pause/resume, refresh recovery, assist
  persistence, keyboard/touch controls, offline-after-load play, and reset were
  exercised by their outcome tests.
- `/`, `/demo`, `/privacy`, `/terms`, and `/controller` have their own titles,
  descriptions, canonical URLs, Open Graph, and Twitter metadata. An unknown
  public URL returns the styled complete HTTP 404 page. This expected 404 is
  not a finding.
- `/opt/fleet/lib/verify-url.sh` passed with HTTP 200, `lang=en`, exactly one
  h1, a main landmark, image alternatives, labelled buttons, and zero page or
  console errors. Playwright axe found zero serious or critical issues on all
  five public routes and the 404. Visible interactive targets met the 44px
  check, route navigation focuses the h1, and reduced motion is covered by the
  live suite.

## Earlier findings

Every earlier finding is closed and was rechecked:

| Earlier findings | Current disposition |
| --- | --- |
| CC-001 to CC-005 | Demo is isolated; the game has win/loss, four local controls and phone input, refresh recovery, and outcome-tested claims. |
| CC-006 to CC-010 | Mobile art/overflow, focus/target size, dependency audit, deliberate 404, metadata, and cache/assets all pass. |
| CC2-001 to CC2-008 | Natural replay outcomes, first-screen game board, phone flow, real claim paths, validated saves, CSP-safe 404, reduced motion, and route skeleton pass. |
| CC3-001 to CC3-010 | First-read copy, live relay allowance/concurrency/buffer/deadline, postcard total, health/build API, API headers, and copy audit pass. |
| F-1-1 to F-1-5 | Demo has no phone room or relay traffic; 404 skeleton and metadata are complete; social metadata updates; all material claims are listed/tested; wording and README headings are plain. |

## Findings

None.

## Known limitations

The game does not claim offline reload and is not a PWA. It does claim, and
passes, continuing play after a completed page load loses its network.
