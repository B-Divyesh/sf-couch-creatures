# Review 1 handoff — Couch Creatures

## Result

Independent adversarial review completed on 2026-09-02 UTC. Result: **FAIL**.
No product source, deployment configuration, service, or infrastructure was
modified. The complete evidence is in `.factory/review-1.md`.

## Verified

- Cold live desktop and 390px mobile first-read, demo entry, request log,
  routing/focus, metadata, 404, links, and responsive board.
- `npm ci`, each claim command, `npm run test:all`,
  `npm run test:phone-claim`, `npm run build`, and `npm audit --json`.
- Current live phone-room behavior, current source, and every earlier review
  finding.

## Remaining blockers

1. Demo play creates real SQLite-backed phone rooms through `POST /api/rooms`
   while its banner promises “nothing is saved.”
2. The standalone live 404 is still only a partial site route. It lacks the
   standard header/footer and required metadata; this is the remaining part of
   earlier finding `CC2-008`.

## Other findings

SPA Open Graph metadata is stale on non-home routes. Several material claims
lack manifest tests, and the seed label/README headings need plain-language
cleanup. Exact quotes and fixes are in the review.

## Re-run

```sh
npm ci
npm run test:all
npm run test:phone-claim
npm run build
```

A repair must add an explicit demo-phone test proving no demo action can write
to the production relay.
