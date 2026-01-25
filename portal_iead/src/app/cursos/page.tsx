import { requireAuth } from "@/lib/auth";

const TEXT = {
  kicker: "Cursos",
  title: "Acompanhamento de turmas",
  description: "Veja seus cursos ativos, progresso e pr\u00f3ximas aulas.",
  back: "Voltar para o painel",
};

const courses = [
  { title: "Fundamentos da F\u00e9", progress: "72%", next: "Aula 6 - 28/01" },
  { title: "Discipulado e Mentoria", progress: "40%", next: "Aula 3 - 30/01" },
  { title: "Lideran\u00e7a Servidora", progress: "55%", next: "Aula 4 - 02/02" },
];

export default async function CursosPage() {
  await requireAuth();

  return (
    <main className="page">
      <section className="section">
        <div className="section-head">
          <div>
            <p className="kicker">{TEXT.kicker}</p>
            <h1>{TEXT.title}</h1>
            <p className="section-text">{TEXT.description}</p>
          </div>
          <div className="board-actions">
            <a className="cta ghost" href="/home">
              {TEXT.back}
            </a>
          </div>
        </div>

        <div className="report-grid">
          {courses.map((course) => (
            <article key={course.title} className="report-card">
              <div>
                <p className="kicker">Curso ativo</p>
                <h3>{course.title}</h3>
                <p className="report-meta">{"Pr\u00f3xima aula: "}{course.next}</p>
              </div>
              <div className="summary-item">
                <strong>{course.progress}</strong>
                <span>{"Progresso conclu\u00eddo"}</span>
              </div>
              <div className="board-actions">
                <a className="cta ghost" href="/home">
                  Ver detalhes
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
