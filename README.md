# Couch Creatures

Guide shy creatures home in a gentle shared-screen game for families using one
laptop or TV. A full rescue takes 8–12 minutes for 2–4 players. Use one shared
keyboard or the on-screen touch pads. There are no accounts, purchases, ads,
or player profiles.

Try the isolated sample game at `/demo`. It uses the `demo:couch-creatures:`
localStorage namespace. Reset demo removes its settings. Real play only keeps
optional assist and sound settings in your browser.

## Run it

```sh
npm install
npm run dev
```

Open `http://localhost:5173/demo` to start the three-habitat rescue. Player one
uses A/D. Player two uses J/L. On a touch screen, use the labelled pads below
the rescue board. Escape pauses a run. The Help herd creatures control is an
accessible assist option.

## Test and build

```sh
npm test
npm run build
```

`npm run build` creates the static site in `dist/`, ready for static deployment.
The Playwright suite checks every product claim in `.factory/claims.json`.

## Product details

The game is for parents, siblings, and children sharing one display. Each run
has three habitats, four creatures per habitat, and a group postcard at the
end. Route markings, creature colors, and weather vary by habitat. Settings
stay local.

The visual direction, generated-art provenance, and accessibility decisions are
in `.factory/design.md`. The demo contract is in `.factory/demo.md`.

## Deploy

Deploy the contents of `dist/` to static hosting. The included
`staticwebapp.config.json` provides SPA navigation fallback and security headers.

## License

MIT. See [LICENSE](LICENSE).
