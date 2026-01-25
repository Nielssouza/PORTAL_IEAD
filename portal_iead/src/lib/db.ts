import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { hashPassword } from "./password";

let db: Database.Database | null = null;

function getDbPath() {
  return path.join(process.cwd(), "data", "portal.db");
}

function getTableColumns(database: Database.Database, table: string) {
  const rows = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name: string;
  }>;
  return new Set(rows.map((row) => row.name));
}

function ensureColumn(
  database: Database.Database,
  table: string,
  columns: Set<string>,
  name: string,
  definition: string
) {
  if (columns.has(name)) return false;
  database.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  columns.add(name);
  return true;
}

function initDb(database: Database.Database) {
  database.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      cpf TEXT UNIQUE,
      father_name TEXT,
      father_cpf TEXT,
      mother_name TEXT,
      mother_cpf TEXT,
      birth_date TEXT,
      member_type TEXT,
      has_role INTEGER,
      role_title TEXT,
      baptized INTEGER,
      baptism_date TEXT,
      profession TEXT,
      education_level TEXT,
      marital_status TEXT,
      age INTEGER,
      address TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      status TEXT NOT NULL DEFAULT 'pending',
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
      slug TEXT,
      excerpt TEXT,
      cover_url TEXT,
      media_url TEXT,
      tags TEXT,
      author_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      event_time TEXT NOT NULL,
      location TEXT,
      created_by INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS page_views (
      path TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS raffles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      draw_date TEXT NOT NULL,
      sales_deadline TEXT NOT NULL,
      quota_total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Ativa',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS raffle_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raffle_id INTEGER NOT NULL,
      number TEXT NOT NULL,
      buyer TEXT NOT NULL,
      seller TEXT NOT NULL,
      paid INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      UNIQUE(raffle_id, number),
      FOREIGN KEY (raffle_id) REFERENCES raffles(id) ON DELETE CASCADE
    );
  `);

  const userColumns = getTableColumns(database, "users");
  const statusAdded = ensureColumn(
    database,
    "users",
    userColumns,
    "status",
    "status TEXT NOT NULL DEFAULT 'pending'"
  );

  ensureColumn(database, "users", userColumns, "cpf", "cpf TEXT");
  ensureColumn(database, "users", userColumns, "father_name", "father_name TEXT");
  ensureColumn(database, "users", userColumns, "father_cpf", "father_cpf TEXT");
  ensureColumn(database, "users", userColumns, "mother_name", "mother_name TEXT");
  ensureColumn(database, "users", userColumns, "mother_cpf", "mother_cpf TEXT");
  ensureColumn(database, "users", userColumns, "birth_date", "birth_date TEXT");
  ensureColumn(database, "users", userColumns, "member_type", "member_type TEXT");
  ensureColumn(database, "users", userColumns, "has_role", "has_role INTEGER");
  ensureColumn(database, "users", userColumns, "role_title", "role_title TEXT");
  ensureColumn(database, "users", userColumns, "baptized", "baptized INTEGER");
  ensureColumn(database, "users", userColumns, "baptism_date", "baptism_date TEXT");
  ensureColumn(database, "users", userColumns, "profession", "profession TEXT");
  ensureColumn(database, "users", userColumns, "education_level", "education_level TEXT");
  ensureColumn(database, "users", userColumns, "marital_status", "marital_status TEXT");
  ensureColumn(database, "users", userColumns, "age", "age INTEGER");
  ensureColumn(database, "users", userColumns, "address", "address TEXT");

  const postColumns = getTableColumns(database, "posts");
  ensureColumn(database, "posts", postColumns, "slug", "slug TEXT");
  ensureColumn(database, "posts", postColumns, "excerpt", "excerpt TEXT");
  ensureColumn(database, "posts", postColumns, "cover_url", "cover_url TEXT");
  ensureColumn(database, "posts", postColumns, "media_url", "media_url TEXT");
  ensureColumn(database, "posts", postColumns, "tags", "tags TEXT");

  const eventColumns = getTableColumns(database, "events");
  ensureColumn(database, "events", eventColumns, "title", "title TEXT");
  ensureColumn(database, "events", eventColumns, "description", "description TEXT");
  ensureColumn(database, "events", eventColumns, "event_date", "event_date TEXT");
  ensureColumn(database, "events", eventColumns, "event_time", "event_time TEXT");
  ensureColumn(database, "events", eventColumns, "location", "location TEXT");
  ensureColumn(database, "events", eventColumns, "created_by", "created_by INTEGER");
  ensureColumn(database, "events", eventColumns, "created_at", "created_at TEXT");

  const raffleColumns = getTableColumns(database, "raffles");
  ensureColumn(database, "raffles", raffleColumns, "name", "name TEXT");
  ensureColumn(database, "raffles", raffleColumns, "description", "description TEXT");
  ensureColumn(database, "raffles", raffleColumns, "draw_date", "draw_date TEXT");
  ensureColumn(database, "raffles", raffleColumns, "sales_deadline", "sales_deadline TEXT");
  ensureColumn(database, "raffles", raffleColumns, "quota_total", "quota_total INTEGER");
  ensureColumn(database, "raffles", raffleColumns, "status", "status TEXT");
  ensureColumn(database, "raffles", raffleColumns, "created_at", "created_at TEXT");

  const raffleSalesColumns = getTableColumns(database, "raffle_sales");
  ensureColumn(database, "raffle_sales", raffleSalesColumns, "raffle_id", "raffle_id INTEGER");
  ensureColumn(database, "raffle_sales", raffleSalesColumns, "number", "number TEXT");
  ensureColumn(database, "raffle_sales", raffleSalesColumns, "buyer", "buyer TEXT");
  ensureColumn(database, "raffle_sales", raffleSalesColumns, "seller", "seller TEXT");
  ensureColumn(database, "raffle_sales", raffleSalesColumns, "paid", "paid INTEGER");
  ensureColumn(database, "raffle_sales", raffleSalesColumns, "created_at", "created_at TEXT");

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
        "INSERT INTO users (name, email, password_hash, role, status, created_at) VALUES (?, ?, ?, 'admin', 'active', ?)"
      )
      .run("Administrador", email, hash, now);
  }

  if (statusAdded) {
    database.prepare("UPDATE users SET status = 'active'").run();
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
