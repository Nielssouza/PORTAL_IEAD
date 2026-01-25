import { Pool } from "pg";
import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf-8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (!key || process.env[key]) return;
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  });
}

loadEnv();

const connectionString =
  process.env.HEROKU_APP_NAME && process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL não configurado.");
  process.exit(1);
}

const ssl =
  connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
    ? undefined
    : { rejectUnauthorized: false };

const db = new Pool({ connectionString, ssl, max: 3 });

await db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
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
    created_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    slug TEXT,
    excerpt TEXT,
    cover_url TEXT,
    media_url TEXT,
    tags TEXT,
    author_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TEXT NOT NULL,
    location TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS page_views (
    path TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS raffles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    draw_date DATE NOT NULL,
    sales_deadline DATE NOT NULL,
    quota_total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Ativa',
    created_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS raffle_sales (
    id SERIAL PRIMARY KEY,
    raffle_id INTEGER NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    buyer TEXT NOT NULL,
    seller TEXT NOT NULL,
    paid INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE(raffle_id, number)
  );
`);

console.log("Migração concluída.");
await db.end();
