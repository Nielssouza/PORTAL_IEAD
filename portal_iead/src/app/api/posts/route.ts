import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";

export const runtime = "nodejs";

const TEXT = {
  unauthorized: "N\u00e3o autorizado",
  missingFields: "Preencha t\u00edtulo e mensagem.",
};

function ensurePostColumns(db: ReturnType<typeof getDb>) {
  const columns = db
    .prepare("PRAGMA table_info(posts)")
    .all()
    .map((row) => row.name as string);
  const columnSet = new Set(columns);

  const ensure = (name: string, definition: string) => {
    if (columnSet.has(name)) return;
    db.exec(`ALTER TABLE posts ADD COLUMN ${definition}`);
    columnSet.add(name);
  };

  ensure("slug", "slug TEXT");
  ensure("excerpt", "excerpt TEXT");
  ensure("cover_url", "cover_url TEXT");
  ensure("media_url", "media_url TEXT");
  ensure("tags", "tags TEXT");
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeTags(input: string | string[]) {
  const items = Array.isArray(input) ? input : input.split(",");
  return items
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) =>
      tag
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .filter(Boolean);
}

export async function GET() {
  const db = getDb();
  ensurePostColumns(db);
  const posts = db
    .prepare(
      `
      SELECT
        posts.id,
        posts.title,
        posts.body,
        posts.slug,
        posts.excerpt,
        posts.cover_url as coverUrl,
        posts.media_url as mediaUrl,
        posts.tags,
        posts.created_at as createdAt,
        users.name as author
      FROM posts
      JOIN users ON users.id = posts.author_id
      ORDER BY posts.created_at DESC
      LIMIT 50
    `
    )
    .all();

  const existingSlugs = new Set(
    db
      .prepare("SELECT slug FROM posts WHERE slug IS NOT NULL AND slug != ''")
      .all()
      .map((row) => row.slug as string)
  );

  const normalized = posts.map((post) => {
    let slug = post.slug as string | null;
    if (!slug) {
      const baseSlug = slugify(String(post.title ?? "")) || `aviso-${post.id}`;
      slug = baseSlug;
      let counter = 1;
      while (existingSlugs.has(slug)) {
        counter += 1;
        slug = `${baseSlug}-${counter}`;
      }
      existingSlugs.add(slug);
      db.prepare("UPDATE posts SET slug = ? WHERE id = ?").run(slug, post.id);
    }

    return {
      ...post,
      slug,
      tags: typeof post.tags === "string" && post.tags.length > 0 ? post.tags.split(",") : [],
    };
  });

  return NextResponse.json({ posts: normalized });
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
  const coverUrl = String(body.coverUrl ?? "").trim();
  const mediaUrl = String(body.mediaUrl ?? "").trim();
  const excerpt = String(body.excerpt ?? "").trim();
  const tags = normalizeTags(body.tags ?? "");

  if (!title || !content) {
    return NextResponse.json({ error: TEXT.missingFields }, { status: 400 });
  }

  const db = getDb();
  const now = new Date().toISOString();
  const baseSlug = slugify(title) || `aviso-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;
  while (db.prepare("SELECT 1 FROM posts WHERE slug = ? LIMIT 1").get(slug)) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  const finalExcerpt = excerpt || content.split(/\s+/).slice(0, 28).join(" ");
  const tagString = tags.join(",");

  const result = db
    .prepare(
      `
      INSERT INTO posts (title, body, slug, excerpt, cover_url, media_url, tags, author_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
    .run(title, content, slug, finalExcerpt, coverUrl, mediaUrl, tagString, user.id, now);

  return NextResponse.json({
    post: {
      id: result.lastInsertRowid,
      title,
      body: content,
      slug,
      excerpt: finalExcerpt,
      coverUrl,
      mediaUrl,
      tags,
      createdAt: now,
      author: user.name,
    },
  });
}
