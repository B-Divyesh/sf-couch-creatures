import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import initSqlJs from "sql.js";
import { createApp } from "../src/app.js";
import {
  CREATE_LIMIT,
  CREATE_WINDOW_MS,
  MOVE_BUFFER,
  ROOM_TTL_MS,
  createStore,
} from "../src/store.js";

test("room creation enforces eight per minute and reports the remaining wait", async () => {
  const store = await createStore();
  const now = 1_000_000;
  const rooms = Array.from({ length: CREATE_LIMIT }, () =>
    store.createRoom("family-a", now),
  );
  assert.ok(rooms.every((room) => !room.limited));
  assert.equal(rooms[0].expiresAt, now + ROOM_TTL_MS);
  assert.deepEqual(store.createRoom("family-a", now), {
    limited: true,
    retryAfter: 60,
  });
  assert.equal(
    store.createRoom("family-a", now + CREATE_WINDOW_MS).limited,
    false,
  );
  store.close();
});

test("room expiry is enforced at the advertised 20-minute boundary", async () => {
  const store = await createStore();
  const now = 2_000_000;
  const room = store.createRoom("family-b", now);
  assert.ok(store.getRoom(room.code, now + ROOM_TTL_MS - 1));
  assert.equal(store.getRoom(room.code, now + ROOM_TTL_MS), undefined);
  assert.equal(store.addMove(room.code, 0, 1, now + ROOM_TTL_MS), undefined);
  store.close();
});

test("the move cursor advances after the retained buffer fills", async () => {
  const store = await createStore();
  const now = 3_000_000;
  const room = store.createRoom("family-c", now);
  for (let index = 0; index < MOVE_BUFFER; index++)
    store.addMove(room.code, index % 4, index % 2 ? 1 : -1, now + index);
  const full = store.movesAfter(room.code, 0, now + MOVE_BUFFER);
  assert.equal(full.moves.length, MOVE_BUFFER);
  const previousCursor = full.cursor;
  store.addMove(room.code, 2, -1, now + MOVE_BUFFER + 1);
  const next = store.movesAfter(
    room.code,
    previousCursor,
    now + MOVE_BUFFER + 2,
  );
  assert.equal(next.cursor, previousCursor + 1);
  assert.deepEqual(next.moves, [
    { cursor: previousCursor + 1, player: 2, direction: -1 },
  ]);
  assert.equal(
    store.movesAfter(room.code, 0, now + MOVE_BUFFER + 2).moves.length,
    MOVE_BUFFER,
  );
  store.close();
});

test("@claim:phone-data SQLite stores only room operations and cleanup removes expired records", async () => {
  const directory = mkdtempSync(join(tmpdir(), "couch-creatures-privacy-"));
  const databasePath = join(directory, "rooms.sqlite");
  const address = "203.0.113.42";
  const startedAt = Date.now();
  try {
    const store = await createStore(databasePath);
    const app = createApp(store);
    const createdResponse = await app.request("http://localhost/api/rooms", {
      method: "POST",
      headers: { "x-forwarded-for": address },
    });
    assert.equal(createdResponse.status, 201);
    const created = await createdResponse.json();
    const moveResponse = await app.request(
      `http://localhost/api/rooms/${created.room}/moves`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": address,
        },
        body: JSON.stringify({ player: 2, direction: -1 }),
      },
    );
    assert.equal(moveResponse.status, 202);
    store.close();

    const bytes = readFileSync(databasePath);
    assert.equal(bytes.includes(Buffer.from(address)), false);
    const SQL = await initSqlJs();
    const database = new SQL.Database(bytes);
    const select = (sql) => {
      const result = database.exec(sql)[0];
      return result
        ? result.values.map((values) =>
            Object.fromEntries(
              result.columns.map((column, index) => [column, values[index]]),
            ),
          )
        : [];
    };
    const rooms = select("SELECT code, expires_at, last_cursor FROM rooms");
    const moves = select(
      "SELECT room_code, player, direction, created_at FROM moves",
    );
    const limits = select(
      "SELECT client_key, window_started_at, count FROM create_limits",
    );
    assert.equal(rooms.length, 1);
    assert.equal(rooms[0].code, created.room);
    assert.equal(moves.length, 1);
    assert.deepEqual(
      {
        room_code: moves[0].room_code,
        player: moves[0].player,
        direction: moves[0].direction,
      },
      { room_code: created.room, player: 2, direction: -1 },
    );
    assert.equal(limits.length, 1);
    assert.match(String(limits[0].client_key), /^[a-f0-9]{64}$/);
    assert.equal(limits[0].count, 1);
    database.close();

    const reopened = await createStore(databasePath);
    reopened.cleanup(startedAt + ROOM_TTL_MS + 1_000);
    reopened.close();
    const cleaned = new SQL.Database(readFileSync(databasePath));
    assert.equal(cleaned.exec("SELECT * FROM rooms")[0], undefined);
    assert.equal(cleaned.exec("SELECT * FROM moves")[0], undefined);
    assert.equal(cleaned.exec("SELECT * FROM create_limits")[0], undefined);
    cleaned.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
