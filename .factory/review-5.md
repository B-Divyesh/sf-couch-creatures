# Review 5 — Guide creatures home together

## Verdict: PASS

**PASS — 0 findings, 0 untested claims.**

- Reviewed: 2026-09-06 UTC
- Live URL: <https://couch-creatures.sociobot.in>
- Static implementation candidate: `5f870be4914c166c5e74189859adf3bb4328dbf3`
- Documentation baseline: `9cfb02e0ef147da78095ae32f31630a54934adcf`
- Live phone-room relay: `b91da00c4b99851377fb5465f58ad8a3fd90e553`

The documentation commits after the static candidate change factory records and the touch-control design value only. A clean local build and the deployed JavaScript, CSS, and illustration have matching SHA-256 values.

## Job, audience, and first action

The job is **Guide creatures home together**. The audience is families and friends sharing one device. The first action is **Try it with sample data**.

Fresh 1280×720 desktop and 390×844 touch-phone contexts showed the playable canvas before scrolling. The first screen names the job, audience, and action, then says the fixed sample starts separately. It also states no account or child profile, loaded shared-device play after a network drop, and free play without ads or purchases. The phone had `scrollWidth` 390 at an `innerWidth` of 390. Both contexts had zero console or page errors.

Evidence: `/work/.evidence/couch-creatures-review-5/live-desktop-first.png` and `live-phone-first.png`.

## Demo and game run

One click opened `/demo` with the persistent **Demo — sample data, nothing is saved** label. The populated board showed four creatures, four lanterns, three storms, eight labelled touch buttons, settings, and replay controls. The demo made no `/api` or cross-origin request.

The deterministic rescue reached **6 of 12 creatures reached shelter** at `540.0166666665042` seconds. The postcard says that the group sheltered six creatures. **Play a new route** returned ready habitat one with zero rescued, zero elapsed, and `moss-postcard-17`. The storm replay reached **The group needs another try** after three strikes at `20.633333333333443` seconds. Reset demo returned the same fixed ready route.

Evidence: `live-demo-populated.png`, `live-demo-win.png`, and `live-demo-loss.png` in `/work/.evidence/couch-creatures-review-5/`.

## Declared claims

Clean setup used `npm ci` and `npm --prefix realtime ci`. Every exact command declared by the 20 entries in `.factory/claims.json` passed. This includes all 18 browser claim commands, `npm run test:phone-claim`, and the named SQLite privacy/cleanup command. `npm run test:live -- --reporter=list` then passed all 21 live browser checks; its saved result is `passed` with no failed tests.

The live phone-room test used independent shared-screen and controller pages, paired a real room, delivered concurrent moves, crossed the 120-move buffer, checked the 20-minute boundary, and received `429` with positive `Retry-After` on the ninth creation. Local relay tests cover SQLite restart persistence, room isolation, expiry, and cleanup. The live health endpoint reports SQLite, a 1,200-second room lifetime, an eight-per-minute allowance, a 120-move buffer, and the relay SHA above.

The active-play frame-rate claim passed at **60.11 fps** at 390×844 under 4× CPU slowdown, exceeding its 55 fps threshold.

## Accessibility, routes, privacy, and build

- `/opt/fleet/lib/verify-url.sh` passed against HTTPS: HTTP 200, title, `lang=en`, one h1, main landmark, image alternatives, labelled buttons, and no errors.
- The repository Playwright Axe integration passed on `/`, `/demo`, `/privacy`, `/terms`, `/controller`, and the designed HTTP 404 with zero serious or critical violations. The standalone Axe CLI was also attempted after installing the documented Playwright Chromium prerequisite, but its Selenium driver exited before scanning; this is a worker-tool limitation, not evidence used for the verdict.
- Every valid public route returned 200 with its own title, h1, main landmark, and skip link. An unknown route returned the intended complete styled HTTP 404 with status 404, navigation, footer, and a way back. All crawled navigation links returned 200. An invalid phone room code reports **Enter the six-character room code.**
- Demo traffic was same-origin with no phone-room request. No account, profile, personal-data request, permission request, ad, checkout, or purchase action was found. The game promises loaded offline continuation, not offline reload or updates.
- `npm run build` passed and produced `dist/`: 49.60 kB JavaScript raw / 18.57 kB gzip and 8.88 kB CSS raw / 2.59 kB gzip. `npm audit --json` reported zero vulnerabilities. The deployed assets match this build:

| Asset | SHA-256 |
| --- | --- |
| `index-DRZ73yyd.js` | `7e4b344f7d052221f990620b05f0a79091f5746fc0a9a6de6e0be65bbefaeb25` |
| `index-sH0KsJcd.css` | `b5e6b4f0e147d50c16f0d9f55cf9590908f93dfe2f03ec20fd5845fb7af7412c` |
| `moss-rescue.webp` | `c1ed88eac90cd4390f66b0a5498b6e43209f9edf1a559fc1313c344426959f97` |

## Earlier findings

All earlier review and verification findings, including minor and low items, remain closed.

| Finding group | Current disposition and evidence |
| --- | --- |
| `CC-001`–`CC-005` | Demo isolation/reset, real win and loss, four local lanes plus phone input, paused refresh recovery, and exact claim coverage pass. |
| `CC-006`–`CC-010` | The phone has no overflow; focus and touch targets pass; audit is clean; the 404 is deliberate and complete; assets, cache, and metadata pass. |
| `CC2-001`–`CC2-008` | Seeded board entities, first-screen game, independent phone flow, normal rule paths, snapshot validation, CSP-safe 404, reduced motion, and complete route structure pass. |
| `CC3-001`–`CC3-010` | First-read copy, live allowance, concurrent moves, buffer rollover, deadline loss, claim coverage, truthful postcard, relay identity, API headers, and copy audit pass. |
| `F-1-1`–`F-1-5` | Demo has no relay action; 404 and per-route social metadata are complete; material claims are declared and tested; first-screen and README wording stay plain. |
| `R4-001`–`R4-002` | Demo replay and restart retain `moss-postcard-17`; exact claims cover the 58px controls, named privacy categories, and shared-device request behavior. |
| `V6-001` | Design record, CSS, README, live controls, and the touch-button claim all agree on 58px. |

## Evidence note

`.factory/verification-7.md` was read in full. The assigned `factory-evidence/couch-creatures-verify-7/qa-report.md` path was absent in this worker, so this review did not rely on it; all results above were reproduced from the clean checkout and fresh live sessions.

## Findings

None.

## Final result

**PASS — 0 findings, 0 untested claims.**
