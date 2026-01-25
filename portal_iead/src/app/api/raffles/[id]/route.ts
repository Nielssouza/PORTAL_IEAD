import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";

export const runtime = "nodejs";

const TEXT = {
  unauthorized: "Não autorizado.",
  missing: "Preencha os dados obrigatórios.",
  invalid: "Total de quotas inválido.",
};

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const user = await getSessionUserByToken(token);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: TEXT.unauthorized }, { status: 401 });
  }

  const { id } = await params;
  const raffleId = Number(id);
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

  const db = await getDb();
  await db.query(
    `
    UPDATE raffles
    SET name = $1, description = $2, draw_date = $3, sales_deadline = $4, quota_total = $5, status = $6
    WHERE id = $7
  `,
    [name, description, drawDate, salesDeadline, quotaTotal, status, raffleId]
  );

  return NextResponse.json({ ok: true });
}
