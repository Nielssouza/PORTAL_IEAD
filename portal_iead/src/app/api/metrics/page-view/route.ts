import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path.trim() : "";

  if (!path) {
    return NextResponse.json({ error: "Path inv\u00e1lido." }, { status: 400 });
  }

  const db = getDb();
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO page_views (path, count, updated_at)
    VALUES (?, 1, ?)
    ON CONFLICT(path) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at
  `
  ).run(path, now);

  const row = db.prepare("SELECT count FROM page_views WHERE path = ?").get(path) as
    | { count: number }
    | undefined;

  return NextResponse.json({ ok: true, path, count: row?.count ?? 0 });
}
