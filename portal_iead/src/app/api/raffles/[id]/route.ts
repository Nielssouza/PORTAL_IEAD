import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";

export const runtime = "nodejs";

const TEXT = {
  unauthorized: "Não autorizado.",
  missing: "Preencha os dados obrigatórios.",
  invalid: "Total de quotas inválido.",
};

function requireAdmin(request: Request) {
  const token = request.cookies.get("auth_token")?.value;
  const user = getSessionUserByToken(token);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: TEXT.unauthorized }, { status: 401 });
  }

  const raffleId = Number(params.id);
  if (!Number.isFinite(raffleId)) {
    return NextResponse.json({ error: TEXT.missing }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const drawDate = String(body.drawDate ?? "").trim();
  const salesDeadline = String(body.salesDeadline ?? "").trim();
  const quotaTotal = Number(body.quotaTotal);
  const status = String(body.status ?? "").trim();

  if (!name || !drawDate || !salesDeadline || !quotaTotal) {
    return NextResponse.json({ error: TEXT.missing }, { status: 400 });
  }

  if (!Number.isFinite(quotaTotal) || quotaTotal <= 0) {
    return NextResponse.json({ error: TEXT.invalid }, { status: 400 });
  }

  const db = getDb();
  db.prepare(
    `
    UPDATE raffles
    SET name = ?, description = ?, draw_date = ?, sales_deadline = ?, quota_total = ?, status = ?
    WHERE id = ?
  `
  ).run(name, description, drawDate, salesDeadline, quotaTotal, status, raffleId);

  return NextResponse.json({ ok: true });
}
