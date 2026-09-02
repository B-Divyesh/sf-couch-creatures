import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { createHash } from "node:crypto";
import {
  CREATE_LIMIT,
  CREATE_WINDOW_MS,
  MOVE_BUFFER,
  ROOM_TTL_MS,
} from "./store.js";

const codePattern = /^[A-HJ-NP-Z2-9]{6}$/;

function clientKey(request) {
  const address = (
    request.header("x-forwarded-for") ||
    request.header("x-real-ip") ||
    "unknown"
  )
    .split(",")[0]
    .trim()
    .slice(0, 96);
  return createHash("sha256")
    .update(`couch-creatures-room-limit:${address}`)
    .digest("hex");
}

function buildInfo() {
  return {
    ok: true,
    service: "couch-creatures-room-relay",
    build: process.env.BUILD_SHA || "dev",
    storage: "sqlite",
    roomTtlSeconds: ROOM_TTL_MS / 1000,
    createLimit: {
      count: CREATE_LIMIT,
      windowSeconds: CREATE_WINDOW_MS / 1000,
    },
    moveBuffer: MOVE_BUFFER,
  };
}

export function createApp(store) {
  const app = new Hono();

  app.use(
    "/api/*",
    cors({
      origin: (origin) =>
        origin === "https://couch-creatures.sociobot.in" ||
        /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)
          ? origin
          : "",
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
      maxAge: 600,
    }),
  );
  app.use(
    "/api/*",
    secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
      referrerPolicy: "no-referrer",
      strictTransportSecurity: "max-age=31536000; includeSubDomains",
    }),
  );
  app.use("/api/*", async (context, next) => {
    await next();
    context.header("Cache-Control", "no-store");
  });

  app.get("/api/health", (context) => context.json(buildInfo()));
  app.get("/api/version", (context) => context.json(buildInfo()));
  app.get("/api/build", (context) => context.json(buildInfo()));

  app.post("/api/rooms", (context) => {
    const created = store.createRoom(clientKey(context.req));
    if (created.limited) {
      context.header("Retry-After", String(created.retryAfter));
      return context.json(
        {
          error:
            "Eight rooms were created from this connection. Try again after the wait shown.",
        },
        429,
      );
    }
    return context.json(
      {
        room: created.code,
        expiresAt: new Date(created.expiresAt).toISOString(),
      },
      201,
    );
  });

  app.on(["GET", "POST"], "/api/rooms/:room/moves", async (context) => {
    const code = context.req.param("room").toUpperCase();
    if (!codePattern.test(code))
      return context.json(
        { error: "Use the six-character room code shown on the game." },
        400,
      );

    if (context.req.method === "POST") {
      let move;
      try {
        move = await context.req.json();
      } catch {
        return context.json(
          { error: "Send a JSON move with a lantern number and direction." },
          400,
        );
      }
      if (
        !Number.isInteger(move?.player) ||
        move.player < 0 ||
        move.player > 3 ||
        ![-1, 1].includes(move?.direction)
      ) {
        return context.json(
          { error: "Choose lantern 1–4 and move left or right." },
          400,
        );
      }
      const cursor = store.addMove(code, move.player, move.direction);
      if (cursor === undefined)
        return context.json(
          { error: "Room not found or expired. Start a new phone room." },
          404,
        );
      return context.json({ ok: true, cursor }, 202);
    }

    const rawAfter = Number(context.req.query("after") || 0);
    const after =
      Number.isSafeInteger(rawAfter) && rawAfter >= 0 ? rawAfter : 0;
    const result = store.movesAfter(code, after);
    if (!result)
      return context.json(
        { error: "Room not found or expired. Start a new phone room." },
        404,
      );
    return context.json(result);
  });

  app.notFound((context) =>
    context.json({ error: "API route not found." }, 404),
  );
  app.onError((error, context) => {
    console.error("Room relay request failed", error);
    return context.json(
      { error: "The room service had a problem. Try again." },
      500,
    );
  });

  return app;
}
