# Review 3 — Guide creatures home together

## Verdict: PASS

**PASS.** Couch Creatures has **zero findings** at every severity and **zero untested public claims**.

- Reviewed: 2026-09-06 UTC
- Live URL: <https://couch-creatures.sociobot.in>
- Static implementation candidate: `189bf09db9b59631c5902b819fc9f4b3f16ebaab`
- Live relay implementation: `b91da00c4b99851377fb5465f58ad8a3fd90e553`
- Documentation baseline: `6a6d9b162d0811bceee8069ef9dddeb4629bd820`

The candidate differs from the documentation baseline because the three later commits are report-only. A fresh build of `189bf09` byte-matched live JavaScript, CSS, and artwork. `/api/health` reports the relay build above, SQLite storage, a 1,200-second room lifetime, eight creates per 60 seconds, and a 120-move buffer.

## Job, audience, and first action

Before scrolling, fresh 1280×720 desktop and 390×844 touch-phone sessions showed the game board itself. The page states the job, **Guide creatures home together**; the audience, families and friends sharing one device; and the first action, **Try it with sample data**, which opens the fixed populated sample. The same screen states no account or child profile, loaded shared-device play works without a network, and free with no ads or purchases.

Both sessions had the expected title, one h1, a visible canvas and first action, no console or page errors, and no phone horizontal overflow. Evidence: `/work/.evidence/couch-creatures-review3-desktop.png`, `/work/.evidence/couch-creatures-review3-phone.png`, and `/work/.evidence/couch-creatures-review3-verify/verify.json`.

## Game, demo, controls, and recovery

One click entered `/demo`, retaining **Demo — sample data, nothing is saved**. The sample contained creatures, four lanterns, moving storms, keyboard/touch controls, settings, and replay controls. Reset returned it to ready. Start for real removed only `demo:couch-creatures:*` keys while preserving real-run and assist values. Demo made no `/api` request and has no phone-room action.

The deterministic rescue replay reached the postcard at about 540 seconds with **6 of 12 creatures reached shelter**. **Play a new route** returned to habitat one, zero rescued, and zero elapsed. The storm replay reached loss, and retry kept the seed while resetting the route. Keyboard and touch operated all four lanes. Escape paused without advancing time, refresh restored active play paused, malformed saved data recovered safely, and assist widened reach, slowed storms, and persisted. The reduced-motion path retained pause feedback. Evidence includes `/work/.evidence/couch-creatures-review3-paused-phone.png` and the passing live outcome tests.

The independent phone client paired to a real room, selected a lantern, and moved it. Twenty concurrent moves were accepted; a move after the 120-entry buffer advanced the cursor; the room had a 20-minute expiry; and the ninth create returned 429 with positive `Retry-After`. A short submitted room code says **Enter the six-character room code**. An unknown valid-format code says **Could not join that room. Check the code and try again.**

## Claims and clean checkout

After `npm ci`, `npm audit --json` reported zero vulnerabilities and `npm run build` passed, producing `dist/` (49.52 kB raw JavaScript / 18.54 kB gzip; 8.88 kB raw CSS / 2.59 kB gzip). Every exact command declared in `.factory/claims.json` passed. The combined local browser run passed 17/17 and measured 60.34 fps at 390px under 4× CPU slowdown. The fresh live browser run passed 17/17; its independent frame-rate check measured 60.29 fps.

| Claim | Declared command | Result |
| --- | --- | --- |
| demo-isolated | `npm test -- --grep @claim:demo-isolated` | PASS |
| end-screen | `npm test -- --grep @claim:end-screen` | PASS |
| restart-resets | `npm test -- --grep @claim:restart-resets` | PASS |
| recovery | `npm test -- --grep @claim:recovery` | PASS |
| assist-mode | `npm test -- --grep @claim:assist-mode` | PASS |
| pause-control | `npm test -- --grep @claim:pause-control` | PASS |
| four-players | `npm test -- --grep @claim:four-players` | PASS |
| hazards-and-loss | `npm test -- --grep @claim:hazards-and-loss` | PASS |
| nine-minute-pace | `npm test -- --grep @claim:nine-minute-pace` | PASS |
| local-only | `npm test -- --grep @claim:local-only` | PASS |
| loaded-offline | `npm test -- --grep @claim:loaded-offline` | PASS |
| free-play | `npm test -- --grep @claim:free-play` | PASS |
| frame-rate | `npm test -- --grep @claim:frame-rate` | PASS |
| site-structure | `npm test -- --grep @claim:site-structure` | PASS |
| phone-room | `npm run test:phone-claim` | PASS |
| phone-data | `npm run test:unit -- --test-name-pattern='@claim:phone-data'` | PASS |

No visitor claim in the homepage, rendered routes, or README lacks a matching claim record and outcome test. No checkout, payment, advertising, account, or profile action is exposed.

## Accessibility, routes, privacy, and offline behavior

`/opt/fleet/lib/verify-url.sh` passed on the live root: HTTP 200, title, `lang=en`, one h1, main landmark, image alternatives, labelled buttons, and no browser errors. Repository Playwright Axe checks passed with zero serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`, `/controller`, and the HTTP 404 page. `npx @axe-core/cli` was attempted but could not start because the worker has no system Selenium Chrome binary; it did not test the site. The installed Playwright Chromium Axe integration is the successful accessibility evidence.

Keyboard focus, skip link, touch targets, route-h1 focus, legal pages, privacy wording, and reduced motion passed live checks. All public routes have route-specific metadata. `/`, `/demo`, `/privacy`, `/terms`, and `/controller` return 200. The designed unknown route returns the expected HTTP 404 with navigation, footer, metadata, and a way back; it is deliberate, not a defect. Loaded demo play continued after network loss. Offline reload and PWA installation are not promised.

## Earlier finding disposition

All earlier findings, including minor findings, were rechecked in current live behavior and tests.

| Earlier finding | Current disposition |
| --- | --- |
| CC-001 | Demo keys, reset, exit, and no-relay demo traffic pass `demo-isolated` and `local-only`. |
| CC-002 | Seeded rescue reaches a postcard and storm replay reaches loss. |
| CC-003 | Four keyboard/touch lanes and an independent real phone controller work. |
| CC-004 | Active saves restore paused; malformed saves are rejected safely. |
| CC-005 | All 16 public claims have and pass declared outcome tests. |
| CC-006 | Fresh 390px page has no horizontal overflow. |
| CC-007 | Skip/focus behavior and 44px controls pass live checks. |
| CC-008 | Clean-install audit has zero vulnerabilities. |
| CC-009 | Unknown live route is a complete, styled HTTP 404. |
| CC-010 | Candidate assets hash-match the live deployment. |
| CC2-001 | Seeded creatures and storms remain on board; replay is deterministic. |
| CC2-002 | The game canvas is visible on first desktop and phone screens. |
| CC2-003 | Same-origin product-owned phone rooms work with independent clients. |
| CC2-004 | Replays exercise collision, deadline, transition, and postcard rules. |
| CC2-005 | Snapshot validation discards malformed stored state safely. |
| CC2-006 | Styled 404 loads without CSP or browser errors. |
| CC2-007 | Reduced-motion keeps state feedback without motion failure. |
| CC2-008 | 404 and SPA routes have complete skeleton and metadata. |
| CC3-001 | First screen names job, audience, action, outcome, and facts. |
| CC3-002 | Eight creates succeed; ninth returns 429 with Retry-After. |
| CC3-003 | Twenty concurrent live moves are accepted and delivered. |
| CC3-004 | Post-buffer move advances the cursor and is delivered. |
| CC3-005 | A 180.1-second no-rescue state loses on resume. |
| CC3-006 | Deadline, phone, expiry, frame-rate, and public behavior have outcome coverage. |
| CC3-007 | The postcard reports the saved total out of 12. |
| CC3-008 | Health, version, and build endpoints identify the relay build. |
| CC3-009 | API headers and deliberate JSON 404 pass. |
| CC3-010 | Rendered copy remains covered by the current copy audit. |
| F-1-1 | Demo has no phone room or relay request. |
| F-1-2 | Live 404 has navigation, footer, styling, and route metadata. |
| F-1-3 | Social metadata updates for every public route. |
| F-1-4 | Assist, pause, privacy, reset, free-play, and relay-data claims are listed and tested. |
| F-1-5 | First screen and README use current plain task wording. |

## Findings

None.
