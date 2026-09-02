import assert from "node:assert/strict";
import test from "node:test";
import {
  CREATE_LIMIT,
  CREATE_WINDOW_MS,
  MOVE_BUFFER,
  ROOM_TTL_MS,
  createStore,
} from "../src/store.js";

test("room creation enforces eight per minute and reports the remaining wait", () => {
  const store = createStore();
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

test("room expiry is enforced at the advertised 20-minute boundary", () => {
  const store = createStore();
  const now = 2_000_000;
  const room = store.createRoom("family-b", now);
  assert.ok(store.getRoom(room.code, now + ROOM_TTL_MS - 1));
  assert.equal(store.getRoom(room.code, now + ROOM_TTL_MS), undefined);
  assert.equal(store.addMove(room.code, 0, 1, now + ROOM_TTL_MS), undefined);
  store.close();
});

test("the move cursor advances after the retained buffer fills", () => {
  const store = createStore();
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
