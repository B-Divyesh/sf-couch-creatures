# Couch Creatures repair handoff

## Completed

- Fixed the seeded RNG precedence bug. It now normalizes its unsigned 32-bit value before coordinates, traits, and storm layouts use it. The fixed demo seed produces four on-board creatures with all four shuffled traits.
- Removed the private `couch-creatures:test-fast` path and injected terminal-state tests. The public demo now has replay controls that execute the same fixed-timestep game rules at replay speed. Browser coverage reaches a natural storm loss, retry, and the real postcard.
- Made `/` the playable board, including keyboard, touch, demo, assist, recovery, and QR phone-room entry points.
- Added the same-origin Static Web Apps API for temporary QR rooms. It creates six-character rooms, expires them after 20 minutes, accepts only valid left/right moves, and limits creation to eight rooms per minute per client with `429` and `Retry-After`. Phone controllers poll the product API; no phone identity is stored.
- Rejects malformed local snapshots and starts a clean run. Reduced-motion mode freezes canvas movement. The 404 now uses external product CSS under the existing CSP. `/controller` is in the sitemap and canonical URLs update per route.

## Verification

Run locally:

```sh
npm ci
npm test
npm run build
```

Evidence from this repair:

- `npm test`: 11/11 Playwright tests pass. Claims cover demo isolation, public win, restart, malformed-save recovery, four-player inputs, public loss/retry, nine-minute windows, local-only demo traffic, and the room API's forwarding/rate limit.
- `npm test -- --grep @claim:phone-room`: passes against the shipped Static Web Apps handler.
- `npm run build`: passes and creates `dist/`; initial JS is 17.87 KB gzip and CSS is 2.43 KB gzip.
- `npm audit --json`: zero vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4175/ <evidence-dir>`: title, language, main landmark, one h1, image alternatives, and browser console all pass.
- Live API smoke test after deploy: `POST https://couch-creatures.sociobot.in/api/rooms` returned `201`; a room accepted a valid move and returned it from `GET /api/rooms/<room>/moves?after=0`.

## Deployment

Deployed production static files and the managed same-origin API to `sf-couch-creatures` on 2026-09-02 with the Static Web Apps deployment configuration. The live site is https://couch-creatures.sociobot.in.

## Notes

- Temporary phone-room state is intentionally in the managed API process, not local game storage. It is short-lived control data only; room state is not a profile or leaderboard.
- The previously attempted dedicated Container Apps environment was deleted before use, along with its generated workspace. The delivered controller uses the product's existing static deployment rather than an extra resource.
