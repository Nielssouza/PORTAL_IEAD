import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";

export const runtime = "nodejs";

const TEXT = {
  unauthorized: "N\u00e3o autorizado.",
  missing: "Informe t\u00edtulo, data e hor\u00e1rio.",
  invalidDate: "Data inv\u00e1lida.",
  invalidTime: "Hor\u00e1rio inv\u00e1lido.",
};

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

export async function GET() {
  const db = await getDb();
  const { rows: events } = await db.query(
    `
      SELECT id, title, description, event_date as date, event_time as time, location, created_at as "createdAt"
      FROM events
      WHERE event_date >= CURRENT_DATE - 1
      ORDER BY event_date ASC, event_time ASC
      LIMIT 60
    `
  );

  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const user = await getSessionUserByToken(token);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: TEXT.unauthorized }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const date = String(body.date ?? "").trim();
  const time = String(body.time ?? "").trim();
  const description = String(body.description ?? "").trim();
  const location = String(body.location ?? "").trim();

  if (!title || !date || !time) {
    return NextResponse.json({ error: TEXT.missing }, { status: 400 });
  }

  if (!isValidDate(date)) {
    return NextResponse.json({ error: TEXT.invalidDate }, { status: 400 });
  }

  if (!isValidTime(time)) {
    return NextResponse.json({ error: TEXT.invalidTime }, { status: 400 });
  }

  const db = await getDb();
  const now = new Date().toISOString();
  const { rows } = await db.query(
    `
      INSERT INTO events (title, description, event_date, event_time, location, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
    [title, description, date, time, location, user.id, now]
  );

  return NextResponse.json({
    event: {
      id: rows[0].id,
      title,
      description,
      date,
      time,
      location,
      createdAt: now,
    },
  });
}
