# Independent verification 4 — Couch Creatures

## Result: PASS

- Candidate: `51f4841eea756d3a270da9efc5edca6373a521c6`
- Live URL: <https://couch-creatures.sociobot.in>
- Verified: 2026-09-02 UTC
- Work order: `couch-creatures-verify-4`

The deployed static files are byte-identical to a clean production build of
the candidate. The live room relay reports build
`51f4841eea756d3a270da9efc5edca6373a521c6`; its observable TTL, creation
allowance, and move-buffer settings match the tested source. No release-
blocking defects were found.

## Mandatory claims gate

`.factory/claims.json` is present with 12 claims. All exact commands pass from
the demo entry point after `npm ci`:

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
| `loaded-offline` | `npm test -- --grep @claim:loaded-offline` | PASS, 1 test |
| `free-play` | `npm test -- --grep @claim:free-play` | PASS, 1 test |
| `frame-rate` | `npm test -- --grep @claim:frame-rate` | PASS, 1 test; 60.16 fps locally |
| `phone-room` | `npm run test:phone-claim` | PASS, live browser flow plus room-expiry unit test |

The complete deployed suite also passed: `npm run test:live -- --reporter=list`
reported 14/14, including live QR pairing, 20 concurrent moves, the 120-move
buffer boundary, and the ninth room creation returning `429` with
`Retry-After`. The documented allowance is eight room creations per client per
60 seconds; rooms advertise a 20-minute expiry.

An immediately repeated phone claim initially found the QR panel hidden because
the previous successful run had deliberately consumed that same client’s eight
creation allowance. After its 60-second window elapsed, the exact required
command above passed. This is the expected rate-limit state, not deployment
drift.

## First read and gameplay

**PASS.** A cold visitor sees the game board on the first screen, rather than a
menu wall. In plain words it says what to do (guide creatures home together),
who it is for (families and friends sharing one device), and what to click
first (**Try it with sample data**, with its fixed-route/separate-storage
outcome). The same screen states no account/profile, loaded-offline shared
play, and free/no ads or purchases.

The scripted live run used `/demo` and the real fixed simulation:

1. The demo banner states that sample data is not saved; all observed requests
   stayed at `https://couch-creatures.sociobot.in`.
2. Keyboard and labelled touch controls moved the four advertised players.
   Assist persisted after reload in the `demo:couch-creatures:*` namespace.
3. **Watch sample rescue** reached the real postcard with the truthful result
   **9 of 12 creatures reached shelter**.
4. **Play a new route** reset to ready, habitat 1, zero rescued, and zero
   elapsed. **Watch storm loss** reached the real loss screen; retry keeps the
   seed. The deadline-loss and active-run recovery cases passed their claims.
5. Live phone pairing, lantern selection, and movement passed as part of the
   required phone-room claim.

At 390×844 with 4× CPU throttling, active play measured 60.31 fps live (claim
floor: 55 fps). The mobile page had no horizontal overflow and the canvas,
sample action, and game controls were usable. `prefers-reduced-motion: reduce`
produced no CSS animations; keyboard Tab focus showed the designed 4px puddle
outline and the skip link worked.

## Local quality gates

- `npm ci`: PASS, 57 packages installed; `npm audit --json` reports zero
  vulnerabilities.
- `npm run test:all`: PASS, 14/14 Playwright tests and 3/3 relay unit tests.
- `npm run build`: PASS (`tsc -b` and Vite); `dist/` produced. There is no
  separate lint script.
- Production assets: JS 49,046 bytes raw / 18.43 kB gzip; CSS 8,806 bytes raw
  / 2.58 kB gzip; initial illustration 94,412 bytes. These meet the static
  bundle budgets.

## Live platform, privacy, and accessibility checks

- The static assets match local `dist/` SHA-256 exactly:
  `index.html` `205736e689b1e6f5071c7d808c617cee12d5056ba01a81c4b8b03d26a427374f`,
  JS `b43436106fd90e40be52d501723047a069e881c70a553d97592d3acd67d887c3`,
  CSS `6ac5d3a90ef9a559e2576aac76ec7fcf5d9d82756de007333d3a308494cdfd3f`,
  and art `c1ed88eac90cd4390f66b0a5498b6e43209f9edf1a559fc1313c344426959f97`.
- `/api/health` is HTTP 200 and reports the candidate SHA, `storage: sqlite`,
  1200-second room TTL, eight-per-60-second create limit, and 120-move buffer.
  Its JSON has `no-store`, CSP, `nosniff`, and `no-referrer` headers.
- `/`, `/demo`, `/privacy`, `/terms`, and `/controller` return 200; unknown
  routes return the styled HTTP 404. Hashed JS has immutable one-year caching;
  HTML uses 30-second revalidation. Static responses have CSP, HSTS,
  `X-Content-Type-Options`, and `Referrer-Policy`.
- `verify-url.sh` passed the live root: title, `lang=en`, one h1, main landmark,
  image alternatives, labelled buttons, and zero console errors.
- Playwright axe found zero serious or critical findings on all five public
  routes; there were no page or console errors. No third-party requests,
  analytics, sign-in, ads, checkout, or purchases were observed.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.2 s, LCP 1.3 s, TBT 80 ms, CLS 0.

## Defects by severity

No verified defects. The game is not a PWA and does not claim offline reload;
loaded play continuing after a network drop is separately tested and passes.

