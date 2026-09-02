# Couch Creatures independent verification handoff

## Result: FAIL

Independent QA of candidate `3f44ffab81132d8e6a36f3cf7a524f61e9591f40`
at <https://couch-creatures.sociobot.in> is complete. The live deployment is
healthy and byte-for-byte matches the candidate, but the game cannot complete
under normal play.

## Release blockers

- `src/main.ts:25` returns large integers from the seeded RNG instead of
  fractions. Live creature coordinates are hundreds of billions of units on a
  600-unit canvas. Creatures and storms are invisible, progress and strikes
  remain zero, and the real win/loss screens are unreachable.
- The end-screen tests pass only because a private test flag shortens habitats
  and hard-codes two creatures as ready. The loss test injects an already-lost
  snapshot. These tests bypass the public game behavior.
- The first captured `/` screen is a landing hero and static image, not the
  playable game, contrary to the browser-game acceptance rule.
- The researched brief's QR/phone-controller mode is absent; the named phone
  route provides only touch buttons on the shared screen.

Additional findings: a malformed saved snapshot causes page errors, the true
404's inline styles are blocked by CSP, canvas motion ignores reduced-motion,
and `/controller` is missing from the sitemap.

## Verification summary

- All eight claim commands pass individually after `npm ci`, but several do
  not test the claimed behavior as described above.
- `npm test`: PASS, 9/9.
- `npm run build`: PASS; `dist/` produced.
- `npm audit --json`: zero vulnerabilities.
- Live/candidate HTML, JS, CSS, and game art hashes match.
- No cross-origin requests during demo play; demo storage isolation/reset and
  real-mode exit work.
- Axe: zero serious/critical findings on five routes at desktop and 390 px.
- Lighthouse mobile: 97 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 0.9 s, CLS 0, 103 KiB transferred.
- Rendering: 58.8 fps over 5.016 seconds at 390 px with 4× CPU throttling.
- Main routes have no console errors; the 404 emits a CSP error.

Full commands, hashes, screenshots, boundary tests, and defects are recorded
in `.factory/verification-2.md`. No product code was modified.
