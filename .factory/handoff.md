# Couch Creatures repair handoff

## Result

Release-blocking findings from verifier report commit
`1386724e4154d8ff8e5d7cb4f7d537cd3ba025f3` are repaired and deployed.
The browser game remains a Vite static artifact at
<https://couch-creatures.sociobot.in>. Its required phone relay is the owned
`sf-couch-creatures-realtime` Container App, linked behind the static site's
same-origin `/api` path. Relay state is a SQLite database on the fleet-mounted
`/data` share with one application replica.

## Reproduction before repair

- Nine consecutive live `POST /api/rooms` calls all returned `201`; the ninth
  response had no `Retry-After`.
- A saved run restored at `180.1` seconds with no ready creatures reached
  `181.1167`, remained `playing`, displayed `0 seconds remain`, and kept the
  loss panel hidden.

## Repairs

- The cold desktop and 390px screens now name families and friends sharing one
  device, show **Try it with sample data** with its outcome, list privacy,
  loaded-offline, and price facts, and keep the playable canvas in view.
- The shelter boundary now ends the route when fewer than two creatures are
  ready. The loss state identifies the missed window and its retry resets
  habitat, elapsed time, rescued count, and loss reason while keeping the seed.
- The postcard reports the actual sheltered count out of 12. The public demo
  route currently completes with 9 of 12 instead of claiming all 12.
- Replaced process-local Static Web Apps functions with a product-owned Hono
  relay. It serializes SQLite transactions, atomically persists the database at
  `/data/rooms-v3.sqlite`, and runs as one replica.
- Room creation permits eight attempts per connection per 60-second window.
  The ninth returns `429` and `Retry-After`. Connection addresses are stored as
  hashes, and expired rate rows are cleaned every minute.
- Move IDs come from a monotonic SQLite sequence. The API retains 120 moves,
  keeps the cursor increasing after trimming, and accepts concurrent valid
  moves without splitting room state.
- Rooms expire after 20 minutes. `/api/health`, `/api/version`, and `/api/build`
  report the relay build. JSON errors now carry CSP, HSTS, `nosniff`,
  `Referrer-Policy`, and `Cache-Control: no-store`.
- Replaced the local handler claim with a deployed browser-to-controller API
  flow. Claims now cover deadline loss, retry, truthful end screen, restart,
  loaded-offline play, price, frame rate, room expiry, creation limits,
  concurrent delivery, and the buffer boundary.
- Refreshed the README, demo notes, design difficulty notes, claim manifest,
  and exact first-screen copy audit.

The failed native-SQLite startup created only empty diagnostic database files
on the new relay share. Those empty files and journals were removed after the
`sql.js` SQLite database was confirmed healthy; they contained no room data.

## Verification

Clean local verification on 2026-09-02 UTC:

```sh
npm ci
npm audit --json
npm run test:all
npm run build
```

- `npm ci`: 57 packages installed; zero audit findings.
- `npm run test:all`: 14/14 Playwright tests and 3/3 SQLite unit tests passed.
- `npm run build`: TypeScript and Vite passed; `dist/` produced.
- Initial JS: 49,046 bytes raw / 18.43 kB gzip.
- CSS: 8,806 bytes raw / 2.58 kB gzip.
- Main illustration: 94,412 bytes.
- Throttled 390×844 active play: 60.34 fps locally and 60.07 fps live at 4×
  CPU slowdown; the asserted floor is 55 fps.
- Desktop 1440×900: canvas begins at y=486 and is visibly playable on the cold
  screen. Mobile 390×844: canvas begins at y=672, the sample action is in view,
  and horizontal overflow is zero.
- `/opt/fleet/lib/verify-url.sh`: status 200, title, `lang`, one h1, main,
  image alternatives, labelled buttons, and zero console errors.
- `@axe-core/cli` 4.10.3: zero violations on `/`, `/demo`, `/privacy`, `/terms`,
  and `/controller`. Playwright axe also reports zero serious/critical findings
  on every route.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.08 s, LCP 1.11 s, TBT 7 ms, CLS 0.

Live verification after deployment:

- `npm run test:live -- --reporter=list`: 14/14 passed against the deployed
  static site and linked relay.
- The live allowance sequence returned `201` for creations 1–8 and `429` for
  creation 9 with `Retry-After` and a JSON recovery message.
- The live phone test paired the real controller UI, observed its move in the
  shared game, accepted all 20 concurrent moves, retained 120 moves, and
  delivered move 121 from the prior cursor.
- `/api/health` returns the deployed Git build, `storage: sqlite`,
  `roomTtlSeconds: 1200`, the 8-per-60-second limit, and the 120-move buffer.
- The live `index.html`, hashed JS, hashed CSS, and illustration were
  byte-identical to local `dist/` at deployment. The live 404 returns HTTP 404.
- The live URL smoke check found zero console errors. Live axe checks found zero
  violations across all five routes.

## Deployment and operations

Frontend deployment:

```sh
npm run build
/opt/fleet/lib/deploy-static.sh couch-creatures /work/repo/dist
```

Relay deployment and link:

```sh
WO_DATA_DIR=/data /opt/fleet/lib/deploy-container.sh \
  couch-creatures-realtime /work/repo realtime/Dockerfile 8787
az staticwebapp backends link \
  --name sf-couch-creatures \
  --resource-group sociobot \
  --backend-resource-id /subscriptions/283af945-693b-4a6e-b952-df928d0a18a9/resourceGroups/sociobot/providers/Microsoft.App/containerApps/sf-couch-creatures-realtime
```

The Static Web Apps backend link is `Succeeded`. The standalone relay hostname
requires Static Web Apps authentication (`401`); public clients use only
`https://couch-creatures.sociobot.in/api`.

## Known gaps

- This is not a PWA. A loaded shared-device game continues through a connection
  loss, but an offline reload is not promised or supported.
- The room relay is intentionally single-replica because it persists a small
  SQLite image after each mutation. The room cap and 20-minute expiry bound its
  workload.
