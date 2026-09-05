# Review — shared creature rescue game

## Verdict: PASS

**PASS.** Couch Creatures has zero findings at every severity and zero untested public claims.

- Reviewed: 2026-09-05 UTC
- Live URL: <https://couch-creatures.sociobot.in>
- Static implementation: `189bf09db9b59631c5902b819fc9f4b3f16ebaab`
- Relay implementation: `b91da00c4b99851377fb5465f58ad8a3fd90e553`
- Documentation baseline: `c4dcc28a74b823e791b2dc52b7d75156bcc88246`

Fresh local-build SHA-256 values for JavaScript, CSS, and the illustration match the live files. `/api/health` reports the relay revision above, SQLite storage, 20-minute rooms, an eight-per-minute creation allowance, and a 120-move buffer.

## First screen, demo, and game run

Fresh desktop and 390×844 phone Chromium contexts showed the playable board before scrolling. The first screen states the job, “Guide creatures home together”; the audience, families and friends sharing one device; and the first action, “Try it with sample data,” including what happens next. It also shows the three plain facts about accounts, loaded-offline play, and price. Both contexts had no page or console errors and the phone layout had no horizontal overflow.

One click entered `/demo` with the persistent label “Demo — sample data, nothing is saved.” It showed a populated board, four lanterns, creatures, storms, keyboard/touch controls, settings, and replay controls. Reset starts the fixed sample again; Start for real removes only `demo:couch-creatures:*` keys and retains real-game storage. Demo has no phone-room action and makes no `/api` request.

The deterministic rescue reached **6 of 12 creatures reached shelter**. The storm replay reached **The group needs another try**. Fresh screenshots are `/work/.evidence/couch-creatures-review2-win.png` and `/work/.evidence/couch-creatures-review2-loss.png`.

## Claims and checks

After `npm ci`, every exact command declared in `.factory/claims.json` passed. Each exact `npm test -- --grep @claim:<id>` command passed for `demo-isolated`, `end-screen`, `restart-resets`, `recovery`, `assist-mode`, `pause-control`, `four-players`, `hazards-and-loss`, `nine-minute-pace`, `local-only`, `loaded-offline`, `free-play`, `frame-rate`, and `site-structure`. `npm run test:phone-claim` passed for `phone-room`; `npm run test:unit -- --test-name-pattern='@claim:phone-data'` passed and ran the named SQLite claim test.

`npm test` passed all 17 browser tests locally. The fresh live suite passed all 17; its final four tests were rerun separately and passed. Live active play measured 60.16 fps at 390×844 under 4× CPU slowdown. Outcome tests exercised normal play, malformed-save recovery, deadline/storm loss, pause/resume, refresh recovery, keyboard/touch input, assist persistence, loaded-offline continuation, independent phone pairing, concurrent moves, buffer rollover, expiry, and the 429/`Retry-After` boundary. A fresh invalid controller submission displayed “Enter the six-character room code.”

`npm audit --json` found zero vulnerabilities. `npm run build` passed and created `dist/` (49.52 kB JavaScript raw / 18.54 kB gzip; 8.88 kB CSS raw / 2.59 kB gzip). `/opt/fleet/lib/verify-url.sh` passed with HTTP 200, title, `lang=en`, one h1, main landmark, alternatives, labelled buttons, and zero browser errors.

The installed Playwright Axe integration found zero serious or critical issues on `/`, `/demo`, `/privacy`, `/terms`, `/controller`, and the 404. `npx @axe-core/cli` could not start because this worker image has no Selenium Chrome binary; this is an environment limitation, and the equivalent repository Axe integration passed on every route.

All public routes had distinct expected titles, description, canonical, Open Graph, and Twitter metadata. The skip link is keyboard reachable; SPA navigation focuses the destination h1. The styled unknown-route page correctly returned HTTP 404. The 404 self skip-link was the only HTTP 404 returned in the internal-link crawl and is intentional; every valid navigation link returned below HTTP 400. Reduced motion, 44px targets, legal pages, robots, sitemap, and headers were checked.

## Earlier finding disposition

Every earlier finding is closed and rechecked.

| Findings | Current disposition |
| --- | --- |
| CC-001 | Demo isolation: only demo keys change, reset/exit preserve real storage, and demo sends no relay request. |
| CC-002 | Public replay reaches the 540-second postcard and an actual storm loss. |
| CC-003 | Four keyboard/touch lanes and an independent paired phone controller work. |
| CC-004 | Valid active runs reload paused; malformed saves are discarded safely. |
| CC-005 | All 16 public claims have named outcome tests and their declared commands pass. |
| CC-006 | Illustration and game layout fit at 390px without horizontal overflow. |
| CC-007 | Skip link, visible focus, destination-h1 focus, and 44px targets pass. |
| CC-008 | `npm audit --json` reports zero vulnerabilities. |
| CC-009 | Unknown public routes return styled accessible HTTP 404 pages. |
| CC-010 | Live assets match, cache correctly, and include social/touch metadata assets. |
| CC2-001 | Seeded creatures/storms stay on board; public replay remains deterministic. |
| CC2-002 | The playable board is visible in fresh desktop and phone first screens. |
| CC2-003 | Same-origin product-owned phone rooms work with real independent clients. |
| CC2-004 | Replay uses actual collision, deadline, transition, and postcard rules. |
| CC2-005 | Snapshot schema validation rejects malformed stored state. |
| CC2-006 | CSP-compatible external 404 CSS loads without resource or console errors. |
| CC2-007 | Reduced motion removes game movement while preserving state feedback. |
| CC2-008 | 404 and SPA routes have complete structure, metadata, and links. |
| CC3-001 | Cold copy names job, audience, first action, outcome, and facts. |
| CC3-002 | Live creations one to eight succeed; ninth is 429 with positive Retry-After. |
| CC3-003 | Twenty concurrent live moves were accepted and delivered. |
| CC3-004 | A post-buffer move advances the cursor and is delivered. |
| CC3-005 | A 180.1-second no-rescue state loses immediately on resume. |
| CC3-006 | Deadline, phone, expiry, frame-rate, and public behavior claims have outcome tests. |
| CC3-007 | The postcard truthfully reports the saved total out of 12. |
| CC3-008 | Health, version, and build endpoints identify the live relay revision. |
| CC3-009 | API responses have no-store, CSP, HSTS, nosniff, and no-referrer headers. |
| CC3-010 | The copy audit matches the current rendered copy. |
| F-1-1 | Demo has no phone room and sends no relay request. |
| F-1-2 | Live 404 has complete navigation, footer, metadata, and styling. |
| F-1-3 | Open Graph and Twitter values change with each SPA route. |
| F-1-4 | Every material visitor claim is listed and outcome-tested. |
| F-1-5 | The seed label is absent and README headings use plain task language. |

## Findings

None.

## Known limitation

The game does not claim offline reload or PWA installation. It does claim, and passes, continuation after a completed page load loses its network.
