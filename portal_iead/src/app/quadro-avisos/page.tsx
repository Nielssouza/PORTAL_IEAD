import { getDb } from "@/lib/db";

type NoticePost = {
  id: number;
  title: string;
  body: string;
  author: string;
  createdAt: string;
};

function getNoticePosts() {
  const db = getDb();
  return db
    .prepare(
      `
      SELECT posts.id, posts.title, posts.body, posts.created_at as createdAt, users.name as author
      FROM posts
      JOIN users ON users.id = posts.author_id
      ORDER BY posts.created_at DESC
      LIMIT 100
    `
    )
    .all() as NoticePost[];
}

export default function QuadroAvisosPage() {
  const posts = getNoticePosts();

  return (
    <main className="page board-page">
      <section className="section board-hero">
        <div>
          <p className="kicker">Quadro de avisos</p>
          <h1>{"Atualiza\u00e7\u00f5es e comunicados da igreja"}</h1>
          <p className="section-text">
            {
              "Acompanhe os avisos mais recentes e o hist\u00f3rico de comunicados no formato de blog."
            }
          </p>
        </div>
        <div className="board-actions">
          <a className="cta ghost" href="/">
            Voltar para a home
          </a>
          <a className="cta blue" href="/login">
            Entrar
          </a>
        </div>
      </section>

      <section className="section board-list">
        <div className="notice-grid">
          {posts.length === 0 ? (
            <p className="section-text notice-empty">Nenhum aviso publicado ainda.</p>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="notice-card notice-full">
                <div className="notice-header">
                  <h2>{post.title}</h2>
                  <div className="notice-meta">
                    <span>{post.author}</span>
                    <time>
                      {new Date(post.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>
                <p className="notice-body">{post.body}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
