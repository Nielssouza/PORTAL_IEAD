import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dbPath = path.join(process.cwd(), "data", "portal.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
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
    author_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );
`);

function getTableColumns(database, table) {
  const rows = database.prepare(`PRAGMA table_info(${table})`).all();
  return new Set(rows.map((row) => row.name));
}

function ensureColumn(database, table, columns, name, definition, added) {
  if (columns.has(name)) return;
  database.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  columns.add(name);
  added.push(name);
}

const columns = getTableColumns(db, "users");
const added = [];

ensureColumn(db, "users", columns, "status", "status TEXT NOT NULL DEFAULT 'pending'", added);
ensureColumn(db, "users", columns, "cpf", "cpf TEXT", added);
ensureColumn(db, "users", columns, "father_name", "father_name TEXT", added);
ensureColumn(db, "users", columns, "father_cpf", "father_cpf TEXT", added);
ensureColumn(db, "users", columns, "mother_name", "mother_name TEXT", added);
ensureColumn(db, "users", columns, "mother_cpf", "mother_cpf TEXT", added);
ensureColumn(db, "users", columns, "birth_date", "birth_date TEXT", added);
ensureColumn(db, "users", columns, "member_type", "member_type TEXT", added);
ensureColumn(db, "users", columns, "has_role", "has_role INTEGER", added);
ensureColumn(db, "users", columns, "role_title", "role_title TEXT", added);
ensureColumn(db, "users", columns, "baptized", "baptized INTEGER", added);
ensureColumn(db, "users", columns, "baptism_date", "baptism_date TEXT", added);
ensureColumn(db, "users", columns, "profession", "profession TEXT", added);
ensureColumn(db, "users", columns, "education_level", "education_level TEXT", added);
ensureColumn(db, "users", columns, "marital_status", "marital_status TEXT", added);
ensureColumn(db, "users", columns, "age", "age INTEGER", added);
ensureColumn(db, "users", columns, "address", "address TEXT", added);

if (added.length > 0) {
  console.log(`Colunas adicionadas: ${added.join(", ")}`);
} else {
  console.log("Nenhuma coluna nova. Schema ja estava atualizado.");
}
