import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

function requireAdmin(token?: string | null) {
  const user = getSessionUserByToken(token);
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = requireAdmin(request.cookies.get("auth_token")?.value);
  if (!admin) {
    return NextResponse.json({ error: "N?o autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const role = body.role === "admin" ? "admin" : "member";
  const password = String(body.password ?? "");

  if (!name) {
    return NextResponse.json({ error: "Nome ? obrigat?rio." }, { status: 400 });
  }

  const db = getDb();
  if (password) {
    const hash = hashPassword(password);
    db.prepare("UPDATE users SET name = ?, role = ?, password_hash = ? WHERE id = ?").run(
      name,
      role,
      hash,
      params.id
    );
  } else {
    db.prepare("UPDATE users SET name = ?, role = ? WHERE id = ?").run(name, role, params.id);
  }

  return NextResponse.json({ ok: true });
}
