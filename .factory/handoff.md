# Couch Creatures handoff

## What shipped

- A complete, deterministic Canvas 2D rescue game with three habitats,
  12 creatures, shared A/D and J/L lanes, large touch pads, pause/resume,
  local assist and sound settings, and a group-postcard ending.
- A one-click `/demo` sandbox using the `demo:couch-creatures:` storage
  namespace, Reset demo, and Start for real controls.
- Product routes for home, demo, privacy, terms, and a styled 404; static
  deployment configuration, metadata, sitemap, robots, security headers, and
  original generated visual artwork.
- Accessibility checks in Playwright/Axe plus claim tests for completion,
  replay, settings persistence, local-only requests, and both input modes.

## Verification

Run from a clean checkout:

```sh
npm install
npm test
npm run build
```

Verified on 2026-09-02:

- `npm test`: 6 Playwright tests passed.
- `npm run build`: passed; output is `dist/` with `index.html` at its root.
- Axe serious/critical checks passed on `/`, `/demo`, `/privacy`, and `/terms`.
- Mobile visual smoke check: 390 × 844 viewport. The first screen shows the
  rescue board and the sample-start action; touch controls remain 56px.
- Lighthouse mobile categories: Performance 94, Accessibility 100, Best
  Practices 96, SEO 100. The CLI wrote this report before its headless browser
  process terminated, so the scores are recorded as a smoke measurement rather
  than a stable CI artifact.
- Built JavaScript is 15.01 KB raw / 5.58 KB gzip. Built CSS is 6.89 KB raw /
  2.17 KB gzip. The hero/world image is 93 KB WebP.

## Known gaps and next steps

- Touch pads work on the shared screen. A true phone-as-controller path needs
  a product-owned realtime signaling service; it is not included in this
  static deployment. The game does not claim remote phone control.
- The game has no sound effects yet; the persisted mute setting is present so
  audio can be added after a user gesture without changing the privacy model.
- The generated source PNG is retained in `assets/src/`; the shipped image is
  the optimized `public/moss-rescue.webp`.
