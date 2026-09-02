# Couch Creatures

Guide shy creatures past moving clay storms in a nine-minute shared-screen rescue for two to four players. Families and friends use one keyboard, labelled touch pads, or a phone paired by QR code. The game has no accounts, ads, purchases, or player profiles.

Open `/demo` or choose **Try it with sample data** on the homepage. Demo mode is an isolated, seeded run using only `demo:couch-creatures:*` browser storage. Its banner can reset the sample or discard it and return to real play.

## Play

Each run has three habitats and three 180-second shelter windows. Keep two creatures in lantern light while avoiding moving clay storms. Missing a shelter window or taking three storm strikes ends the route. A completed run reaches its postcard near 540 seconds. Escape pauses play, and refreshing restores an active run as paused.

Player one uses A/D, player two J/L, player three F/H, and player four Left/Right arrows. The game board also includes two 58px touch buttons for each player. Loaded shared-device play continues without a network connection.

Select **Start phone room** on the shared screen to show a QR code. A phone scans it, chooses one lantern, and sends left/right moves to that room. Rooms expire after 20 minutes. One connection can create eight rooms per minute; the ninth response is `429` with `Retry-After`.

The demo has public replay buttons for the full seeded rescue and a storm loss. They run the same simulation rules at replay speed so a group can see both outcomes before playing.

## Run, test, and build

```sh
npm ci
npm run dev
npm run test:all
npm run build
```

Open `http://localhost:5173/`. The development server proxies `/api` to the local SQLite room relay started by Playwright. `npm run build` creates `dist/` for static deployment. The Playwright suite covers every public claim listed in `.factory/claims.json`.

The production room relay is the product-owned `sf-couch-creatures-realtime` container. It runs Hono with SQLite at `/data`, one replica, and no shared database. Static Web Apps links its same-origin `/api` path to that container. `GET /api/health` reports the deployed build identity.

## Privacy and deployment

Run recovery and assist settings remain in localStorage. Demo and real play use separate namespaces. Shared-device play makes no cross-origin requests. Phone rooms store only room codes, direction presses, and a one-way connection hash for the creation limit. The relay removes expired rooms and short-lived limit records.

Deploy `dist/` to static hosting with the included `staticwebapp.config.json`. It sets security headers, immutable asset cache rules, and a styled 404 response. Deploy `realtime/Dockerfile` separately and link it as the Static Web Apps backend for `/api`.

Visual direction and original-image provenance are recorded in `.factory/design.md`. The demo details are in `.factory/demo.md`.

## License

MIT. See [LICENSE](LICENSE).
