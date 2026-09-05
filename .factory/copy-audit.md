# Couch Creatures copy audit

Audited from the rendered game routes and README on 2026-09-05. Hyphenated
terms count as one word. Headings and action labels are included where they
carry meaning. No sentence exceeds 22 words. No banned marketing term,
unexplained technical label, metaphor heading, or inconsistent product term
remains.

## Home and game copy

| Words | Copy | Result |
| ---: | --- | --- |
| 2 | Shared rescue | Pass |
| 4 | Guide creatures home together | Pass |
| 16 | For families and friends sharing one device, guide four creatures through storms before each shelter closes. | Pass |
| 5 | Try it with sample data | Pass |
| 5 | Starts a fixed sample route. | Pass |
| 4 | Demo changes stay separate. | Pass |
| 5 | No account or child profile. | Pass |
| 7 | Loaded shared-device play works without a network. | Pass |
| 6 | Free, with no ads or purchases. | Pass |
| 5 | Habitat 1 of 3: Drainway. | Pass |
| 3 | 0 creatures ready. | Pass |
| 3 | 180 seconds remain. | Pass |
| 6 | Press a player key to begin | Pass |
| 6 | Keep creatures away from clay storms | Pass |
| 4 | Add a phone controller | Pass |
| 13 | Start a room, scan its QR code, then choose a lantern on the phone. | Pass |
| 9 | Assist mode widens lantern light and slows storm strikes | Pass |
| 7 | Each habitat has a three-minute shelter window. | Pass |
| 11 | Shelter two creatures before time runs out or the route ends. | Pass |
| 7 | Move spare lanterns away from clay storms. | Pass |
| 2 | Escape pauses. | Pass |
| 4 | Refreshing restores this run. | Pass |
| 4 | How this rescue works | Pass |
| 8 | Start with a lantern key or touch pad. | Pass |
| 10 | Shelter at least two creatures before the timer reaches zero. | Pass |
| 8 | Move lanterns clear of three clay-storm strikes. | Pass |
| 7 | A shared-screen creature rescue for 2–4 players. | Pass |

## Demo, legal, controller, and 404 copy

| Words | Copy | Result |
| ---: | --- | --- |
| 6 | Demo — sample data, nothing is saved | Pass |
| 3 | Fixed sample route | Pass |
| 4 | Watch the sample route | Pass |
| 8 | See how the fixed sample can finish or fail. | Pass |
| 7 | Phone rooms stay off in the demo | Pass |
| 7 | Use the keyboard or touch pads above. | Pass |
| 7 | Start for real to pair a phone. | Pass |
| 7 | Use your phone as a lantern controller | Pass |
| 16 | Enter the room code shown on the shared game, choose a lantern, then use the large direction buttons. | Pass |
| 4 | Privacy for shared play | Pass |
| 11 | Couch Creatures does not ask for names, accounts, photos, contacts, or location. | Pass |
| 9 | Run recovery and assist mode stay in this browser. | Pass |
| 15 | The relay stores a random room code, control presses, expiry times, and a one-way connection hash. | Pass |
| 7 | It deletes expired room and creation-limit records. | Pass |
| 15 | The demo uses separate browser storage and never contacts the phone-room relay. | Pass |
| 6 | Reset demo clears only the sample. | Pass |
| 7 | Couch Creatures is free to play and has no purchases. | Pass |
| 3 | Page not found | Pass |
| 9 | The requested page does not exist. Return to the game. | Pass |

## README copy

| Words | Sentence | Result |
| ---: | --- | --- |
| 17 | Guide shy creatures past moving clay storms in a nine-minute shared-screen rescue for two to four players. | Pass |
| 16 | Families and friends use one keyboard, labelled touch pads, or a phone paired by QR code. | Pass |
| 10 | The game has no accounts, ads, purchases, or player profiles. | Pass |
| 12 | Open `/demo` or choose **Try it with sample data** on the homepage. | Pass |
| 11 | Demo mode is a fixed run using only `demo:couch-creatures:*` browser storage. | Pass |
| 13 | Its banner resets the sample or clears it before returning to real play. | Pass |
| 7 | The demo never contacts the phone-room relay. | Pass |
| 10 | Each run has three habitats and three 180-second shelter windows. | Pass |
| 11 | Keep two creatures in lantern light while avoiding moving clay storms. | Pass |
| 12 | Missing a shelter window or taking three storm strikes ends the route. | Pass |
| 9 | A completed run reaches its postcard near 540 seconds. | Pass |
| 5 | Escape pauses and resumes play. | Pass |
| 8 | Refreshing restores an active run as paused. | Pass |
| 15 | Player one uses A/D, player two J/L, player three F/H, and player four Left/Right arrows. | Pass |
| 12 | The game board also includes two 58px touch buttons for each player. | Pass |
| 8 | Loaded shared-device play continues without a network connection. | Pass |
| 10 | Start real play, then select **Start phone room** to show a QR code. | Pass |
| 13 | A phone scans it, chooses one lantern, and sends left or right moves. | Pass |
| 5 | Rooms expire after 20 minutes. | Pass |
| 15 | One connection can create eight rooms per minute; the ninth response is `429` with `Retry-After`. | Pass |
| 15 | The demo has public replay buttons for the full fixed rescue and a storm loss. | Pass |
| 2 | Open `http://localhost:5173/`. | Pass |
| 14 | The development server proxies `/api` to the local SQLite room relay started by Playwright. | Pass |
| 8 | `npm run build` creates `dist/` for static deployment. | Pass |
| 10 | The exact public claim checks are listed in `.factory/claims.json`. | Pass |
| 9 | The production room relay is the product-owned `sf-couch-creatures-realtime` container. | Pass |
| 13 | It runs Hono with SQLite at `/data`, one replica, and no shared database. | Pass |
| 11 | Static Web Apps links its same-origin `/api` path to that container. | Pass |
| 7 | `GET /api/health` reports the deployed build identity. | Pass |
| 5 | Active-run recovery remains in localStorage. | Pass |
| 7 | Assist mode remains enabled after reload. | Pass |
| 7 | Demo and real play use separate namespaces. | Pass |
| 6 | Shared-device play makes no cross-origin requests. | Pass |
| 13 | Phone rooms store random room codes, control presses, expiry times, and a one-way connection hash. | Pass |
| 8 | The relay removes expired room and creation-limit records. | Pass |
| 11 | Deploy `dist/` to static hosting with the included `staticwebapp.config.json`. | Pass |
| 14 | It sets security headers, immutable asset cache rules, and a complete styled 404 response. | Pass |
| 14 | Deploy `realtime/Dockerfile` separately and link it as the Static Web Apps backend for `/api`. | Pass |
| 10 | Visual direction and original-image provenance are recorded in `.factory/design.md`. | Pass |
| 7 | The demo details are in `.factory/demo.md`. | Pass |

## Terminology

| Concept | One term used |
| --- | --- |
| A complete play session | run |
| A timed area | habitat |
| A player's movable light | lantern |
| The timed safe destination | shelter |
| Remote input session | phone room |
| Isolated sample state | demo |
| End-of-run summary | postcard |
