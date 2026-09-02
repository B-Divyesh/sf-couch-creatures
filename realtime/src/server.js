import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { createStore } from "./store.js";

const databasePath =
  process.env.DATABASE_PATH ||
  (process.env.NODE_ENV === "test" ? ":memory:" : "/data/rooms.sqlite");
if (databasePath !== ":memory:")
  mkdirSync(dirname(databasePath), { recursive: true });
const store = await createStore(databasePath);
const port = Number(process.env.PORT || 8787);
store.cleanup();
const cleanupTimer = setInterval(() => store.cleanup(), 60_000);
cleanupTimer.unref();

serve({ fetch: createApp(store).fetch, port }, (info) => {
  console.log(`Couch Creatures room relay listening on ${info.port}`);
});

function shutdown() {
  clearInterval(cleanupTimer);
  store.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
