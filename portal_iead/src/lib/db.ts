import { Pool } from "pg";
import { hashPassword } from "./password";

let pool: Pool | null = null;
let initPromise: Promise<void> | null = null;

function resolveSsl(url: string) {
  if (url.includes("localhost") || url.includes("127.0.0.1")) return undefined;
  return { rejectUnauthorized: false };
}

function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurado.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 5,
      ssl: resolveSsl(connectionString),
    });
  }

  return pool;
}

async function initDb() {
  const db = getPool();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
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
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const { rows } = await db.query(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
  );
  if (rows.length === 0) {
    const email = process.env.ADMIN_EMAIL ?? "admin@iead.local";
    const password = process.env.ADMIN_PASSWORD ?? "Admin@123";
    const now = new Date().toISOString();
    const hash = hashPassword(password);
    await db.query(
      "INSERT INTO users (name, email, password_hash, role, status, created_at) VALUES ($1, $2, $3, 'admin', 'active', $4)",
      ["Administrador", email, hash, now]
    );
  }
}

export async function getDb() {
  const db = getPool();
  if (!initPromise) {
    initPromise = initDb();
  }
  await initPromise;
  return db;
}
