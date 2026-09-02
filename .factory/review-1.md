# Adversarial first-read review 1 — Couch Creatures

## Verdict: FAIL

Reviewed 2026-09-02 UTC at <https://couch-creatures.sociobot.in> from fresh desktop (1440×900) and phone (390×844) browser contexts. Candidate: `ce3341fef956b4d3ab99e4f2bf3fbcc472a5f5ef`.

Two blocking and three minor findings remain. `.factory/brief.json` is absent, so `AGENTS.md`, the design/demo records, claims manifest, and all earlier verification/handoff reports were the available scope record.

## Cold first read

Before scrolling, both screens answer the required questions.

| Question | Evidence |
| --- | --- |
| What does it do? | “Guide creatures home together.” The visible board shows creatures, lanterns, and storms. |
| Who is it for? | “For families and friends sharing one device…” |
| What do I click first? | “Try it with sample data”; adjacent text says “Starts a fixed sample route. Demo changes stay separate.” |

The real canvas starts at y=486 on desktop and y=672 on a 390px phone. The
sample action is in view at both widths. This is a real game screen, not a menu
wall. Cold loads made only same-origin requests (HTML, hashed JS/CSS, and
`moss-rescue.webp`) and generated no console or page errors.

## Findings

### Blocking

#### F-1-1 — Demo phone rooms write to the real relay despite the “nothing is saved” banner

**Location / exact text:** The `/demo` banner says “Demo — sample data,
nothing is saved”. The same page offers **Start phone room**. `.factory/demo.md`
also says “A demo may create a temporary QR phone room through the same-origin
`/api` relay.”

**Evidence:** In a fresh live `/demo` context, clicking **Start phone room**
sent `POST /api/rooms`, received room `MQ7N43`, displayed “Room MQ7N43 is
ready. Scan the QR code with a phone.”, and started polling
`GET /api/rooms/MQ7N43/moves?after=0`. `src/main.ts` makes the identical
`POST /api/rooms` request in real and demo play. The relay persists rooms,
moves, and creation limits to `/data/rooms.sqlite`
(`realtime/src/server.js`, `realtime/src/store.js`); it has no demo tenant,
demo header, or in-memory namespace.

This fails the demo-sandbox contract: demo must not read or write real storage.
It also consumes the real eight-room-per-minute allowance while the banner
promises the visitor that nothing is saved.

**Concrete fix:** Remove phone-room creation from `/demo`, or implement an
explicit demo-only endpoint using a short-lived in-memory tenant. It must not
read/write `/data/rooms.sqlite` or share the real allowance. Add a browser
claim that clicks the demo phone action and proves no production-relay write.

#### F-1-2 / CC2-008 — The deployed 404 is still not a complete site route

**Location / exact text:** Live `GET /not-a-route` returns 404, but its
independent document contains only:

```html
<header><a href="/">▰ Couch Creatures</a></header>
...
<footer>Built by Param Factory</footer>
```

It has no navigation, Privacy or Terms links, product one-line, build version,
meta description, canonical, Open Graph/Twitter tags, favicon, or theme color.

Earlier finding `CC2-008` required a standard header, footer, and skip link.
The skip link and minimal header/footer are present, but `public/404.html` is
still half-fixed: it violates the required consistent header/footer with
Privacy and Terms on every route.

**Concrete fix:** Use the same route skeleton as the SPA: wordmark, nav, skip
link, product one-line, Privacy, Terms, factory attribution, and version. Add
description, canonical, favicon, theme-color, OG/Twitter metadata, and a test
that asserts those elements and the 404 status on an unknown route.

### Minor

#### F-1-3 — Open Graph metadata stays on the home page for every SPA route

**Location / evidence:** On live `/demo`, `/privacy`, `/terms`, and
`/controller`, visible title, description, and canonical change correctly,
but `og:title` remains “Couch Creatures — Shared creature rescue” and
`og:description` remains “A nine-minute shared rescue game for two to four
local players.” `shell()` in `src/main.ts` updates only title, description,
and canonical.

**Concrete fix:** Update OG and Twitter title/description per route in
`shell()`; test all public routes.

#### F-1-4 — Material claims remain outside `.factory/claims.json`

All 12 listed claims pass, but these testable visitor claims have no matching
manifest entry and observable sandbox assertion.

| Location / exact quote | Concrete fix |
| --- | --- |
| Demo replay: “Run the same public rules at replay speed before sharing the controls.” | Add a `sample-replay` claim that observes real simulation state and both outcomes, or delete it. |
| Settings: “Assist mode widens lantern light and slows storm strikes.” | Add an `assist-mode` claim that observes both effects, or remove the claim. |
| Controls / README: “Escape pauses.” / “Escape pauses play…” | Add a `pause-control` claim that starts play, presses Escape, and verifies state stops until resume. |
| Footer: “Artwork is AI-generated and original to Couch Creatures.” | Remove this unprovable public claim; provenance belongs in `.factory/design.md`. |
| README: “Its banner can reset the sample or discard it and return to real play.” | Test Reset demo and Start for real, including preservation of real keys. |
| README: “Run recovery and assist settings remain in localStorage.” | Test assist persistence and namespace separately from run recovery. |
| README: “Phone rooms store only…” / “The relay removes expired rooms and short-lived limit records.” | Add storage-level privacy/deletion tests and claim entries, or remove the assurances. |

The README assertion “The game has no accounts, ads, purchases, or player
profiles” is also only partly covered: `free-play` checks ads/purchase UI and
`local-only` is demo-only. Add one claim for the complete statement or split
it into tested statements.

#### F-1-5 — Cold labels use unexplained jargon and weak README headings

**Location / exact text:** The first screen begins with `SEED: MOSS-…`. README
starts `# Couch Creatures` then `## Play`.

“Seed” is unexplained internal terminology in the first 30 seconds. Those README
headings do not name the reader’s task out of context.

**Concrete fix:** Remove the seed label from the landing screen (keep it in a
retry/advanced panel if useful). Rename the headings to `# A shared
creature-rescue game for families and friends` and `## How to play`.

## Copy audit

No prose sentence exceeds 22 words and no banned marketing adjective appears.
The following is the complete landing/README sentence inventory. Labels, button
captions, code blocks, and dynamic room codes are excluded; hyphenated words
count as one.

### Landing page

| Words | Sentence |
| ---: | --- |
| 4 | Guide creatures home together |
| 16 | For families and friends sharing one device, guide four creatures through storms before each shelter closes. |
| 5 | Starts a fixed sample route. |
| 4 | Demo changes stay separate. |
| 5 | No account or child profile. |
| 7 | Loaded shared-device play works without a network. |
| 6 | Free, with no ads or purchases. |
| 6 | Press a player key to begin. |
| 6 | Keep creatures away from clay storms. |
| 14 | Start a room, scan its QR code, then choose a lantern on the phone. |
| 9 | Assist mode widens lantern light and slows storm strikes. |
| 7 | Each habitat has a three-minute shelter window. |
| 11 | Shelter two creatures before time runs out or the route ends. |
| 7 | Move spare lanterns away from clay storms. |
| 2 | Escape pauses. |
| 4 | Refreshing restores this run. |
| 8 | Start with a lantern key or touch pad. |
| 10 | Shelter at least two creatures before the timer reaches zero. |
| 7 | Move lanterns clear of three clay-storm strikes. |
| 8 | A shared-screen creature rescue for 2–4 players. |
| 8 | Artwork is AI-generated and original to Couch Creatures. |

Copy flags: F-1-4 and F-1-5. No over-length, banned-word,
inconsistent-terminology, metaphor-heading, or non-result-naming-button finding
was observed.

### README

| Words | Sentence |
| ---: | --- |
| 17 | Guide shy creatures past moving clay storms in a nine-minute shared-screen rescue for two to four players. |
| 16 | Families and friends use one keyboard, labelled touch pads, or a phone paired by QR code. |
| 10 | The game has no accounts, ads, purchases, or player profiles. |
| 12 | Open `/demo` or choose **Try it with sample data** on the homepage. |
| 12 | Demo mode is an isolated, seeded run using only `demo:couch-creatures:*` browser storage. |
| 14 | Its banner can reset the sample or discard it and return to real play. |
| 10 | Each run has three habitats and three 180-second shelter windows. |
| 11 | Keep two creatures in lantern light while avoiding moving clay storms. |
| 12 | Missing a shelter window or taking three storm strikes ends the route. |
| 9 | A completed run reaches its postcard near 540 seconds. |
| 11 | Escape pauses play, and refreshing restores an active run as paused. |
| 15 | Player one uses A/D, player two J/L, player three F/H, and player four Left/Right arrows. |
| 12 | The game board also includes two 58px touch buttons for each player. |
| 8 | Loaded shared-device play continues without a network connection. |
| 13 | Select **Start phone room** on the shared screen to show a QR code. |
| 14 | A phone scans it, chooses one lantern, and sends left/right moves to that room. |
| 5 | Rooms expire after 20 minutes. |
| 15 | One connection can create eight rooms per minute; the ninth response is `429` with `Retry-After`. |
| 15 | The demo has public replay buttons for the full seeded rescue and a storm loss. |
| 18 | They run the same simulation rules at replay speed so a group can see both outcomes before playing. |
| 2 | Open `http://localhost:5173/`. |
| 14 | The development server proxies `/api` to the local SQLite room relay started by Playwright. |
| 8 | `npm run build` creates `dist/` for static deployment. |
| 11 | The Playwright suite covers every public claim listed in `.factory/claims.json`. |
| 9 | The production room relay is the product-owned `sf-couch-creatures-realtime` container. |
| 13 | It runs Hono with SQLite at `/data`, one replica, and no shared database. |
| 11 | Static Web Apps links its same-origin `/api` path to that container. |
| 7 | `GET /api/health` reports the deployed build identity. |
| 8 | Run recovery and assist settings remain in localStorage. |
| 7 | Demo and real play use separate namespaces. |
| 6 | Shared-device play makes no cross-origin requests. |
| 17 | Phone rooms store only room codes, direction presses, and a one-way connection hash for the creation limit. |
| 9 | The relay removes expired rooms and short-lived limit records. |
| 11 | Deploy `dist/` to static hosting with the included `staticwebapp.config.json`. |
| 13 | It sets security headers, immutable asset cache rules, and a styled 404 response. |
| 14 | Deploy `realtime/Dockerfile` separately and link it as the Static Web Apps backend for `/api`. |
| 10 | Visual direction and original-image provenance are recorded in `.factory/design.md`. |
| 7 | The demo details are in `.factory/demo.md`. |

Copy flags: F-1-4 and F-1-5. No README sentence exceeds 22 words.

## Verification summary

- The first-screen sample action enters `/demo` in one click. Its first
  screen immediately shows the fixed-seed board and banner. Reset and Start for
  real clear only browser keys with the `demo:couch-creatures:` prefix.
  F-1-1 is the server-persistence exception.
- The normal demo movement journey used only same-origin requests and demo
  browser keys. Offline loaded play, four local controls, loss, end, restart,
  recovery, and the 55fps floor passed their listed tests.
- After `npm ci`, every exact manifest command passed. `npm run test:all`
  passed 14 Playwright and 3 relay tests; `npm run test:phone-claim` passed
  live; `npm run build` produced `dist/`; `npm audit --json` reported no
  vulnerabilities. The frame-rate claim measured 60.14 fps at 390px under 4×
  slowdown.
- Earlier CC-001 through CC-010, CC2-001 through CC2-007, and CC3-001 through
  CC3-010 are fixed in live behavior and current code. `CC2-008` is still
  half-fixed as F-1-2.
- `/`, `/demo`, `/privacy`, `/terms`, and `/controller` returned 200;
  `/not-a-route` returned 404. Crawled links/assets resolved. Valid SPA routes
  have one h1, main, title, description, canonical, focus/aria-live route
  change, and no cold-load console error. The static 404 exception is F-1-2.
- The social image is 1200×630, the touch icon 180×180, and the concrete/moss
  identity is distinct rather than generic. No AI feature is implied by the
  available scope; adding one would be decorative. Phone input, replay, local
  play, and route persistence cover the obvious non-AI leverage.

## What would make this perfect

Make demo phone control genuinely sandboxed or unavailable in demo; make the
404 use the standard skeleton and complete metadata; update route-specific
social metadata; test or remove every remaining claim; and remove the
unexplained seed label while making README headings task-specific. Then a fresh
review can return PASS with zero findings.

