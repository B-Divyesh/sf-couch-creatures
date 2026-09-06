# Review 4 — Guide creatures home together

## Verdict: FAIL

**FAIL.** The review found **2 findings** and **4 public claims without the
required declared claim coverage**. The game loop and all 16 declared claim
commands pass, but PASS requires zero findings and zero untested claims.

- Work order: `couch-creatures-review-4`
- Reviewed: 2026-09-06 UTC
- Live URL: <https://couch-creatures.sociobot.in>
- Static implementation candidate: `189bf09db9b59631c5902b819fc9f4b3f16ebaab`
- Live relay implementation: `b91da00c4b99851377fb5465f58ad8a3fd90e553`
- Documentation baseline reviewed: `208f55b4e7a5bfe97056d4783f10c209a6c6571e`

The implementation and documentation SHAs differ because the commits after
`189bf09` change reports, the copy audit, README wording, and relay tests, not
the shipped static product. A clean build byte-matched the live HTML,
JavaScript, CSS, and game artwork. The live health response reports relay build
`b91da00`, SQLite storage, a 1,200-second room lifetime, eight creates per 60
seconds, and a 120-move buffer.

## Job, audience, and first action

Before scrolling, fresh 1280×720 desktop and 390×844 touch-phone sessions show
the game board. The job is **Guide creatures home together**. The audience is
families and friends sharing one device. The first action is **Try it with
sample data**, followed by an explanation that it starts a fixed sample route
and keeps demo changes separate.

The same screen states no account or child profile, loaded play without a
network, and free play without ads or purchases. The canvas and sample action
fit in both first viewports. The phone has no horizontal overflow.

Evidence:

- `/work/.evidence/couch-creatures-review4-desktop.png`
- `/work/.evidence/couch-creatures-review4-phone.png`
- `/work/.evidence/couch-creatures-review4-verify/verify.json`

## Complete game runs

The home action entered `/demo` in one click. The persistent banner said
**Demo — sample data, nothing is saved**. The populated sample showed four
creatures, four lanterns, three moving hazards, eight touch controls, settings,
and replay actions.

Desktop and phone runs both reached the real postcard through the public
simulation. Each reported **6 of 12 creatures reached shelter** at
540.016 seconds. Both also reached the actual storm-loss screen. On desktop,
**Play a new route** reset phase, habitat, rescued count, and elapsed time.
Retry after loss reset the run and retained its current seed. Keyboard/touch
movement, Escape pause/resume, paused refresh recovery, malformed-save
recovery, assist behavior and persistence, the deadline boundary, and reduced
motion all passed.

Reset demo returned the sample to ready state and changed no real-storage
marker. Start for real removed every `demo:couch-creatures:*` key and preserved
the real marker. Demo play made no `/api` or cross-origin request.

Recorded evidence:

- `/work/.evidence/couch-creatures-review4-run.webm`
- `/work/.evidence/couch-creatures-review4-phone-run.webm`
- `/work/.evidence/couch-creatures-review4-win.png`
- `/work/.evidence/couch-creatures-review4-loss.png`
- `/work/.evidence/couch-creatures-review4-phone-win.png`
- `/work/.evidence/couch-creatures-review4-phone-loss.png`

## Findings

### Medium — R4-001: the demo stops being the promised fixed sample

The demo page and README call the demo a fixed sample route. A fresh demo uses
seed `moss-postcard-17`. After the sample reaches its postcard, **Play a new
route** calls `game.reset(makeSeed())`. The successful review run changed the
saved demo seed to `moss-1t3qk01` while the page still displayed **Fixed sample
route** and **See how the fixed sample can finish or fail**.

This makes the persistent demo label false after a normal end-screen action.
The `restart-resets` test checks phase, habitat, rescued count, and elapsed
time, but does not check the seed or the fixed-sample label. No claim entry
covers fixed-seed behavior.

Required disposition: keep the demo on `moss-postcard-17`, or clearly change
the label and public documentation after a new route. Add a declared claim test
that completes the sample, starts another route, and checks the stated result.

### Low — R4-002: three other public claims are missing exact claim tests

The manifest has one tagged test for each of its 16 entries, but it omits these
public statements:

1. README: **The game board also includes two 58px touch buttons for each
   player.** The four-player test proves movement, and the general route test
   proves a 44px minimum, but neither asserts 58px. The live buttons measured
   64×58 CSS pixels.
2. Privacy page: **Couch Creatures does not ask for names, accounts, photos,
   contacts, or location.** The free-play test covers account/profile UI, but
   no declared test covers the other named data or permission categories.
3. README: **Shared-device play makes no cross-origin requests.** The
   `local-only` claim and request recorder cover demo play only, not real
   shared-device play. The manual review saw no cross-origin request, but the
   statement is not enforced by its own declared sandbox test.

These claims were true in the observed live session, but the claims contract
requires them in `.factory/claims.json` with outcome tests that run on every
build. Together with the fixed-sample claim in R4-001, this leaves four public
claims without required coverage.

## Declared claims

Every exact command in `.factory/claims.json` was run after `npm ci` in a
detached clean worktree. All passed.

| Claim | Declared command | Result |
| --- | --- | --- |
| `demo-isolated` | `npm test -- --grep @claim:demo-isolated` | PASS |
| `end-screen` | `npm test -- --grep @claim:end-screen` | PASS |
| `restart-resets` | `npm test -- --grep @claim:restart-resets` | PASS |
| `recovery` | `npm test -- --grep @claim:recovery` | PASS |
| `assist-mode` | `npm test -- --grep @claim:assist-mode` | PASS |
| `pause-control` | `npm test -- --grep @claim:pause-control` | PASS |
| `four-players` | `npm test -- --grep @claim:four-players` | PASS |
| `hazards-and-loss` | `npm test -- --grep @claim:hazards-and-loss` | PASS |
| `nine-minute-pace` | `npm test -- --grep @claim:nine-minute-pace` | PASS |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS |
| `loaded-offline` | `npm test -- --grep @claim:loaded-offline` | PASS |
| `free-play` | `npm test -- --grep @claim:free-play` | PASS |
| `frame-rate` | `npm test -- --grep @claim:frame-rate` | PASS — 60.17 fps |
| `site-structure` | `npm test -- --grep @claim:site-structure` | PASS |
| `phone-room` | `npm run test:phone-claim` | PASS |
| `phone-data` | `npm run test:unit -- --test-name-pattern='@claim:phone-data'` | PASS |

Each declared claim tag occurs exactly once in the browser and relay test
sources. R4-001 and R4-002 explain the four claims missing from this table.

## Backend, limits, and recovery

The live room test used independent shared-game and phone pages. The phone
joined a real room, selected lantern three, and moved it. Twenty simultaneous
moves returned 202 and were delivered. The 121st move advanced the cursor after
the 120-entry buffer filled. Creations one through eight succeeded; creation
nine returned 429 with a positive `Retry-After`. Expiry metadata was within the
promised 20-minute window.

The five relay tests passed. They cover tenant room isolation, SQLite records,
one-way address hashing, move persistence after closing and reopening the
store, expiry at the 20-minute boundary, expired-row cleanup, and buffer
rollover. Production infrastructure was not restarted because this review is
report-only and repository rules prohibit infrastructure changes. Live health
and all live room operations remained available.

## Accessibility, privacy, routes, and performance

- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title, `lang=en`, one h1,
  main, image alternatives, labelled buttons, and no load errors.
- The installed Playwright Axe integration found zero serious or critical
  violations on `/`, `/demo`, `/privacy`, `/terms`, `/controller`, and the
  styled 404. The standalone Axe CLI was also attempted, but its downloaded
  ChromeDriver 152 did not match the supplied Chromium 145; the working
  Playwright integration is the accessibility result.
- Skip navigation, h1 focus after route changes, visible focus, keyboard and
  touch play, 44px targets, labels, live status, and reduced motion passed.
- `/`, `/demo`, `/privacy`, `/terms`, and `/controller` return 200 with their
  own titles and metadata. The designed missing route correctly returns HTTP
  404 with navigation, footer, metadata, and a way back. Expected 404 network
  lines from the invalid-room and missing-page checks are not defects.
- Invalid short and unknown room codes showed direct recovery instructions.
- Loaded local play continued after network loss. Offline reload, installation,
  and update behavior are not promised because this is not a PWA.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.1 s, LCP 1.2 s, TBT 10 ms, CLS 0, 115 KiB transferred.
- Live throttled 390×844 play measured 60.31 fps. The clean local run measured
  60.16 fps.
- `npm audit --json` reported zero vulnerabilities. `npm run build` produced
  `dist/`: 49.52 kB JavaScript (18.54 kB gzip), 8.88 kB CSS (2.59 kB gzip),
  and a 94,412-byte main illustration.
- Static security headers and immutable asset caching matched the included
  configuration. The social card is 1200×630 and the touch icon is 180×180.

## Earlier finding disposition

All 33 earlier findings were rechecked. They remain closed; R4-001 and R4-002
are new findings.

| Earlier findings | Current evidence |
| --- | --- |
| CC-001 to CC-005 | Demo namespaces, win/loss, four local lanes and phone input, refresh recovery, and all declared commands pass. |
| CC-006 to CC-010 | Phone layout, focus/targets, dependency audit, deliberate 404, caching, and metadata assets pass. |
| CC2-001 to CC2-008 | Seeded entities, first-screen game, independent phone clients, real simulation paths, save validation, CSP-safe 404, reduced motion, and route skeleton pass. |
| CC3-001 to CC3-010 | First-screen wording, live rate limit, concurrency, buffer rollover, deadline loss, postcard total, build identity, API headers, and copy audit pass. |
| F-1-1 to F-1-5 | Demo relay isolation, complete 404, route social metadata, earlier claim additions, and plain wording pass. |

## Quality-gate result

- `npm ci`: PASS
- `npm audit --json`: PASS, zero vulnerabilities
- All 16 exact claim commands: PASS
- `npm test`: PASS, 17/17
- `npm run test:unit`: PASS, 5/5
- `npm run test:live -- --reporter=list`: PASS, 17/17
- `npm run build`: PASS; `dist/` produced
- Final product verdict: **FAIL** because R4-001 and R4-002 remain open.
