import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";

export const runtime = "nodejs";

const TEXT = {
  unauthorized: "Não autorizado.",
  missing: "Preencha todos os campos.",
  duplicate: "Este número já foi vendido nesta ação.",
};

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const user = await getSessionUserByToken(token);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function POST(
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
  const number = String(body.number ?? "").trim();
  const buyer = String(body.buyer ?? "").trim();
  const seller = String(body.seller ?? "").trim();
  const paid = body.paid ? 1 : 0;

  if (!number || !buyer || !seller) {
    return NextResponse.json({ error: TEXT.missing }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.query(
    "SELECT 1 FROM raffle_sales WHERE raffle_id = $1 AND number = $2 LIMIT 1",
    [raffleId, number]
  );
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: TEXT.duplicate }, { status: 409 });
  }

  const now = new Date().toISOString();
  const { rows } = await db.query(
    `
      INSERT INTO raffle_sales (raffle_id, number, buyer, seller, paid, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [raffleId, number, buyer, seller, paid, now]
  );

  return NextResponse.json({
    sale: {
      id: rows[0].id,
      raffleId,
      number,
      buyer,
      seller,
      paid,
      createdAt: now,
    },
  });
}
