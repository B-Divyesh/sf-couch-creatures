# Verification 6 — Guide creatures home together

## Verdict: FAIL

**FAIL.** The game and all 20 declared claims pass, but this verification found
one low-severity documentation defect. There are **1 finding** and **0 untested
public claims**. PASS requires zero findings at every severity.

- Work order: `couch-creatures-verify-6`
- Verified: 2026-09-06 UTC
- Live URL: <https://couch-creatures.sociobot.in>
- Static implementation reviewed: `5f870be4914c166c5e74189859adf3bb4328dbf3`
- Live relay implementation: `b91da00c4b99851377fb5465f58ad8a3fd90e553`
- Documentation baseline reviewed: `f85d7651b4a6626b48838e49c0983452131df917`

The implementation and documentation SHAs differ because `5c95034` and
`f85d765` are report-only commits after the static fix. A clean build of
`5f870be` matches the live HTML, JavaScript, CSS, and artwork byte for byte.

## Job, audience, and first action

Before scrolling, fresh 1280×720 desktop and 390×844 phone browsers showed the
playable board and stated:

- Job: **Guide creatures home together**.
- Audience: families and friends sharing one device.
- First action: **Try it with sample data**.
- Action result: **Starts a fixed sample route. Demo changes stay separate.**

Both first screens also showed the account, loaded-network, and price facts.
The sample action and the start of the actual canvas were visible without
scrolling. The phone had no horizontal overflow. Neither browser produced a
page or console error.

Evidence:
`/work/.evidence/couch-creatures-verify-6/live/fresh-desktop.png`,
`fresh-phone.png`, and `manual-live.json`.

## Demo and complete game runs

The first-screen action entered `/demo` in one click. The label **Demo — sample
data, nothing is saved** remained present. The ready sample contained four
creatures, four lanterns, eight touch buttons, hazards, settings, and replay
controls. It used seed `moss-postcard-17` and exposed no phone-room action.

The public sample replay ran the deterministic simulation through all three
habitats. It reached the postcard at 540.0167 seconds with **6 of 12 creatures
reached shelter**. **Play a new route** returned to ready, habitat one, zero
rescued, zero elapsed, and the same `moss-postcard-17` seed. A legacy demo save
with another seed was also replaced by the fixed sample in the declared test.

The public storm replay reached **The group needs another try** after three
storm strikes. Retry reset the run and kept the fixed seed. The deadline-loss,
pause/resume, malformed-save recovery, paused refresh recovery, assist reach,
assist strike speed, and assist persistence paths passed.

Reset demo restored the fixed ready state. Start for real removed every
`demo:couch-creatures:*` key. A pre-existing real storage marker and real assist
setting remained unchanged through entry, reset, and exit. Demo play made no
`/api` or cross-origin request.

Recorded evidence:

- `/work/.evidence/couch-creatures-verify-6/live/video/fa044fe1bcad445e4aa24bc8a1ccd66b.webm`
- `/work/.evidence/couch-creatures-verify-6/live/demo-populated.png`
- `/work/.evidence/couch-creatures-verify-6/live/win-end-screen.png`
- `/work/.evidence/couch-creatures-verify-6/live/loss-end-screen-phone.png`

## Declared claims

Dependencies were installed with `npm ci` before runtime measurement. Every
exact command in `.factory/claims.json` ran from the clean checkout and passed.
Each of the 20 claim IDs occurs in exactly one tagged test.

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-isolated` | `npm test -- --grep @claim:demo-isolated` | PASS, 1 test |
| `fixed-demo-route` | `npm test -- --grep @claim:fixed-demo-route` | PASS, 1 test |
| `end-screen` | `npm test -- --grep @claim:end-screen` | PASS, 1 test |
| `restart-resets` | `npm test -- --grep @claim:restart-resets` | PASS, 1 test |
| `recovery` | `npm test -- --grep @claim:recovery` | PASS, 1 test |
| `assist-mode` | `npm test -- --grep @claim:assist-mode` | PASS, 1 test |
| `pause-control` | `npm test -- --grep @claim:pause-control` | PASS, 1 test |
| `four-players` | `npm test -- --grep @claim:four-players` | PASS, 1 test |
| `touch-button-size` | `npm test -- --grep @claim:touch-button-size` | PASS, 1 test |
| `hazards-and-loss` | `npm test -- --grep @claim:hazards-and-loss` | PASS, 1 test |
| `nine-minute-pace` | `npm test -- --grep @claim:nine-minute-pace` | PASS, 1 test |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS, 1 test |
| `shared-device-origin` | `npm test -- --grep @claim:shared-device-origin` | PASS, 1 test |
| `loaded-offline` | `npm test -- --grep @claim:loaded-offline` | PASS, 1 test |
| `free-play` | `npm test -- --grep @claim:free-play` | PASS, 1 test |
| `privacy-categories` | `npm test -- --grep @claim:privacy-categories` | PASS, 1 test |
| `frame-rate` | `npm test -- --grep @claim:frame-rate` | PASS, 60.16 fps |
| `site-structure` | `npm test -- --grep @claim:site-structure` | PASS, 1 test |
| `phone-room` | `npm run test:phone-claim` | PASS, live browser and expiry checks |
| `phone-data` | `npm run test:unit -- --test-name-pattern='@claim:phone-data'` | PASS, SQLite check |

The live 21-test browser suite also passed. Its frame-rate result was 60.18 fps
at 390×844 under 4× CPU slowdown. No additional public claim lacked a matching
manifest entry and observable test.

## Backend, privacy, and recovery

The phone-room test used an independent shared-game page and phone page. The
phone joined the real room, selected lantern three, and moved it. Twenty
concurrent moves were accepted and delivered. A move after the 120-entry buffer
advanced the cursor. Creations one through eight succeeded; the ninth returned
HTTP 429 with a positive `Retry-After`. Room expiry was checked at the exact
20-minute boundary.

The five relay tests passed. They cover separate rooms, move persistence after
closing and reopening the SQLite store, the creation limit, expiry, buffer
rollover, stored fields, one-way connection hashing, and expired-row cleanup.
The live health endpoint returned HTTP 200 and reported SQLite, a 1,200-second
room lifetime, eight creates per 60 seconds, a 120-move buffer, and relay build
`b91da00c4b99851377fb5465f58ad8a3fd90e553`.

The controller rejected `ABC` with **Enter the six-character room code.** It
rejected an unknown valid-format code with **Could not join that room. Check
the code and try again.** The phone controls stayed hidden after either error.

Demo and real shared-device request recorders saw no cross-origin traffic.
The privacy check found no name, account, photo, contact, or location input or
permission call. Loaded local play continued after the browser went offline.
Offline reload and update behavior are not promised; the product is not a PWA.

## Accessibility, routes, and performance

- `/opt/fleet/lib/verify-url.sh` passed on HTTPS: HTTP 200, title, `lang=en`,
  one h1, main landmark, image alternatives, labelled buttons, and no errors.
- Playwright Axe reported zero serious or critical violations on `/`, `/demo`,
  `/privacy`, `/terms`, `/controller`, and the styled 404.
- The skip link reached `#main` and had a 4px visible focus outline. Route
  navigation focused the new h1. Keyboard and touch controls worked, and every
  visible control met the 44px target floor.
- Reduced-motion mode stopped game entity motion and reduced CSS motion to its
  immediate fallback. A 200% page zoom retained the content and controls.
- All internal links returned 200. Back and forward navigation restored the
  correct URL and route title. Every public route had one h1, one main, and its
  own title and metadata.
- The unknown page returned a complete styled HTTP 404. The unknown API route
  returned the deliberate JSON HTTP 404. These expected 404 responses are not
  defects.
- Lighthouse mobile scored 100 Performance, 100 Accessibility, 100 Best
  Practices, and 100 SEO. FCP was 1.1 s, LCP 1.2 s, TBT 30 ms, CLS 0, and
  transferred data 115 KiB.
- `npm audit --json` reported zero vulnerabilities. `npm run build` produced
  `dist/`: 49.60 kB raw JavaScript (18.57 kB gzip), 8.88 kB CSS (2.59 kB gzip),
  and a 94,412-byte main image.
- HTML revalidates after 30 seconds. Hashed assets and artwork use immutable
  one-year caching. Static and API responses carry the expected security
  headers.

## Candidate and live deployment

The two commits after `5f870be` change only `.factory/handoff.md`. Fresh build
and live SHA-256 values match:

| File | SHA-256 |
| --- | --- |
| `index.html` | `9c0ee397d988dd30e9bec8ec55e0a032fbf73230acccfeccde031df315bd019b` |
| `assets/index-DRZ73yyd.js` | `7e4b344f7d052221f990620b05f0a79091f5746fc0a9a6de6e0be65bbefaeb25` |
| `assets/index-sH0KsJcd.css` | `b5e6b4f0e147d50c16f0d9f55cf9590908f93dfe2f03ec20fd5845fb7af7412c` |
| `moss-rescue.webp` | `c1ed88eac90cd4390f66b0a5498b6e43209f9edf1a559fc1313c344426959f97` |

## Earlier finding disposition

All earlier findings were inspected. The previous runtime and claim defects
remain closed.

| Earlier findings | Current disposition |
| --- | --- |
| `CC-001`–`CC-005` | Demo isolation, full win/loss loop, four local inputs plus a real phone, refresh recovery, and declared outcome tests pass. |
| `CC-006`–`CC-010` | Mobile layout, focus and target size, dependency audit, true 404 handling, caching, and image metadata pass. |
| `CC2-001`–`CC2-008` | Deterministic entities, first-screen board, phone flow, real rule paths, save validation, CSP-safe 404, reduced motion, and route structure pass. |
| `CC3-001`–`CC3-010` | First-read wording, live allowance, concurrency, buffer rollover, deadline, claim coverage, truthful postcard, identity, API headers, and copy audit pass. |
| `F-1-1`–`F-1-5` | Demo relay isolation, complete 404, route social metadata, earlier claim additions, and plain wording pass. |
| `R4-001` | Fixed. Play a new route and legacy randomized demo saves both return to `moss-postcard-17`. |
| `R4-002` | Fixed. The 58px controls, privacy categories, and real shared-device request behavior now have declared outcome tests. |

## Finding

### Low — V6-001: the visual source of truth has the wrong touch-button size

`.factory/design.md` says **Touch buttons are 56px**. The current source uses
`height: 58px` and `min-height: 58px`; all eight live phone controls measure
58px high. README and claim `touch-button-size` also state 58px, and that claim
passes locally and live.

The runtime is accessible and the public 58px statement is true. The defect is
that the required visual source of truth contradicts the implemented and
tested spacing value. Update `.factory/design.md` from 56px to 58px, then rerun
the documentation consistency check. No product-code change is required.

Evidence:
`/work/.evidence/couch-creatures-verify-6/touch-size-doc-audit.txt` and
`claims/touch-button-size.txt`.

## Final result

**FAIL — 1 finding, 0 untested claims.**
