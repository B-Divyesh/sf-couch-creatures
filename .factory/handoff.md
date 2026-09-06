# Couch Creatures repair 5 handoff

## Outcome

**PASS.** Repair 5 closes both Review 4 findings and covers the four omitted
public claims with declared, observable regression tests.

- Static implementation: `5f870be4914c166c5e74189859adf3bb4328dbf3`
- Unchanged phone relay: `b91da00c4b99851377fb5465f58ad8a3fd90e553`
- Live URL: <https://couch-creatures.sociobot.in>
- Static deployment: Static Web Apps production deployment `4ac12cba-aa21-4c8b-bba0-3ffbd086cc31`

The job is a nine-minute shared-screen creature rescue. It is for families and
friends sharing a device. The first action is **Try it with sample data**.
Fresh 1280×720 and 390×844 HTTPS pages showed all three before scrolling, with
the playable board visible and no page or console errors.

## What changed

- **R4-001 fixed:** **Play a new route** preserves `moss-postcard-17` in demo
  mode. Real play still gets a new random route. A valid legacy randomized
  demo snapshot is discarded and rebuilt on the fixed sample before it can
  reopen under the fixed label.
- Added `@claim:fixed-demo-route`: a real sample rescue reaches its postcard,
  then **Play a new route** returns the same ready board, lanterns, creatures,
  and fixed seed. It also covers the legacy-snapshot recovery path.
- **R4-002 fixed:** added exact outcome claims for the two 58px touch buttons
  per player, the privacy page's named data categories, and no cross-origin
  requests during real shared-device keyboard/touch play.
- `.factory/demo.md` and `.factory/copy-audit.md` now state that Reset demo
  and Play a new route both restart the same fixed seed.

## Verification

Clean setup began with `npm ci`. All 20 exact commands in
`.factory/claims.json` passed, including the live phone-room command and the
SQLite privacy-cleanup command. `npm test` and `npm run test:all` passed 21
Playwright checks and 5 relay checks. `npm audit --json` reported zero
vulnerabilities. `npm run build` produced `dist/` with 49.60 kB raw JavaScript
(18.57 kB gzip) and 8.88 kB CSS (2.59 kB gzip).

Post-deploy `npm run test:live -- --reporter=list` passed 21/21. It included
the real phone pairing, concurrent move, buffer, expiry, and 429/Retry-After
paths. Active 390px play at 4× CPU slowdown measured 60.31 fps.

- `/opt/fleet/lib/verify-url.sh` passed on HTTPS: title, `lang=en`, one h1,
  main landmark, image alternatives, labelled buttons, and no errors.
- Playwright Axe passed with zero serious or critical findings on every public
  route and the styled 404.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.7 s, LCP 1.7 s, TBT 0 ms, CLS 0, 115 KiB transfer.
- Live HTML, JS, CSS, and `moss-rescue.webp` SHA-256 hashes match the built
  candidate. The new JavaScript asset is `index-DRZ73yyd.js`.

The live one-click sample retained **Demo — sample data, nothing is saved**,
showed a populated board and eight touch buttons, reset to the fixed ready
state, and left a pre-existing real-storage marker unchanged. Start for real
removed every demo key and preserved that marker. The recorded rescue ended at
540.0167 seconds with 6 of 12 sheltered; its restart returned to the same seed
and the storm replay reached the actual loss screen. Evidence is in
`/work/.evidence/couch-creatures-repair-5/`.

## Deployment

Only the static site was redeployed. The existing `sf-couch-creatures-realtime`
SQLite relay, its `/data` volume, one-replica bound, environment, probes, and
same-origin backend link were not changed. Production HTTPS returned 200 after
the deployment.

## Known limitations

This is not a PWA and does not promise offline reload or update behavior.
Loaded shared-device play continuing after network loss remains tested. There
are no paid offers or external integrations in the researched brief.

## Historical review and verification record

### Review 3

Fresh strict review on 2026-09-06 UTC: **PASS** with zero findings and zero untested public claims. Static candidate `189bf09db9b59631c5902b819fc9f4b3f16ebaab` matched live JavaScript, CSS, and artwork. Documentation baseline is `6a6d9b162d0811bceee8069ef9dddeb4629bd820`; intervening commits are report-only. The live relay reports `b91da00c4b99851377fb5465f58ad8a3fd90e553`.

Fresh desktop and phone sessions showed the playable board, job, audience, and sample action before scrolling, with no errors or phone overflow. Win/loss, reset/retry, keyboard/touch, pause/recovery, assist, loaded offline play, independent phone pairing, rate limiting, privacy, legal routes, metadata, and the designed HTTP 404 passed.

Clean-install verification passed:

```sh
npm ci
npm audit --json
npm run build
npm test
npm run test:unit -- --test-name-pattern='@claim:phone-data'
npm run test:phone-claim
npm run test:live -- --reporter=list
```

All 16 exact commands in `.factory/claims.json` passed. Local browser tests were 17/17 with 60.34 fps at 390px and 4× CPU throttle; fresh live tests were 17/17 with a 60.29 fps independent check. `verify-url.sh` passed. The standalone Axe CLI lacks a system Selenium Chrome binary in this worker; installed Playwright Axe passed with zero serious or critical violations on every public route and 404. Full evidence: `.factory/review-3.md` and `/work/.evidence/`.

## Result

**PASS.** All blocking and minor findings in `.factory/review-1.md` are fixed,
the earlier verification history was rechecked, the product was deployed, and
the cold HTTPS product passes the complete browser suite.

- Static implementation: `189bf09db9b59631c5902b819fc9f4b3f16ebaab`
- Relay implementation: `b91da00c4b99851377fb5465f58ad8a3fd90e553`
- Documentation: the final report-only Git commit for this work order
- Live site: <https://couch-creatures.sociobot.in>
- Verified: 2026-09-05 UTC

The relay revision differs from the static implementation because the final
implementation commit changed only the canvas win wording. The static site was
redeployed after that commit. The relay reports its own deployed SHA at
`/api/health`.

## Current review repairs

### Demo sandbox

Phone rooms are unavailable while `/demo` is active. The sample shows a plain
explanation and offers only keyboard and touch controls. The real home route
still offers phone pairing.

`@claim:local-only` now records every request during movement, a natural storm
loss, and reset. It fails on any `/api` request, not only cross-origin traffic.
The live run made no relay request. `@claim:demo-isolated` starts with real run
and assist data, changes and resets the sample, then leaves demo. Demo keys are
removed and the real values remain byte-for-byte unchanged.

### Complete 404 and route metadata

The standalone 404 now has the standard skip link, wordmark, four navigation
links, one `h1`, `main`, product description, Privacy, Terms, factory credit,
version, favicon, touch icon, theme color, canonical, description, Open Graph,
and Twitter metadata. Its external CSS uses the concrete-and-moss design and
passes CSP. An unknown live URL returns HTTP 404.

Every SPA route now updates title, description, canonical, `og:title`,
`og:description`, `og:url`, `twitter:title`, and `twitter:description`.
`@claim:site-structure` exercises all five routes and the real 404 response.

### Claims and copy

- Added outcome claims for assist reach and strike speed, Escape pause/resume,
  complete route metadata/404 behavior, and relay data cleanup.
- Expanded demo isolation to cover Reset demo and Start for real.
- Expanded the free-play check to cover account/profile UI.
- The relay privacy test creates a room through the real handler, inspects the
  temporary SQLite file, proves the connection address is hashed, reopens the
  file, and proves expired rooms, moves, and limit rows are removed.
- That test found a restart-specific orphan-move issue. Cleanup now deletes
  moves for expired rooms explicitly before deleting rooms.
- Removed the unprovable public originality sentence. Provenance remains in
  `.factory/design.md`.
- Removed the cold `Seed:` label and route-seed wording. README headings now
  name the task. The win overlay says `Route complete`.
- `.factory/copy-audit.md` contains the current rendered and README copy. No
  sentence exceeds 22 words and no banned marketing term remains.
- `.factory/catalog-description.txt` is 105 bytes, starts with a verb, and is
  copied to `/work/.evidence/catalog-description.txt`.

## Earlier finding disposition

| Finding | Current evidence |
| --- | --- |
| CC-001 | Home-to-demo entry uses only `demo:couch-creatures:*`; reset and exit preserve real data. |
| CC-002 | Public simulation reaches a storm loss and a 540.016-second postcard. |
| CC-003 | Four keyboard/touch lanes work; a real phone pairs by QR and moves its selected lantern. |
| CC-004 | A valid active run reloads paused; malformed saves recover without page errors. |
| CC-005 | All 16 public claims have one tagged outcome test; every declared command passed. |
| CC-006 | The illustration keeps its aspect ratio at 390px; no horizontal overflow. |
| CC-007 | SPA navigation focuses the new `h1`; visible targets are at least 44px. |
| CC-008 | `npm audit --json` reports zero vulnerabilities. |
| CC-009 | Unknown HTTPS routes return a deliberate styled HTTP 404. |
| CC-010 | Hashed assets are immutable; social card is 1200×630 and touch icon is 180×180. |
| CC2-001 | Seeded entities remain on the board; five fresh live sample runs each ended with 6 of 12 sheltered. |
| CC2-002 | The playable canvas is visible in the cold desktop and phone viewport. |
| CC2-003 | Product-owned same-origin phone rooms are live. |
| CC2-004 | Public replay buttons exercise real collision, deadline, transition, and postcard rules. |
| CC2-005 | Stored snapshots are schema-validated before restore. |
| CC2-006 | The 404 uses external CSS allowed by CSP and has no broken resource. |
| CC2-007 | Reduced motion freezes canvas entity movement and removes CSS motion. |
| CC2-008 | Sitemap/canonicals are complete; the 404 now has the full route skeleton and metadata. |
| CC3-001 | Cold first screens name the job, audience, sample action, outcome, and three facts. |
| CC3-002 | Live creations 1–8 return 201; creation 9 returns 429 with `Retry-After`. |
| CC3-003 | Twenty concurrent live moves were accepted and returned. |
| CC3-004 | Move 121 is delivered after the 120-move buffer rolls over. |
| CC3-005 | A 180.1-second zero-ready save loses immediately on resume. |
| CC3-006 | Deadline, phone, expiry, frame-rate, and public behavior claims have outcome coverage. |
| CC3-007 | The postcard reports the saved total out of 12; the live sample reports 6 of 12. |
| CC3-008 | `/api/health`, `/api/version`, and `/api/build` report the relay build. |
| CC3-009 | API JSON includes CSP, HSTS, `nosniff`, referrer policy, and `no-store`. |
| CC3-010 | The copy audit now matches rendered copy. |
| F-1-1 | Demo has no room action and made zero `/api` requests through play, loss, and reset. |
| F-1-2 | Live unknown route is a complete, styled, metadata-rich HTTP 404. |
| F-1-3 | OG and Twitter title/description now change on every SPA route. |
| F-1-4 | Assist, pause, reset/exit, account-free play, phone storage, and cleanup claims are listed and tested. |
| F-1-5 | The cold seed label is gone; README headings use task language. |

## Verification

Clean setup and local checks:

```sh
npm ci
npm audit --json
npm run test:all
npm run build
```

- `npm ci`: 57 packages installed; zero audit findings.
- Every non-live claim command from `.factory/claims.json`: PASS.
- `npm run test:all`: 17/17 Playwright and 4/4 relay tests passed before
  deployment. The final relay suite has 5/5 after adding restart/isolation
  evidence.
- `npm run build`: PASS; `dist/` produced.
- JavaScript: 49,520 bytes raw / 18.54 kB gzip.
- CSS: 8,876 bytes raw / 2.59 kB gzip.
- Main illustration: 94,412 bytes.
- Local throttled 390×844 frame rate: 60.17 fps.

Live checks:

- Exact `npm run test:phone-claim`: PASS.
- `npm run test:live -- --reporter=list`: 17/17 PASS.
- Live throttled 390×844 frame rate: 60.28 fps.
- Fresh desktop and phone browsers show the game, job, audience, sample action,
  and all three facts with no console errors or overflow.
- The live sample reached `postcard` at 540.016 seconds with 6 of 12 sheltered.
  Restart returned to ready, habitat 1, zero sheltered, and zero elapsed.
- The live loss run reached `lost` with three storm strikes. Win and loss
  screenshots are in `/work/.evidence/couch-creatures-end-screen.png` and
  `/work/.evidence/couch-creatures-loss-screen.png`.
- Demo play sent zero `/api` requests and preserved a real-storage marker.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, `lang=en`, one `h1`, `main`, all
  image alternatives, labelled buttons, and zero console/page errors.
- Playwright axe: zero serious or critical findings on `/`, `/demo`,
  `/privacy`, `/terms`, `/controller`, and the 404.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.1s, LCP 1.1s, TBT 10ms, CLS 0, 115 KiB transferred.
- All 10 internal links/assets crawled from public routes returned below 400.
- `/`, `/demo`, `/privacy`, `/terms`, and `/controller` return 200;
  `/not-a-route` returns 404.
- Live `index.html`, JS, CSS, and illustration hashes match local `dist/`.

## Deployment

The static site was deployed from the clean `dist/` built at static
implementation `189bf09db9b59631c5902b819fc9f4b3f16ebaab`.

The relay image is
`sociobotregistry.azurecr.io/sf-couch-creatures-realtime:b91da00c4b99` on ready
revision `sf-couch-creatures-realtime--0000005`. It retains the existing Azure
File volume at `/data`, min/max replicas of one, and the `Succeeded` Static Web
Apps backend link. `/api/health` returns that exact relay build SHA.

The container wrapper completed the image, revision, volume, certificate, and
binding work, then kept polling the protected direct hostname, which correctly
returns 401. It was stopped after the linked public `/api/health` returned 200
from the new ready revision. No deployment repair was needed.

## Known gaps

- This is not a PWA. A loaded shared-device game continues when the network
  drops; offline reload is not promised.
- Direct relay access is intentionally protected. Clients use the product's
  same-origin `/api` route.
- No external integration is required by the researched game brief.

## Verification 5

Independent verification on 2026-09-05 UTC is **PASS** with zero findings and
zero untested public claims. See `.factory/verification-5.md`.

- Static implementation reviewed: `189bf09db9b59631c5902b819fc9f4b3f16ebaab`
- Relay implementation reviewed: `b91da00c4b99851377fb5465f58ad8a3fd90e553`
- Documentation baseline reviewed: `fb42b0a4bebab9279029f64273d18e55baba3ea8`
- Clean install, audit, all 16 exact claim commands, relay tests, and production
  build passed. The live browser evidence covers all 17 cases; live active play
  measured 60.22 fps under the documented 4× CPU slowdown.
- Fresh desktop and phone pages showed the playable game, job, audience, first
  action, and facts before scrolling. The demo banner persisted; reset and exit
  preserved real storage. The deterministic rescue ended with 6 of 12
  sheltered, and the storm loss reached its loss screen.
- `/opt/fleet/lib/verify-url.sh` and axe checks passed. The relay health endpoint
  reports the deployed relay SHA, SQLite, 20-minute rooms, eight creations per
  minute, and a 120-move buffer. The phone test verified concurrent moves,
  buffer rollover, and the HTTP 429/`Retry-After` boundary.

## Review 2

Fresh strict review on 2026-09-05 UTC: **PASS** with zero findings and zero untested public claims. The reviewed static implementation remains `189bf09db9b59631c5902b819fc9f4b3f16ebaab`; the live relay remains `b91da00c4b99851377fb5465f58ad8a3fd90e553`; the review documentation baseline is `c4dcc28a74b823e791b2dc52b7d75156bcc88246`.

The live JS, CSS, and illustration hashes match a clean local build. Fresh desktop and phone contexts showed the game, job, audience, and sample action before scrolling. The demo label persisted; reset/exit preserved real data; and demo sent no relay requests. Fresh recorded runs reached the 6-of-12 postcard and the storm-loss screen.

Verification commands passed: `npm ci`, `npm audit --json`, every exact claim command in `.factory/claims.json`, `npm test`, `npm run test:live -- --reporter=list`, `npm run build`, and `/opt/fleet/lib/verify-url.sh https://couch-creatures.sociobot.in /work/.evidence`. The final four live tests were rerun separately; live 390px/4×-CPU active play measured 60.16 fps. The repository Axe/Playwright checks had zero serious or critical issues on every route and the 404. The standalone Axe CLI could not launch in this worker because no Selenium Chrome binary is installed; the equivalent repository integration passed.

All CC, CC2, CC3, and F-1 findings remain closed; see `.factory/review-2.md` for per-finding evidence. No product code was modified in this review.
