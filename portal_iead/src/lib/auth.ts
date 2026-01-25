import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
  status: "active" | "pending" | "disabled";
};

type SessionRow = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
  status: "active" | "pending" | "disabled";
  expires_at: string;
};

const SESSION_TTL_DAYS = 7;

export async function createSession(userId: number) {
  const db = await getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  await db.query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
    [token, userId, expiresAt]
  );

  return { token, expiresAt };
}

export async function clearSession(token?: string | null) {
  if (!token) return;
  const db = await getDb();
  await db.query("DELETE FROM sessions WHERE token = $1", [token]);
}

export async function getSessionUserByToken(
  token?: string | null
): Promise<AuthUser | null> {
  if (!token) return null;
  const db = await getDb();
  const { rows } = await db.query<SessionRow>(
    `
      SELECT users.id as id, users.name as name, users.email as email, users.role as role, users.status as status, sessions.expires_at as expires_at
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token = $1
      LIMIT 1
    `,
    [token]
  );
  const row = rows[0];

  if (!row) return null;

  const expiresAt = new Date(row.expires_at as string);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
    await clearSession(token);
    return null;
  }

  if (row.status !== "active") {
    await clearSession(token);
    return null;
  }

  return {
    id: row.id as number,
    name: row.name as string,
    email: row.email as string,
    role: row.role as "admin" | "member",
    status: row.status as "active" | "pending" | "disabled",
  };
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  return getSessionUserByToken(token);
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    redirect("/home");
  }
  return user;
}
