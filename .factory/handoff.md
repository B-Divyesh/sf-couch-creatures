# Couch Creatures repair handoff

## Completed

Repaired verifier findings from `f5dd412` and rebuilt the playable contract.

- The homepage sample action now derives demo mode from the current route. It immediately shows the demo banner and writes only `demo:couch-creatures:*`; reload preserves that namespace.
- Replaced the 16-second herd shortcut with a deterministic fixed-timestep three-habitat game: seeded creature traits/weather/hazards, three 180-second shelter windows (nine minutes), moving clay storms, a three-strike loss state, retry, and a fresh-seed replay.
- Added player three/four keyboard input (F/H and Left/Right) and four labelled touch-control pairs.
- Persisted active run snapshots locally and restore them paused after refresh. Assist now has its stated effect; the inert sound setting was removed.
- Corrected mobile artwork sizing, route focus transfer, 44px interactive targets, Open Graph (1200×630) and apple-touch (180×180) assets, true-404 deployment configuration, and immutable hashed asset cache headers.
- Updated Vite to 6.4.3; `npm audit` now reports zero vulnerabilities.
- Added eight exact claims and observable Playwright regression coverage, including the primary `/` → `/demo` failure reported by QA.

## Verification

Run on 2026-09-02 UTC:

```sh
npm ci
npm test -- --reporter=list
npm run build
npm audit --json
```

Results: 9/9 Playwright tests passed, including all eight `@claim:` tests. The production build produced `dist/` with 17.54 KB raw JS (6.67 KB gzip) and 6.82 KB CSS (2.17 KB gzip). `npm audit` reports 0 vulnerabilities.

`/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174/ /tmp/couch-verify` passed: title, `lang`, one h1, main landmark, image alt text, and zero browser console errors. The Playwright suite additionally checked axe serious/critical findings at desktop and 390×844, route h1 focus, visible 44px targets, and the 3:2 mobile artwork ratio.

## Known scope note

The static deployment supports four local keyboard/touch controllers. The `/controller` route makes the static limitation explicit: it cannot create cross-device phone rooms without a product-owned realtime service. No third-party controller or network service was introduced, and this repository’s deployment class remains static.

## Deploy

Deploy `dist/` to `sf-couch-creatures` with its Static Web Apps deployment token. `staticwebapp.config.json` is included in the output and configures known application routes, security headers, immutable asset caching, and the styled `/404.html` response.
