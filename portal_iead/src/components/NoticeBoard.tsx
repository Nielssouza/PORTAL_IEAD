"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  createdAt: string;
};

export default function NoticeBoard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      body: JSON.stringify({ title, body }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Não foi possível publicar.");
      setLoading(false);
      return;
    }

    const payload = await response.json();
    setPosts((prev) => [payload.post, ...prev]);
    setTitle("");
    setBody("");
    setLoading(false);
  }

  return (
    <section id="avisos" className="board">
      <div className="board-header">
        <div>
          <p className="kicker">Avisos</p>
          <h2>Quadro de avisos da igreja</h2>
          <p className="section-text">
            Publicações oficiais para informar toda a comunidade.
          </p>
        </div>
      </div>
      <form className="board-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Título do aviso"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <textarea
          placeholder="Escreva a mensagem para os membros..."
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          required
        />
        {error ? <span className="auth-error">{error}</span> : null}
        <button className="cta primary" type="submit" disabled={loading}>
          {loading ? "Publicando..." : "Publicar aviso"}
        </button>
      </form>
      <div className="board-posts">
        {posts.length === 0 ? (
          <p className="section-text">Nenhum aviso publicado ainda.</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="board-post">
              <div>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
              </div>
              <div className="board-meta">
                <span>{post.author}</span>
                <time>{new Date(post.createdAt).toLocaleString("pt-BR")}</time>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
