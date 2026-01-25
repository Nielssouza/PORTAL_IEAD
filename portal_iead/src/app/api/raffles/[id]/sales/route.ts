import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";

export const runtime = "nodejs";

const TEXT = {
  unauthorized: "Não autorizado.",
  missing: "Preencha todos os campos.",
  duplicate: "Este número já foi vendido nesta ação.",
};

function requireAdmin(request: Request) {
  const token = request.cookies.get("auth_token")?.value;
  const user = getSessionUserByToken(token);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: TEXT.unauthorized }, { status: 401 });
  }

  const raffleId = Number(params.id);
  if (!Number.isFinite(raffleId)) {
    return NextResponse.json({ error: TEXT.missing }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const number = String(body.number ?? "").trim();
  const buyer = String(body.buyer ?? "").trim();
  const seller = String(body.seller ?? "").trim();
  const paid = body.paid ? 1 : 0;

  if (!number || !buyer || !seller) {
    return NextResponse.json({ error: TEXT.missing }, { status: 400 });
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT 1 FROM raffle_sales WHERE raffle_id = ? AND number = ? LIMIT 1")
    .get(raffleId, number);
  if (existing) {
    return NextResponse.json({ error: TEXT.duplicate }, { status: 409 });
  }

  const now = new Date().toISOString();
  const result = db
    .prepare(
      `
      INSERT INTO raffle_sales (raffle_id, number, buyer, seller, paid, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    )
    .run(raffleId, number, buyer, seller, paid, now);

  return NextResponse.json({
    sale: {
      id: result.lastInsertRowid,
      raffleId,
      number,
      buyer,
      seller,
      paid,
      createdAt: now,
    },
  });
}
