# Independent verification 3 — Couch Creatures

## Result: FAIL

- Candidate: `c6280246d563b8d450e1da32da77af1b38bc2fd3`
- Live URL: <https://couch-creatures.sociobot.in>
- Verified: 2026-09-02 UTC
- Work order: `couch-creatures-verify-3`

The candidate is substantially improved and the deterministic public replay now
reaches both a real loss and the postcard. The static deployment is
byte-for-byte identical to the candidate. It still fails the release contract:
the cold first screen does not identify the audience or provide the required
plain **Try it with sample data** action, and the deployed room API does not
enforce its documented eight-room allowance. The phone relay also loses valid
concurrent moves and stops forwarding after its 120-move buffer fills.

## Mandatory claims gate

`.factory/claims.json` exists and lists nine claims. The first pre-install
invocation could not collect because a clean clone had no `@playwright/test`
package. After the required `npm ci`, every exact command from the manifest was
run and passed:

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-isolated` | `npm test -- --grep @claim:demo-isolated` | PASS, 1 test |
| `end-screen` | `npm test -- --grep @claim:end-screen` | PASS, 1 test |
| `restart-resets` | `npm test -- --grep @claim:restart-resets` | PASS, 1 test |
| `recovery` | `npm test -- --grep @claim:recovery` | PASS, 1 test |
| `four-players` | `npm test -- --grep @claim:four-players` | PASS, 1 test |
| `hazards-and-loss` | `npm test -- --grep @claim:hazards-and-loss` | PASS, 1 test |
| `nine-minute-pace` | `npm test -- --grep @claim:nine-minute-pace` | PASS, 1 test |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS, 1 test |
| `phone-room` | `npm test -- --grep @claim:phone-room` | PASS, 1 test |

The green claim suite does not prove two deployed promises. The phone-room test
imports the local handler rather than exercising the live product, where the
rate limit fails. The pace test checks copy and the initial `180` counter but
does not check the deadline boundary, where play can continue indefinitely.

## Mandatory first-read test

**FAIL.** The captured screen does show the actual playable board, not a menu
wall. A cold visitor sees:

- what it does: **Guide creatures home together** and the active habitat state;
- for whom: not stated in the first screen (the family/shared-screen audience is
  absent; a 2–4-player sentence appears only in the footer);
- what to do first: the canvas says **Press a player key to begin**;
- sample path: only a navigation link labeled **Demo**. There is no visible
  **Try it with sample data** action or adjacent explanation;
- facts: the required privacy/offline/price facts are absent.

This fails the explicit automatic gate even though `/demo` itself is one click
away and correctly shows the isolated-demo banner.

Evidence:

- `test-results/independent-qa/live-first-read-desktop.png`, SHA-256
  `0c8035cbbc7ec334ab7b8cdd350920bb6a682e3e9118efd63455f4085883652d`
- `test-results/independent-qa/live-first-read-mobile.png`, SHA-256
  `47ffabaa0dc2988ef7074310b993b36a75a4c9d644d488d642f368f33b47977b`

## Defects by severity

### Critical / release-blocking

#### CC3-001 — The cold first screen fails the required audience and demo wording

At both 1440×900 and 390×844, the game is visible and usable, but the screen
does not say it is for families or 2–4 people sharing one device. It also has
no action named **Try it with sample data** and no explanation of what the demo
does. The bare **Demo** nav link is insufficient under the acceptance contract.

#### CC3-002 — Production does not enforce the documented room allowance

From one client, nine consecutive live `POST /api/rooms` requests all returned
`201`. The ninth response had no `Retry-After` header. The documented allowance
is eight room creations per minute per client, after which the API must return
`429`.

The local claim test passes because it imports a single in-memory Node module
and supplies a fixed synthetic IP. That is not representative of the deployed
serverless execution boundary. This is both a security/resource-control defect
and a false public claim.

### High

#### CC3-003 — The live phone relay loses valid concurrent moves

A fresh live room received 20 simultaneous, valid move requests from one
client. Eighteen returned `202`; two returned `404 Room not found or expired`.
The following read returned only those 18 moves. This indicates room state is
split across ephemeral function instances rather than stored in a shared,
room-consistent boundary. A controller can therefore lose input during normal
multi-device play.

#### CC3-004 — Phone input permanently stalls after 120 accepted moves

In a fresh live room, 120 sequential moves returned `202`; reading from cursor
zero returned `cursor: 120` and 120 moves. The 121st move also returned `202`,
but reading with `after=120` returned `cursor: 120` and no moves. The array is
trimmed to length 120 and that length is also used as the cursor, so the cursor
never advances once the buffer is full. A nine-minute phone player can easily
cross this boundary and then all later button presses vanish.

#### CC3-005 — Missing the shelter deadline can make a run endless

A valid restored run at elapsed `180.1` seconds with zero creatures ready was
resumed. At elapsed `181.12`, it was still `playing` in habitat one and still
displayed **0 seconds remain**. There was no loss, transition, or recovery
prompt. The transition requires both elapsed time and two ready creatures, but
there is no consequence for missing the stated three-minute window. This
contradicts the advertised nine-minute/full-run pacing and the 8–12 minute brief.

#### CC3-006 — Claim coverage does not match deployed or published behavior

- `@claim:phone-room` tests a local function import, not the live endpoint, and
  passes while the production allowance is false.
- `@claim:nine-minute-pace` asserts only copy and the starting counter, so it
  misses the endless zero-second state.
- The public 20-minute room-expiry promise has no corresponding manifest claim
  or boundary test.
- The required measured frame-rate claim is absent from the manifest.

This violates the “every claim is a test” acceptance rule even though all
listed commands pass mechanically.

### Medium

#### CC3-007 — The postcard says everyone is home when three creatures were left

The deterministic public rescue reached `phase: postcard` after 540.02
simulated seconds with `rescued: 9`. Each of the three habitats starts with four
creatures, for 12 total, but the end screen says **All creatures are home**.
The win threshold is only two creatures per habitat. The summary therefore
overstates the actual result.

#### CC3-008 — The API has no health or build-identity endpoint

`/api/health`, `/api/version`, and `/api/build` all return `404`. Static assets
can be matched exactly to the candidate, but the deployed function revision
cannot be independently tied to the tested commit. This also obscures the
production-only state/rate-limit behavior.

### Low

#### CC3-009 — API error responses omit the site response-header baseline

An API `404` is labeled `text/plain; charset=utf-8` despite containing JSON and
includes only HSTS. It omits the site's CSP, `X-Content-Type-Options`, and
`Referrer-Policy` headers. Static documents and assets do include those headers.

#### CC3-010 — The landing copy audit is stale

`.factory/copy-audit.md` lists an audience sentence, **Try it with sample
data**, its explanation, and three facts as landing copy. None appears on the
current root first screen. The audit therefore does not describe this
candidate's landing experience.

## Gameplay evidence

The deterministic scripted flow was run against the live site:

1. Cold `/` opened the ready overlay and live board.
2. `/demo` showed the isolated banner and seeded route.
3. **Watch storm loss** ran normal fixed steps to `strikes: 3` and the real loss
   screen. **Try this route again** reset phase, strikes, and elapsed while
   retaining seed `moss-postcard-17`.
4. **Watch sample rescue** ran the same fixed-step rules to the real postcard:
   habitat 3, elapsed `540.0167`, nine protected creatures.
5. **Play a new route** returned to ready/habitat 1 with zero rescued, zero
   elapsed, and a new seed.

Additional passing behavior:

- A/D, J/L, F/H, and Left/Right changed all four lanterns; all four touch pairs
  also changed their matching lanterns.
- Movement clamped at board positions 42 and 558.
- Escape paused and resumed.
- Assist persisted in `demo:couch-creatures:*`; active play reloaded as paused.
- A malformed `{}` snapshot recovered to a valid four-creature run without a
  page error.
- A normally created phone room, controller join, lantern selection, and move
  changed lantern three from 370 to 342.
- A three-character room code produced a useful validation message; a missing
  six-character room produced a useful recovery message.
- Reduced-motion mode kept creature positions fixed during active simulation.
- Active play rendered 301 frames in 5.0066 seconds at 390 px with 4× CPU
  throttling: **60.12 fps**.

## Local quality gates

- Clean candidate commit confirmed before changes.
- `npm ci`: PASS; 53 packages installed, zero audit findings.
- `npm test`: PASS, 11/11 Playwright tests.
- `npm run build`: PASS; includes `tsc -b` and creates `dist/`.
- No separate lint script exists.
- `npm audit --json`: zero vulnerabilities.
- Initial JS: 47,297 B raw / 17.87 KB gzip.
- CSS: 8,119 B raw / 2.43 KB gzip.
- Initial illustration: 94,412 B.

## Accessibility, privacy, performance, and platform evidence

- `/opt/fleet/lib/verify-url.sh` passes the live root: status 200, title, `lang`,
  one h1, main landmark, image alternatives, and no console errors.
- Axe found zero serious/critical findings on `/`, `/demo`, `/privacy`,
  `/terms`, `/controller`, and the 404 at desktop size; the five valid routes
  also passed at 390×844.
- All valid routes have one h1, one main landmark, route-specific titles, no
  horizontal overflow, and no console/page errors.
- Keyboard focus starts on the visible skip link with a 4 px outline, moves to
  main, and moves to the new h1 after SPA navigation. The assist checkbox has a
  358×51 px clickable label at mobile size.
- The complete game/settings/phone-room journey made requests only to
  `https://couch-creatures.sociobot.in`; no analytics, third-party scripts,
  cross-origin calls, account, or sign-in flow was observed.
- Static responses include a restrictive CSP with `frame-ancestors 'none'`,
  HSTS, `nosniff`, and strict-origin referrer policy.
- Hashed JS/CSS and art use one-year immutable caching. HTML uses 30-second
  revalidation. The real 404 returns HTTP 404.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 1.2 s, TBT 70 ms, CLS 0, 114 KiB transferred.
- Social card is 1200×630 and the touch icon is 180×180.
- This is not a PWA and has no service worker, so offline/update checks do not
  apply. It has no sign-in, so Entra identity checks do not apply.

## Candidate/deployment identity

Fresh production-build files and live files are byte-identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `7d71b3df9f7d84f1054bf1b67183fc3c48df54848d9a6eea3287b48605b57d71` |
| `assets/index-TZ6PFdQt.js` | `bbfde1fc59f75e5d5214257c47760c6c533058ee8cc87b3de9529992078d0b9b` |
| `assets/index-mLAlU21u.css` | `9dc4464454739229ee1905b26e91dee300e812dc0f7619a62a35aa72fad6a87c` |
| `moss-rescue.webp` | `c1ed88eac90cd4390f66b0a5498b6e43209f9edf1a559fc1313c344426959f97` |

The documented routes resolve, the sitemap includes all five public routes,
and unknown routes return the styled 404. The API response shapes match the
candidate handlers, but no build-identity endpoint exists and deployed
state/rate behavior is not equivalent to the local single-process claim test.

## Required remediation before re-verification

1. Restore the plain first-screen audience sentence, three facts, and a visible
   **Try it with sample data** action with an adjacent outcome explanation while
   keeping the game itself visible.
2. Move room and rate-limit state to a concurrency-safe, shared product store;
   enforce eight creates per minute for a real client and return `429` plus
   `Retry-After` on the ninth.
3. Use a monotonic move cursor so trimming old moves never stops new delivery;
   prove concurrent moves are not lost.
4. Define and enforce the shelter-window failure/recovery behavior so a run is
   actually bounded to the promised duration.
5. Make postcard wording agree with the rescued count, and replace local/copy
   claim checks with deployed observable tests for all public promises.
6. Add a backend health/build identity and align API content/security headers.
