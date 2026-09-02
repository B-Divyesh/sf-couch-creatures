# Couch Creatures verification handoff

## Status: FAIL

Independent QA was completed on 2026-09-02 for candidate
`994b10c166bedb07ffdd44e775aeab048ff4bf84` at
<https://couch-creatures.sociobot.in>. The live HTML and production assets are
byte-identical to the candidate build. No product code was modified.

The full evidence and severity-ranked defect list are in
[`.factory/verification.md`](verification.md).

## Release blockers

- The homepage **Try it with sample data** action routes to `/demo` without
  entering demo mode. It omits the banner and writes settings to the real
  namespace; reload then switches namespaces and appears to lose them.
- The game has no loss condition, hazards, randomized route layouts, or
  creature traits. Replay begins from the identical canvas and fixed seed.
- The advertised 8–12 minute run completed by normal keyboard play in 15.81
  seconds.
- The product advertises 2–4 players but implements only two. The brief's QR
  phone-controller mode is absent.
- Active rescue progress resets on refresh.
- Public claims are missing from `.factory/claims.json`, several are false,
  and several listed claim tests do not assert the promised behavior.

## Verification summary

- Mandatory cold first-read presentation: PASS.
- `npm ci`: PASS.
- Five exact claim commands after installation: PASS, one test each.
- `npm test`: PASS, 6/6.
- `npm run build`: PASS; TypeScript and Vite production build completed.
- Live deterministic title → play → postcard → restart: reachable and reset
  works.
- Privacy request log: same-origin only; no console/page/request errors.
- Security headers: CSP, HSTS, nosniff, and Referrer-Policy present.
- Axe serious/critical: zero on five routes at desktop and 390 px.
- Measured active-game frame rate: 60.20 fps under 4× CPU throttle at 390 px.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 96 Best Practices,
  100 SEO; LCP 1.714 s and CLS 0.
- Bundle: 15,030 B JS, 6,934 B CSS, 94,412 B WebP.

Additional defects include a vertically stretched 358 × 800 landing image on
mobile, undersized navigation/footer/demo targets, focus loss after SPA route
changes, HTTP 200 for unknown routes, 30-second caching on hashed assets,
incorrect social/icon dimensions, and vulnerable development dependencies.

## Re-run

```sh
npm ci
npm test
npm run build
```

For acceptance, repeat the primary homepage-to-demo journey in a fresh browser
context and complete the game using the advertised player controls rather than
the **Help herd creatures** test shortcut.
