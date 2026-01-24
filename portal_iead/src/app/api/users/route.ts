import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

const TEXT = {
  unauthorized: "N\u00e3o autorizado",
  required: "Preencha nome, e-mail e senha.",
  emailTaken: "E-mail j\u00e1 cadastrado.",
};

function requireAdmin(token?: string | null) {
  const user = getSessionUserByToken(token);
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

export async function GET(request: Request) {
  const admin = requireAdmin(request.cookies.get("auth_token")?.value);
  if (!admin) {
    return NextResponse.json({ error: TEXT.unauthorized }, { status: 401 });
  }

  const db = getDb();
  const users = db
    .prepare(
      "SELECT id, name, email, role, status, created_at as createdAt FROM users ORDER BY created_at DESC"
    )
    .all();

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const admin = requireAdmin(request.cookies.get("auth_token")?.value);
  if (!admin) {
    return NextResponse.json({ error: TEXT.unauthorized }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = body.role === "admin" ? "admin" : "member";

  if (!name || !email || !password) {
    return NextResponse.json({ error: TEXT.required }, { status: 400 });
  }

  const db = getDb();
  const now = new Date().toISOString();
  const hash = hashPassword(password);

  try {
    const result = db
      .prepare(
        "INSERT INTO users (name, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, 'active', ?)"
      )
      .run(name, email, hash, role, now);

    return NextResponse.json({
      user: { id: result.lastInsertRowid, name, email, role, status: "active", createdAt: now },
    });
  } catch (error) {
    return NextResponse.json({ error: TEXT.emailTaken }, { status: 400 });
  }
}
