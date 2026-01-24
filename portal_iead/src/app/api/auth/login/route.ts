import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const identifierRaw = String(body.identifier ?? body.email ?? "").trim();
  const identifierLower = identifierRaw.toLowerCase();
  const password = String(body.password ?? "");

  if (!identifierRaw || !password) {
    return NextResponse.json({ error: "Credenciais inv?lidas." }, { status: 400 });
  }

  const db = getDb();
  const user = db
    .prepare("SELECT id, name, email, password_hash, role FROM users WHERE email = ? OR LOWER(name) = ? LIMIT 1")
    .get(identifierLower, identifierLower);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Usu?rio ou senha incorretos." }, { status: 401 });
  }

  const session = createSession(user.id);
  const response = NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });

  response.cookies.set({
    name: "auth_token",
    value: session.token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return response;
}
