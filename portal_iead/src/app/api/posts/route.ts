import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";

export const runtime = "nodejs";

const TEXT = {
  unauthorized: "N\u00e3o autorizado",
  missingFields: "Preencha t\u00edtulo e mensagem.",
};

export async function GET() {
  const db = getDb();
  const posts = db
    .prepare(
      `
      SELECT posts.id, posts.title, posts.body, posts.created_at as createdAt, users.name as author
      FROM posts
      JOIN users ON users.id = posts.author_id
      ORDER BY posts.created_at DESC
      LIMIT 50
    `
    )
    .all();

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const token = request.cookies.get("auth_token")?.value;
  const user = getSessionUserByToken(token);
  if (!user) {
    return NextResponse.json({ error: TEXT.unauthorized }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const content = String(body.body ?? "").trim();

  if (!title || !content) {
    return NextResponse.json({ error: TEXT.missingFields }, { status: 400 });
  }

  const db = getDb();
  const now = new Date().toISOString();
  const result = db
    .prepare("INSERT INTO posts (title, body, author_id, created_at) VALUES (?, ?, ?, ?)")
    .run(title, content, user.id, now);

  return NextResponse.json({
    post: {
      id: result.lastInsertRowid,
      title,
      body: content,
      createdAt: now,
      author: user.name,
    },
  });
}
