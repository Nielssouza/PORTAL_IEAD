import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";

export const runtime = "nodejs";

type PostRow = {
  id: number;
  title: string;
  body: string;
  slug: string | null;
  excerpt: string | null;
  coverUrl: string | null;
  mediaUrl: string | null;
  tags: string | null;
  createdAt: string;
  author: string;
};

const TEXT = {
  unauthorized: "N\u00e3o autorizado",
  missingFields: "Preencha t\u00edtulo e mensagem.",
};

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
  const db = await getDb();
  const { rows: posts } = await db.query<PostRow>(
    `
      SELECT
        posts.id,
        posts.title,
        posts.body,
        posts.slug,
        posts.excerpt,
        posts.cover_url as "coverUrl",
        posts.media_url as "mediaUrl",
        posts.tags,
        posts.created_at as "createdAt",
        users.name as author
      FROM posts
      JOIN users ON users.id = posts.author_id
      ORDER BY posts.created_at DESC
      LIMIT 50
    `
  );

  const existingSlugsRows: Array<{ slug: string }> = (
    await db.query<{ slug: string }>("SELECT slug FROM posts WHERE slug IS NOT NULL AND slug != ''")
  ).rows;
  const existingSlugs = new Set(existingSlugsRows.map((row) => row.slug));

  const normalized: Array<
    Omit<PostRow, "tags" | "slug"> & { slug: string; tags: string[] }
  > = [];

  for (const post of posts) {
    let slug = post.slug;
    if (!slug) {
      const baseSlug = slugify(String(post.title ?? "")) || `aviso-${post.id}`;
      slug = baseSlug;
      let counter = 1;
      while (existingSlugs.has(slug)) {
        counter += 1;
        slug = `${baseSlug}-${counter}`;
      }
      existingSlugs.add(slug);
      await db.query("UPDATE posts SET slug = $1 WHERE id = $2", [slug, post.id]);
    }

    normalized.push({
      ...post,
      slug,
      tags: typeof post.tags === "string" && post.tags.length > 0 ? post.tags.split(",") : [],
    });
  }

  return NextResponse.json({ posts: normalized });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const user = await getSessionUserByToken(token);
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

  const db = await getDb();
  const now = new Date().toISOString();
  const baseSlug = slugify(title) || `aviso-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;
  while (
    (await db.query("SELECT 1 FROM posts WHERE slug = $1 LIMIT 1", [slug])).rows.length > 0
  ) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  const finalExcerpt = excerpt || content.split(/\s+/).slice(0, 28).join(" ");
  const tagString = tags.join(",");

  const { rows } = await db.query(
    `
      INSERT INTO posts (title, body, slug, excerpt, cover_url, media_url, tags, author_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `,
    [title, content, slug, finalExcerpt, coverUrl, mediaUrl, tagString, user.id, now]
  );

  return NextResponse.json({
    post: {
      id: rows[0].id,
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
