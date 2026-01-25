import { requireAdmin } from "@/lib/auth";

const TEXT = {
  kicker: "Escola B\u00edblica",
  title: "Gest\u00e3o de matriculados",
  description: "Controle de turmas, chamada e conte\u00fado semanal.",
  back: "Voltar para o painel",
  attendance: "Frequ\u00eancia m\u00e9dia",
  enrolled: "Matriculados",
  teachers: "Professores cadastrados",
};

const students = [
  { name: "Maria Souza", className: "Turma A", status: "Ativo", attendance: "92%" },
  { name: "Jo\u00e3o Pereira", className: "Turma B", status: "Ativo", attendance: "88%" },
  { name: "Lucas Nogueira", className: "Turma A", status: "Aten\u00e7\u00e3o", attendance: "72%" },
];

const lessons = [
  { title: "L\u00ed\u00e7\u00e3o 04 - Espiritualidade", week: "Semana 4" },
  { title: "Estudo de Jo\u00e3o", week: "Semana 5" },
  { title: "Aplicando a Palavra", week: "Semana 6" },
];

export default async function EscolaBiblicaPage() {
  await requireAdmin();

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

        <div className="kpi-grid">
          <article className="kpi-card">
            <span>{TEXT.attendance}</span>
            <strong>86%</strong>
          </article>
          <article className="kpi-card">
            <span>{TEXT.enrolled}</span>
            <strong>128</strong>
          </article>
          <article className="kpi-card">
            <span>{TEXT.teachers}</span>
            <strong>12</strong>
          </article>
        </div>

        <div className="report-grid">
          <article className="report-card">
            <div>
              <p className="kicker">Matriculados</p>
              <h3>Lista de alunos</h3>
              <p className="report-meta">{"Status de presen\u00e7a e acompanhamento."}</p>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Turma</th>
                    <th>Status</th>
                    <th>{"Frequ\u00eancia"}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.name}>
                      <td>{student.name}</td>
                      <td>{student.className}</td>
                      <td>{student.status}</td>
                      <td>{student.attendance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="report-card">
            <div>
              <p className="kicker">{"Conte\u00fado"}</p>
              <h3>{"L\u00ed\u00e7\u00f5es e estudos"}</h3>
              <p className="report-meta">Plano semanal para as turmas.</p>
            </div>
            <div className="notification-list">
              {lessons.map((lesson) => (
                <div key={lesson.title} className="notification-item">
                  <div>
                    <strong>{lesson.title}</strong>
                    <span>{lesson.week}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
