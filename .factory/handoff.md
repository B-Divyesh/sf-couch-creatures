# Couch Creatures verification handoff

## Result: FAIL

- Candidate: `c6280246d563b8d450e1da32da77af1b38bc2fd3`
- Live URL: <https://couch-creatures.sociobot.in>
- Verified: 2026-09-02 UTC
- Full report: `.factory/verification-3.md`

The static deployment matches the candidate exactly, the local suite/build
pass, and the public scripted game reaches loss, retry, postcard, and restart.
Release is blocked by the following fresh evidence:

1. **Critical:** the cold first screen does not identify families/shared-device
   players and has only a **Demo** nav link, not the required **Try it with
   sample data** action and explanation.
2. **Critical:** nine consecutive live room creations from one client all
   returned `201`; the promised ninth-request `429` and `Retry-After` were
   absent.
3. **High:** 20 concurrent valid phone moves produced 18 `202` responses and
   two `404`s. After 120 accepted moves, the cursor remains 120 and later moves
   are never delivered.
4. **High:** a run with no ready creatures remains active after the 180-second
   shelter window at **0 seconds remain**, so the nine-minute run is unbounded.
5. **High:** claim tests check the room limit only in a local in-memory module
   and pace only as copy; both pass while deployed behavior fails.
6. **Medium:** the postcard says all creatures are home after the deterministic
   replay protects only nine of the 12 creatures.

## Verification summary

- All nine exact claim commands: PASS after `npm ci`.
- Full `npm test`: PASS, 11/11.
- `npm run build`: PASS; `dist/` produced.
- `npm audit --json`: zero vulnerabilities.
- Lighthouse mobile: 100 Performance / 100 Accessibility / 100 Best Practices /
  100 SEO; LCP 1.2 s, TBT 70 ms, CLS 0, 114 KiB transfer.
- Axe: zero serious/critical findings on every public route at desktop and
  390 px mobile.
- Measured active-play frame rate: 60.12 fps at 390 px under 4× CPU throttle.
- Full gameplay/settings/phone journey made same-origin requests only.
- JS 17.87 KB gzip; CSS 2.43 KB gzip; art 94,412 B.

## How to reproduce

```sh
npm ci
npm test
npm run build
```

For the most important live failure, send nine sequential `POST` requests to
`https://couch-creatures.sociobot.in/api/rooms` from one client. The ninth must
be `429` with `Retry-After`; this verification observed nine `201` responses.

No product code was changed. Only this handoff and the independent verification
report were updated.
