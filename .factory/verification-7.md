# Verification 7 — Guide creatures home together

## Verdict: PASS

**PASS — 0 findings, 0 untested claims.**

- Work order: `couch-creatures-verify-7`
- Reviewed: 2026-09-06 UTC
- Live URL: <https://couch-creatures.sociobot.in>
- Static implementation candidate: `5f870be4914c166c5e74189859adf3bb4328dbf3`
- Documentation baseline: `9de3e8ab3eb932e24b6ff759676512dfc28bfa6d`
- Live phone relay implementation recorded by its health endpoint: `b91da00c4b99851377fb5465f58ad8a3fd90e553`

The implementation and documentation SHAs differ only because commits from the
static candidate through the reviewed baseline change factory documentation:
`.factory/design.md`, `.factory/handoff.md`, and `.factory/verification-6.md`.

## Job, audience, and first action

Fresh 1280×720 desktop and 390×844 touch-phone browsers showed the playable
canvas before scrolling. The job is **Guide creatures home together**. The
audience is families and friends sharing one device. The first action is
**Try it with sample data**; it says a fixed sample starts and demo changes
stay separate. The same first screen states no account or child profile,
loaded local play without a network, and free play without ads or purchases.
The phone had `scrollWidth` 390 at `innerWidth` 390 and no console errors.

Evidence: `live-desktop-first.png`, `live-phone-first.png`, and the passing
live `cold desktop and mobile screens` test under
`/work/.evidence/couch-creatures-verify-7/`.

## Demo and game run

One click opened `/demo`. Its persistent label was **Demo — sample data,
nothing is saved**. The populated board had four creatures, four lanterns,
three storms, eight labelled touch buttons, settings, and replay actions.
The actual seeded rescue reached a postcard saying **6 of 12 creatures reached
shelter** at `540.0166666665042` seconds. A separate actual storm replay
reached **The group needs another try** at `20.633333333333443` seconds with
three strikes. **Play a new route** returned the ready fixed seed
`moss-postcard-17`; isolation tests cover Reset demo and Start for real.

Evidence: `live-demo-populated.png`, `live-demo-win.png`,
`live-demo-loss.png`, and `live-demo-replay-state.png`.

## Claims

Clean setup used `npm ci` and `npm --prefix realtime ci`. All 20 exact
commands in `.factory/claims.json` passed. The phone-room command used the
live product. No claim was skipped or inferred from a manual check.

| Claim | Result |
| --- | --- |
| `demo-isolated` | PASS — `npm test -- --grep @claim:demo-isolated` |
| `fixed-demo-route` | PASS — `npm test -- --grep @claim:fixed-demo-route` |
| `end-screen` | PASS — `npm test -- --grep @claim:end-screen` |
| `restart-resets` | PASS — `npm test -- --grep @claim:restart-resets` |
| `recovery` | PASS — `npm test -- --grep @claim:recovery` |
| `assist-mode` | PASS — `npm test -- --grep @claim:assist-mode` |
| `pause-control` | PASS — `npm test -- --grep @claim:pause-control` |
| `four-players` | PASS — `npm test -- --grep @claim:four-players` |
| `touch-button-size` | PASS — `npm test -- --grep @claim:touch-button-size` |
| `hazards-and-loss` | PASS — `npm test -- --grep @claim:hazards-and-loss` |
| `nine-minute-pace` | PASS — `npm test -- --grep @claim:nine-minute-pace` |
| `local-only` | PASS — `npm test -- --grep @claim:local-only` |
| `shared-device-origin` | PASS — `npm test -- --grep @claim:shared-device-origin` |
| `loaded-offline` | PASS — `npm test -- --grep @claim:loaded-offline` |
| `free-play` | PASS — `npm test -- --grep @claim:free-play` |
| `privacy-categories` | PASS — `npm test -- --grep @claim:privacy-categories` |
| `frame-rate` | PASS — `npm test -- --grep @claim:frame-rate`; 60.18 fps local |
| `site-structure` | PASS — `npm test -- --grep @claim:site-structure` |
| `phone-room` | PASS — `npm run test:phone-claim` |
| `phone-data` | PASS — `npm run test:unit -- --test-name-pattern='@claim:phone-data'` |

The 21 browser cases that make up `npm test` and all five relay cases passed
in bounded commands because this worker ends a single terminal process at 30
seconds. Fresh live execution passed all 21 browser checks in groups: 20
claims plus the cold desktop/mobile test. The live frame-rate claim measured
**60.29 fps** at 390×844 under 4× CPU slowdown. The live room flow paired an
independent phone page, delivered concurrent moves, crossed the 120-move
buffer, checked 20-minute expiry, and got `429` with positive `Retry-After`
on the ninth creation. Relay tests cover SQLite restart persistence, room
isolation, expiry, and cleanup.

## Accessibility, routes, privacy, and performance

- `verify-url.sh` passed against HTTPS: 200, title, `lang=en`, one h1, main,
  image alternatives, labelled buttons, and no browser errors.
- Playwright Axe found zero serious or critical issues on `/`, `/demo`,
  `/privacy`, `/terms`, `/controller`, and the styled HTTP 404. Keyboard,
  skip/focus behavior, touch targets, and reduced motion passed.
- Each public route has its own metadata. The unknown URL is the intended
  complete styled HTTP 404 with navigation, footer, and a way back.
- Demo recording found no relay or cross-origin request. Shared-device play is
  same-origin. No personal-data input, permission request, account, profile,
  ad, checkout, or purchase action is exposed. Loaded local play works after a
  network drop; offline reload, installation, and updates are not promised.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.1 s, LCP 1.2 s, TBT 20 ms, CLS 0, transfer 115 KiB.
- `npm audit --json` found zero vulnerabilities. `npm run build` passed and
  produced `dist/` (18.57 kB gzip JavaScript, 2.59 kB gzip CSS).

## Candidate and live output

The live response is HTTPS 200 with the expected CSP and security headers.
Fresh `dist/` output exactly matches the deployed assets.

| Asset | SHA-256 | Match |
| --- | --- | --- |
| `index-DRZ73yyd.js` | `7e4b344f7d052221f990620b05f0a79091f5746fc0a9a6de6e0be65bbefaeb25` | yes |
| `index-sH0KsJcd.css` | `b5e6b4f0e147d50c16f0d9f55cf9590908f93dfe2f03ec20fd5845fb7af7412c` | yes |
| `moss-rescue.webp` | `c1ed88eac90cd4390f66b0a5498b6e43209f9edf1a559fc1313c344426959f97` | yes |

## Earlier findings

All earlier verification and review findings, including low and minor items,
were rechecked and are closed.

| Findings | Current disposition |
| --- | --- |
| `CC-001`–`CC-005` | Demo isolation, real win/loss, four local lanes plus phone input, paused refresh recovery, and exact outcome tests pass. |
| `CC-006`–`CC-010` | Phone layout, focus and targets, audit, true 404, cache, deployed hashes, and metadata assets pass. |
| `CC2-001`–`CC2-008` | Seeded entities, first-screen board, phone flow, normal rule paths, save validation, CSP-safe 404, reduced motion, and complete routes pass. |
| `CC3-001`–`CC3-010` | First-read wording, live allowance/concurrency/buffer/deadline, claim coverage, truthful postcard, relay identity, API headers, and copy audit pass. |
| `F-1-1`–`F-1-5` | Demo relay isolation, complete 404, route social metadata, material claim coverage, and plain first-screen/README wording pass. |
| `R4-001` | Demo replay, legacy snapshots, and **Play a new route** retain `moss-postcard-17`. |
| `R4-002` | Exact claims now cover 58px controls, named privacy categories, and shared-device request behavior. |
| `V6-001` | `.factory/design.md` says 58px, matching CSS, README, live controls, and `touch-button-size`. |

## Findings

None.

## Final result

**PASS — 0 findings, 0 untested claims.**

