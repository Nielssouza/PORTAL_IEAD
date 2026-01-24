import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { hashPassword } from "./password";

let db: Database.Database | null = null;

function getDbPath() {
  return path.join(process.cwd(), "data", "portal.db");
}

function initDb(database: Database.Database) {
  database.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `);

  const existingAdmin = database
    .prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    .get();

  if (!existingAdmin) {
    const email = process.env.ADMIN_EMAIL ?? "admin@iead.local";
    const password = process.env.ADMIN_PASSWORD ?? "Admin@123";
    const now = new Date().toISOString();
    const hash = hashPassword(password);

    database
      .prepare(
        "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'admin', ?)"
      )
      .run("Administrador", email, hash, now);
  }
}

export function getDb() {
  if (!db) {
    const dbPath = getDbPath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    initDb(db);
  }

  return db;
}
