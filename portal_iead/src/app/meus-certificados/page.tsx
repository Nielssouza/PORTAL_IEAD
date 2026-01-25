import { requireAuth } from "@/lib/auth";

const TEXT = {
  kicker: "Meus certificados",
  title: "Hist\u00f3rico de certificados",
  description: "Consulte certificados emitidos e acompanhe novas conquistas.",
  back: "Voltar para o painel",
};

const certificates = [
  { title: "Fundamentos da F\u00e9", date: "12/12/2025", status: "Emitido" },
  { title: "Discipulado e Mentoria", date: "08/01/2026", status: "Emitido" },
  { title: "Lideran\u00e7a Servidora", date: "15/01/2026", status: "Em valida\u00e7\u00e3o" },
];

export default async function MeusCertificadosPage() {
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
          {certificates.map((certificate) => (
            <article key={certificate.title} className="report-card">
              <div>
                <p className="kicker">Certificado</p>
                <h3>{certificate.title}</h3>
                <p className="report-meta">Emitido em {certificate.date}</p>
              </div>
              <div className="summary-item">
                <strong>{certificate.status}</strong>
                <span>Status do certificado</span>
              </div>
              <div className="board-actions">
                <a className="cta ghost" href="/home">
                  Visualizar
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
