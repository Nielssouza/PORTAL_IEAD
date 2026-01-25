import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

function isVideoFile(url: string) {
  return /\.(mp4|webm|ogg)$/i.test(url);
}

function getYouTubeEmbed(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export default async function QuadroAvisoDetalhePage({
  params,
}: {
  params: { slug: string };
}) {
  await requireAuth();
  const db = getDb();
  const post = db
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
      WHERE posts.slug = ?
      LIMIT 1
    `
    )
    .get(params.slug) as
      | {
          id: number;
          title: string;
          body: string;
          slug: string;
          excerpt: string | null;
          coverUrl: string | null;
          mediaUrl: string | null;
          tags: string | null;
          createdAt: string;
          author: string;
        }
      | undefined;

  if (!post) {
    notFound();
  }

  const tags =
    typeof post.tags === "string" && post.tags.length > 0 ? post.tags.split(",") : [];
  const formattedDate = new Date(post.createdAt).toLocaleString("pt-BR");
  const mediaUrl = post.mediaUrl ?? "";
  const embedUrl = mediaUrl ? getYouTubeEmbed(mediaUrl) : null;
  const formatTag = (value: string) =>
    value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <main className="page board-page">
      <section className="section blog-detail">
        <div className="board-actions">
          <a className="cta ghost" href="/quadro-avisos">
            Voltar para avisos
          </a>
        </div>
        <article className="blog-hero">
          {post.coverUrl ? (
            <div className="blog-hero-media">
              <img src={post.coverUrl} alt={post.title} className="blog-hero-image" />
            </div>
          ) : null}
          <div className="blog-hero-content">
            <p className="kicker">{"Quadro de avisos"}</p>
            <h1>{post.title}</h1>
            <p className="section-text">{post.excerpt || post.body.slice(0, 180)}</p>
            <div className="blog-meta">
              <span>{post.author}</span>
              <time>{formattedDate}</time>
            </div>
            {tags.length > 0 ? (
              <div className="tag-row">
                {tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {formatTag(tag)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </article>

        <div className="blog-body">
          {mediaUrl ? (
            <div className="blog-media">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isVideoFile(mediaUrl) ? (
                <video controls src={mediaUrl} />
              ) : (
                <a className="cta ghost" href={mediaUrl} target="_blank" rel="noreferrer">
                  Ver anexo
                </a>
              )}
            </div>
          ) : null}
          <p>{post.body}</p>
        </div>
      </section>
    </main>
  );
}
