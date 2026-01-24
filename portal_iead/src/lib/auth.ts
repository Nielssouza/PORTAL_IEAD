import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
};

const SESSION_TTL_DAYS = 7;

export function createSession(userId: number) {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  db.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(token, userId, expiresAt);

  return { token, expiresAt };
}

export function clearSession(token?: string | null) {
  if (!token) return;
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function getSessionUserByToken(token?: string | null): AuthUser | null {
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT users.id as id, users.name as name, users.email as email, users.role as role, sessions.expires_at as expires_at
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token = ?
      LIMIT 1
    `
    )
    .get(token);

  if (!row) return null;

  const expiresAt = new Date(row.expires_at as string);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
    clearSession(token);
    return null;
  }

  return {
    id: row.id as number,
    name: row.name as string,
    email: row.email as string,
    role: row.role as "admin" | "member",
  };
}

export function getSessionUser(): AuthUser | null {
  const token = cookies().get("auth_token")?.value;
  return getSessionUserByToken(token);
}

export function requireAuth() {
  const user = getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export function requireAdmin() {
  const user = requireAuth();
  if (user.role !== "admin") {
    redirect("/home");
  }
  return user;
}
