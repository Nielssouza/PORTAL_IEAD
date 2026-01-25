import { requireAdmin } from "@/lib/auth";

const TEXT = {
  kicker: "Secretaria",
  title: "Central administrativa",
  description: "Gest\u00e3o de documentos, atendimentos e comunicados internos.",
  back: "Voltar para o painel",
  pending: "Documentos pendentes",
  atendimento: "Atendimentos do dia",
  cartas: "Cartas emitidas",
  agenda: "Agenda da secretaria",
  tarefas: "Tarefas priorit\u00e1rias",
};

const agendaItems = [
  { title: "Atendimento pastoral", time: "09:30" },
  { title: "Reuni\u00e3o de lideran\u00e7a", time: "14:00" },
  { title: "Envio de comunicados", time: "17:30" },
];

const tasks = [
  "Conferir cadastros pendentes.",
  "Atualizar arquivos de membros.",
  "Organizar documentos do culto.",
];

export default async function SecretariaPage() {
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
            <span>{TEXT.pending}</span>
            <strong>8</strong>
          </article>
          <article className="kpi-card">
            <span>{TEXT.atendimento}</span>
            <strong>5</strong>
          </article>
          <article className="kpi-card">
            <span>{TEXT.cartas}</span>
            <strong>12</strong>
          </article>
        </div>

        <div className="report-grid">
          <article className="report-card">
            <div>
              <p className="kicker">{TEXT.agenda}</p>
              <h3>{"Pr\u00f3ximos compromissos"}</h3>
              <p className="report-meta">{"Organiza\u00e7\u00e3o da rotina da secretaria."}</p>
            </div>
            <div className="timeline-list">
              {agendaItems.map((item) => (
                <div key={item.title} className="timeline-item">
                  <div>
                    <strong>{item.title}</strong>
                    <span>Agenda interna</span>
                  </div>
                  <small>{item.time}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="report-card">
            <div>
              <p className="kicker">{TEXT.tarefas}</p>
              <h3>Checklist do dia</h3>
              <p className="report-meta">{"Atividades que exigem aten\u00e7\u00e3o imediata."}</p>
            </div>
            <div className="notification-list">
              {tasks.map((task) => (
                <div key={task} className="notification-item">
                  <div>
                    <strong>{task}</strong>
                    <span>Prioridade do dia</span>
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
