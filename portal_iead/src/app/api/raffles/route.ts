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

export async function GET(request: Request) {
  const user = requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: TEXT.unauthorized }, { status: 401 });
  }

  const db = getDb();
  const raffles = db
    .prepare(
      `
      SELECT
        r.id,
        r.name,
        r.description,
        r.draw_date as drawDate,
        r.sales_deadline as salesDeadline,
        r.quota_total as quotaTotal,
        r.status,
        r.created_at as createdAt,
        COUNT(s.id) as soldCount,
        SUM(CASE WHEN s.paid = 1 THEN 1 ELSE 0 END) as paidCount
      FROM raffles r
      LEFT JOIN raffle_sales s ON s.raffle_id = r.id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `
    )
    .all() as Array<{
    id: number;
    name: string;
    description: string | null;
    drawDate: string;
    salesDeadline: string;
    quotaTotal: number;
    status: string;
    createdAt: string;
    soldCount: number;
    paidCount: number | null;
  }>;

  const sales = db
    .prepare(
      `
      SELECT
        id,
        raffle_id as raffleId,
        number,
        buyer,
        seller,
        paid,
        created_at as createdAt
      FROM raffle_sales
      ORDER BY created_at DESC
    `
    )
    .all() as Array<{
    id: number;
    raffleId: number;
    number: string;
    buyer: string;
    seller: string;
    paid: number;
    createdAt: string;
  }>;

  const salesByRaffle = new Map<number, typeof sales>();
  for (const sale of sales) {
    if (!salesByRaffle.has(sale.raffleId)) {
      salesByRaffle.set(sale.raffleId, []);
    }
    salesByRaffle.get(sale.raffleId)?.push(sale);
  }

  const payload = raffles.map((raffle) => {
    const soldCount = raffle.soldCount ?? 0;
    const percent =
      raffle.quotaTotal > 0 ? Math.round((soldCount / raffle.quotaTotal) * 100) : 0;
    return {
      ...raffle,
      soldCount,
      paidCount: raffle.paidCount ?? 0,
      percent,
      sales: salesByRaffle.get(raffle.id) ?? [],
    };
  });

  return NextResponse.json({ raffles: payload });
}

export async function POST(request: Request) {
  const user = requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: TEXT.unauthorized }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const drawDate = String(body.drawDate ?? "").trim();
  const salesDeadline = String(body.salesDeadline ?? "").trim();
  const quotaTotal = Number(body.quotaTotal);
  const status = String(body.status ?? "Ativa").trim() || "Ativa";

  if (!name || !drawDate || !salesDeadline || !quotaTotal) {
    return NextResponse.json({ error: TEXT.missing }, { status: 400 });
  }

  if (!Number.isFinite(quotaTotal) || quotaTotal <= 0) {
    return NextResponse.json({ error: TEXT.invalid }, { status: 400 });
  }

  const db = getDb();
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `
      INSERT INTO raffles (name, description, draw_date, sales_deadline, quota_total, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    )
    .run(name, description, drawDate, salesDeadline, quotaTotal, status, now);

  return NextResponse.json({
    raffle: {
      id: result.lastInsertRowid,
      name,
      description,
      drawDate,
      salesDeadline,
      quotaTotal,
      status,
      createdAt: now,
      soldCount: 0,
      paidCount: 0,
      percent: 0,
      sales: [],
    },
  });
}
