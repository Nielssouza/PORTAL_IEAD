import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

async function requireAdmin(token?: string | null) {
  const user = await getSessionUserByToken(token);
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request.cookies.get("auth_token")?.value);
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const role = body.role === "admin" ? "admin" : "member";
  const status =
    body.status === "active"
      ? "active"
      : body.status === "disabled"
      ? "disabled"
      : "pending";
  const password = String(body.password ?? "");

  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const db = await getDb();
  if (password) {
    const hash = hashPassword(password);
    await db.query(
      "UPDATE users SET name = $1, role = $2, status = $3, password_hash = $4 WHERE id = $5",
      [name, role, status, hash, (await params).id]
    );
  } else {
    await db.query("UPDATE users SET name = $1, role = $2, status = $3 WHERE id = $4", [
      name,
      role,
      status,
      (await params).id,
    ]);
  }

  return NextResponse.json({ ok: true });
}
