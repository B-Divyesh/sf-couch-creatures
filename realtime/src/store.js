import { randomInt } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import initSqlJs from "sql.js";

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

export async function createStore(path = ":memory:") {
  const SQL = await initSqlJs();
  const saved =
    path !== ":memory:" && existsSync(path) && readFileSync(path).byteLength > 0
      ? readFileSync(path)
      : undefined;
  const db = saved ? new SQL.Database(saved) : new SQL.Database();
  db.run("PRAGMA foreign_keys = ON");
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      code TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      last_cursor INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS moves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
      player INTEGER NOT NULL,
      direction INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS moves_room_cursor ON moves(room_code, id);
    CREATE TABLE IF NOT EXISTS create_limits (
      client_key TEXT PRIMARY KEY,
      window_started_at INTEGER NOT NULL,
      count INTEGER NOT NULL
    );
  `);

  const one = (sql, parameters = []) => {
    const statement = db.prepare(sql);
    try {
      statement.bind(parameters);
      return statement.step() ? statement.getAsObject() : undefined;
    } finally {
      statement.free();
    }
  };
  const all = (sql, parameters = []) => {
    const statement = db.prepare(sql);
    const rows = [];
    try {
      statement.bind(parameters);
      while (statement.step()) rows.push(statement.getAsObject());
      return rows;
    } finally {
      statement.free();
    }
  };
  const persist = () => {
    if (path === ":memory:") return;
    const next = `${path}.next`;
    writeFileSync(next, db.export());
    renameSync(next, path);
  };
  const transaction = (work) => {
    db.run("BEGIN IMMEDIATE");
    try {
      const result = work();
      db.run("COMMIT");
      persist();
      return result;
    } catch (error) {
      db.run("ROLLBACK");
      throw error;
    }
  };
  const deleteExpired = (now) => {
    db.run(
      "DELETE FROM moves WHERE room_code IN (SELECT code FROM rooms WHERE expires_at <= ?)",
      [now],
    );
    db.run("DELETE FROM rooms WHERE expires_at <= ?", [now]);
    db.run("DELETE FROM create_limits WHERE window_started_at + ? <= ?", [
      CREATE_WINDOW_MS,
      now,
    ]);
  };

  function createRoom(clientKey, now = Date.now()) {
    return transaction(() => {
      deleteExpired(now);
      const current = one(
        "SELECT window_started_at, count FROM create_limits WHERE client_key = ?",
        [clientKey],
      );
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
      db.run(
        `INSERT INTO create_limits(client_key, window_started_at, count) VALUES (?, ?, ?)
         ON CONFLICT(client_key) DO UPDATE SET window_started_at = excluded.window_started_at, count = excluded.count`,
        [clientKey, windowStartedAt, count + 1],
      );
      const expiresAt = now + ROOM_TTL_MS;
      let code = roomCode();
      while (one("SELECT code FROM rooms WHERE code = ?", [code]))
        code = roomCode();
      db.run("INSERT INTO rooms(code, expires_at) VALUES (?, ?)", [
        code,
        expiresAt,
      ]);
      return { limited: false, code, expiresAt };
    });
  }

  function getRoom(code, now = Date.now()) {
    return one(
      "SELECT code, expires_at, last_cursor FROM rooms WHERE code = ? AND expires_at > ?",
      [code, now],
    );
  }

  function addMove(code, player, direction, now = Date.now()) {
    return transaction(() => {
      const room = getRoom(code, now);
      if (!room) {
        db.run("DELETE FROM rooms WHERE code = ?", [code]);
        return undefined;
      }
      db.run(
        "INSERT INTO moves(room_code, player, direction, created_at) VALUES (?, ?, ?, ?)",
        [code, player, direction, now],
      );
      const cursor = Number(one("SELECT last_insert_rowid() AS id").id);
      db.run("UPDATE rooms SET last_cursor = ? WHERE code = ?", [cursor, code]);
      const cutoff = one(
        "SELECT id FROM moves WHERE room_code = ? ORDER BY id DESC LIMIT 1 OFFSET ?",
        [code, MOVE_BUFFER - 1],
      );
      if (cutoff)
        db.run("DELETE FROM moves WHERE room_code = ? AND id < ?", [
          code,
          cutoff.id,
        ]);
      return cursor;
    });
  }

  function movesAfter(code, after, now = Date.now()) {
    const room = getRoom(code, now);
    if (!room) return undefined;
    return {
      cursor: Number(room.last_cursor),
      moves: all(
        "SELECT id, player, direction FROM moves WHERE room_code = ? AND id > ? ORDER BY id ASC",
        [code, after],
      ).map((move) => ({
        cursor: Number(move.id),
        player: Number(move.player),
        direction: Number(move.direction),
      })),
    };
  }

  function cleanup(now = Date.now()) {
    return transaction(() => deleteExpired(now));
  }

  persist();
  return {
    createRoom,
    getRoom,
    addMove,
    movesAfter,
    cleanup,
    close: () => {
      persist();
      db.close();
    },
  };
}
