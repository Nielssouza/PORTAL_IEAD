import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path.trim() : "";

  if (!path) {
    return NextResponse.json({ error: "Path inv\u00e1lido." }, { status: 400 });
  }

  const db = await getDb();
  const now = new Date().toISOString();

  await db.query(
    `
    INSERT INTO page_views (path, count, updated_at)
    VALUES ($1, 1, $2)
    ON CONFLICT (path) DO UPDATE SET count = page_views.count + 1, updated_at = EXCLUDED.updated_at
  `,
    [path, now]
  );

  const row = (await db.query<{ count: number }>(
    "SELECT count FROM page_views WHERE path = $1",
    [path]
  )).rows[0];

  return NextResponse.json({ ok: true, path, count: Number(row?.count ?? 0) });
}
