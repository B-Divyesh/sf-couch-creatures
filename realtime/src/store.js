import { randomInt } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

export const ROOM_TTL_MS = 20 * 60 * 1000;
export const CREATE_LIMIT = 8;
export const CREATE_WINDOW_MS = 60 * 1000;
export const MOVE_BUFFER = 120;

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function roomCode() {
  return Array.from(
    { length: 6 },
    () => alphabet[randomInt(alphabet.length)],
  ).join("");
}

export function createStore(path = ":memory:") {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      code TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      last_cursor INTEGER NOT NULL DEFAULT 0
    ) STRICT;
    CREATE TABLE IF NOT EXISTS moves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
      player INTEGER NOT NULL,
      direction INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    ) STRICT;
    CREATE INDEX IF NOT EXISTS moves_room_cursor ON moves(room_code, id);
    CREATE TABLE IF NOT EXISTS create_limits (
      client_key TEXT PRIMARY KEY,
      window_started_at INTEGER NOT NULL,
      count INTEGER NOT NULL
    ) STRICT;
  `);

  const statements = {
    cleanRooms: db.prepare("DELETE FROM rooms WHERE expires_at <= ?"),
    cleanLimits: db.prepare(
      "DELETE FROM create_limits WHERE window_started_at + ? <= ?",
    ),
    getLimit: db.prepare(
      "SELECT window_started_at, count FROM create_limits WHERE client_key = ?",
    ),
    saveLimit: db.prepare(`
      INSERT INTO create_limits(client_key, window_started_at, count) VALUES (?, ?, ?)
      ON CONFLICT(client_key) DO UPDATE SET window_started_at = excluded.window_started_at, count = excluded.count
    `),
    insertRoom: db.prepare("INSERT INTO rooms(code, expires_at) VALUES (?, ?)"),
    getRoom: db.prepare(
      "SELECT code, expires_at, last_cursor FROM rooms WHERE code = ? AND expires_at > ?",
    ),
    deleteRoom: db.prepare("DELETE FROM rooms WHERE code = ?"),
    insertMove: db.prepare(
      "INSERT INTO moves(room_code, player, direction, created_at) VALUES (?, ?, ?, ?)",
    ),
    updateCursor: db.prepare("UPDATE rooms SET last_cursor = ? WHERE code = ?"),
    trimCutoff: db.prepare(
      "SELECT id FROM moves WHERE room_code = ? ORDER BY id DESC LIMIT 1 OFFSET ?",
    ),
    trimMoves: db.prepare("DELETE FROM moves WHERE room_code = ? AND id < ?"),
    readMoves: db.prepare(
      "SELECT id, player, direction FROM moves WHERE room_code = ? AND id > ? ORDER BY id ASC",
    ),
  };

  function transaction(work) {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = work();
      db.exec("COMMIT");
      return result;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  function createRoom(clientKey, now = Date.now()) {
    return transaction(() => {
      statements.cleanRooms.run(now);
      statements.cleanLimits.run(CREATE_WINDOW_MS, now);
      const current = statements.getLimit.get(clientKey);
      const active =
        current && current.window_started_at + CREATE_WINDOW_MS > now;
      const windowStartedAt = active ? current.window_started_at : now;
      const count = active ? current.count : 0;
      if (count >= CREATE_LIMIT) {
        return {
          limited: true,
          retryAfter: Math.max(
            1,
            Math.ceil((windowStartedAt + CREATE_WINDOW_MS - now) / 1000),
          ),
        };
      }
      statements.saveLimit.run(clientKey, windowStartedAt, count + 1);
      const expiresAt = now + ROOM_TTL_MS;
      let code = roomCode();
      while (statements.getRoom.get(code, now)) code = roomCode();
      statements.insertRoom.run(code, expiresAt);
      return { limited: false, code, expiresAt };
    });
  }

  function cleanup(now = Date.now()) {
    return transaction(() => {
      statements.cleanRooms.run(now);
      statements.cleanLimits.run(CREATE_WINDOW_MS, now);
    });
  }

  function getRoom(code, now = Date.now()) {
    const room = statements.getRoom.get(code, now);
    if (!room) statements.deleteRoom.run(code);
    return room;
  }

  function addMove(code, player, direction, now = Date.now()) {
    return transaction(() => {
      const room = statements.getRoom.get(code, now);
      if (!room) {
        statements.deleteRoom.run(code);
        return undefined;
      }
      const inserted = statements.insertMove.run(code, player, direction, now);
      const cursor = Number(inserted.lastInsertRowid);
      statements.updateCursor.run(cursor, code);
      const cutoff = statements.trimCutoff.get(code, MOVE_BUFFER - 1);
      if (cutoff) statements.trimMoves.run(code, cutoff.id);
      return cursor;
    });
  }

  function movesAfter(code, after, now = Date.now()) {
    const room = getRoom(code, now);
    if (!room) return undefined;
    return {
      cursor: Number(room.last_cursor),
      moves: statements.readMoves.all(code, after).map((move) => ({
        cursor: Number(move.id),
        player: move.player,
        direction: move.direction,
      })),
    };
  }

  return {
    createRoom,
    getRoom,
    addMove,
    movesAfter,
    cleanup,
    close: () => db.close(),
  };
}
