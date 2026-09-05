# A shared creature-rescue game for families and friends

Guide shy creatures past moving clay storms in a nine-minute shared-screen rescue for two to four players. Families and friends use one keyboard, labelled touch pads, or a phone paired by QR code. The game has no accounts, ads, purchases, or player profiles.

Open `/demo` or choose **Try it with sample data** on the homepage. Demo mode is a fixed run using only `demo:couch-creatures:*` browser storage. Its banner resets the sample or clears it before returning to real play. The demo never contacts the phone-room relay.

## How to play

Each run has three habitats and three 180-second shelter windows. Keep two creatures in lantern light while avoiding moving clay storms. Missing a shelter window or taking three storm strikes ends the route. A completed run reaches its postcard near 540 seconds. Escape pauses and resumes play. Refreshing restores an active run as paused.

Player one uses A/D, player two J/L, player three F/H, and player four Left/Right arrows. The game board also includes two 58px touch buttons for each player. Loaded shared-device play continues without a network connection.

Start real play, then select **Start phone room** to show a QR code. A phone scans it, chooses one lantern, and sends left or right moves. Rooms expire after 20 minutes. One connection can create eight rooms per minute; the ninth response is `429` with `Retry-After`.

The demo has public replay buttons for the full fixed rescue and a storm loss.

## Run, test, and build

```sh
npm ci
npm run dev
npm run test:all
npm run build
```

Open `http://localhost:5173/`. The development server proxies `/api` to the local SQLite room relay started by Playwright. `npm run build` creates `dist/` for static deployment. The exact public claim checks are listed in `.factory/claims.json`.

The production room relay is the product-owned `sf-couch-creatures-realtime` container. It runs Hono with SQLite at `/data`, one replica, and no shared database. Static Web Apps links its same-origin `/api` path to that container. `GET /api/health` reports the deployed build identity.

## Privacy and deployment

Active-run recovery remains in localStorage. Assist mode remains enabled after reload. Demo and real play use separate namespaces. Shared-device play makes no cross-origin requests. Phone rooms store random room codes, control presses, expiry times, and a one-way connection hash. The relay removes expired room and creation-limit records.

Deploy `dist/` to static hosting with the included `staticwebapp.config.json`. It sets security headers, immutable asset cache rules, and a complete styled 404 response. Deploy `realtime/Dockerfile` separately and link it as the Static Web Apps backend for `/api`.

Visual direction and original-image provenance are recorded in `.factory/design.md`. The demo details are in `.factory/demo.md`.

## License

MIT. See [LICENSE](LICENSE).
