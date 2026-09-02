# Couch Creatures

Guide shy creatures past moving clay storms in a nine-minute shared-screen rescue for two to four local players. Use one keyboard or the labelled touch pads. The game has no accounts, ads, purchases, player profiles, or networked play.

Open `/demo` or choose **Try it with sample data** on the homepage. Demo mode is an isolated, seeded run using only `demo:couch-creatures:*` browser storage. Its banner can reset the sample or discard it and return to real play.

## Play

Each run has three habitats and three 180-second shelter windows. Keep two creatures in lantern light while avoiding moving clay storms. Three storm strikes end the route. A full run takes nine minutes; Escape pauses it, and refreshing restores the active run as paused.

Player one uses A/D, player two J/L, player three F/H, and player four Left/Right arrows. The game board also includes two 58px touch buttons for each player.

## Run, test, and build

```sh
npm ci
npm run dev
npm test
npm run build
```

Open `http://localhost:5173/`. `npm run build` creates `dist/` for static deployment. The Playwright suite covers every public claim listed in `.factory/claims.json`.

## Privacy and deployment

All run recovery and assist settings remain in localStorage. Demo and real play use separate namespaces. The site makes no cross-origin requests during play. Deploy `dist/` to static hosting with the included `staticwebapp.config.json`; it sends security headers, cache rules for immutable assets, and a styled 404 response.

Visual direction and original-image provenance are recorded in `.factory/design.md`. The demo details are in `.factory/demo.md`.

## License

MIT. See [LICENSE](LICENSE).
