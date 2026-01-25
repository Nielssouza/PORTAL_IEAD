"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  slug: string;
  excerpt?: string | null;
  coverUrl?: string | null;
  mediaUrl?: string | null;
  tags?: string[];
};

const TEXT = {
  publishError: "N\u00e3o foi poss\u00edvel publicar.",
  titlePlaceholder: "T\u00edtulo do aviso",
  bodyPlaceholder: "Escreva a mensagem para os membros...",
  coverPlaceholder: "Link da imagem de capa (opcional)",
  mediaPlaceholder: "Link de v\u00eddeo ou anexo (opcional)",
  tagsPlaceholder: "Tags separadas por v\u00edrgula (ex: culto, jovens)",
  excerptPlaceholder: "Resumo curto para o card (opcional)",
  searchPlaceholder: "Buscar por t\u00edtulo, autor ou palavra-chave",
  filterAll: "Todas as tags",
  publish: "Publicar aviso",
  header: "Quadro de avisos da igreja",
  description: "Publica\u00e7\u00f5es oficiais para informar toda a comunidade.",
  empty: "Nenhum aviso publicado ainda.",
  timeline: "Hist\u00f3rico de avisos",
};

export default function NoticeBoard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 6;

  async function loadPosts() {
    const response = await fetch("/api/posts");
    if (!response.ok) return;
    const payload = await response.json();
    setPosts(payload.posts ?? []);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, coverUrl, mediaUrl, tags, excerpt }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? TEXT.publishError);
      setLoading(false);
      return;
    }

    const payload = await response.json();
    setPosts((prev) => [payload.post, ...prev]);
    setTitle("");
    setBody("");
    setCoverUrl("");
    setMediaUrl("");
    setTags("");
    setExcerpt("");
    setLoading(false);
  }

  const availableTags = Array.from(
    new Set(
      posts.flatMap((post) => post.tags ?? []).map((tag) => tag.trim()).filter(Boolean)
    )
  ).sort();

  const formatTag = (value: string) =>
    value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = posts.filter((post) => {
    const matchSearch = normalizedSearch
      ? `${post.title} ${post.body} ${post.author}`.toLowerCase().includes(normalizedSearch)
      : true;
    const matchTag = selectedTag ? (post.tags ?? []).includes(selectedTag) : true;
    return matchSearch && matchTag;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedPosts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function goNext() {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }

  function goPrev() {
    setPage((prev) => Math.max(prev - 1, 1));
  }

  useEffect(() => {
    setPage(1);
  }, [search, selectedTag]);

  return (
    <section id="avisos" className="board">
      <div className="board-header blog-header">
        <div>
          <p className="kicker">Avisos</p>
          <h2>{TEXT.header}</h2>
          <p className="section-text">{TEXT.description}</p>
        </div>
      </div>
      <form className="board-form blog-form" onSubmit={handleSubmit}>
        <div className="blog-form-grid">
          <input
            type="text"
            placeholder={TEXT.titlePlaceholder}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <input
            type="text"
            placeholder={TEXT.excerptPlaceholder}
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
          />
          <input
            type="text"
            placeholder={TEXT.coverPlaceholder}
            value={coverUrl}
            onChange={(event) => setCoverUrl(event.target.value)}
          />
          <input
            type="text"
            placeholder={TEXT.mediaPlaceholder}
            value={mediaUrl}
            onChange={(event) => setMediaUrl(event.target.value)}
          />
          <input
            type="text"
            placeholder={TEXT.tagsPlaceholder}
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </div>
        <textarea
          placeholder={TEXT.bodyPlaceholder}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={5}
          required
        />
        {error ? <span className="auth-error">{error}</span> : null}
        <button className="cta primary" type="submit" disabled={loading}>
          {loading ? "Publicando..." : TEXT.publish}
        </button>
      </form>

      <div className="blog-filters">
        <input
          type="search"
          placeholder={TEXT.searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)}>
          <option value="">{TEXT.filterAll}</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>
              {formatTag(tag)}
            </option>
          ))}
        </select>
      </div>

      <div className="timeline">
        <div className="timeline-line" aria-hidden="true" />
        <div className="timeline-feed">
          {pagedPosts.length === 0 ? (
            <p className="section-text">{TEXT.empty}</p>
          ) : (
            pagedPosts.map((post) => {
              const formattedDate = new Date(post.createdAt).toLocaleString("pt-BR");
              const shortDate = new Date(post.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              });
              const summary = post.excerpt || post.body.split(/\s+/).slice(0, 28).join(" ");
              return (
                <article key={post.id} className="timeline-item">
                  <div className="timeline-marker">
                    <span className="timeline-dot" />
                    <span className="timeline-date">{shortDate}</span>
                  </div>
                  <div className="timeline-card">
                    <a href={`/quadro-avisos/${post.slug}`} className="timeline-cover">
                      {post.coverUrl ? (
                        <img src={post.coverUrl} alt={post.title} loading="lazy" />
                      ) : (
                        <div className="blog-cover-placeholder">
                          <span>{post.title.slice(0, 1)}</span>
                        </div>
                      )}
                    </a>
                    <div className="timeline-content">
                      <div className="blog-meta">
                        <span>{post.author}</span>
                        <time>{formattedDate}</time>
                      </div>
                      <h3>
                        <a href={`/quadro-avisos/${post.slug}`}>{post.title}</a>
                      </h3>
                      <p>{summary}</p>
                      {post.tags && post.tags.length > 0 ? (
                        <div className="tag-row">
                          {post.tags.map((tag) => (
                            <span key={`${post.id}-${tag}`} className="tag-pill">
                              {formatTag(tag)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div className="timeline-actions">
                        <a className="cta ghost" href={`/quadro-avisos/${post.slug}`}>
                          Ver detalhes
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      <div className="blog-pagination">
        <button className="cta ghost" type="button" onClick={goPrev} disabled={currentPage <= 1}>
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          className="cta ghost"
          type="button"
          onClick={goNext}
          disabled={currentPage >= totalPages}
        >
          Próxima
        </button>
      </div>
    </section>
  );
}
