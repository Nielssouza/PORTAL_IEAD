import { requireAdmin } from "@/lib/auth";

const TEXT = {
  kicker: "Tesouraria",
  title: "Relat\u00f3rio financeiro",
  description: "Acompanhe entradas, sa\u00eddas e previs\u00f5es de caixa.",
  back: "Voltar para o painel",
};

const highlights = [
  { label: "Entradas do m\u00eas", value: "R$ 42.380" },
  { label: "Sa\u00eddas do m\u00eas", value: "R$ 27.910" },
  { label: "Saldo atual", value: "R$ 14.470" },
];

const rows = [
  { month: "Out/25", income: "R$ 38.900", expense: "R$ 25.200", balance: "R$ 13.700" },
  { month: "Nov/25", income: "R$ 40.150", expense: "R$ 26.400", balance: "R$ 13.750" },
  { month: "Dez/25", income: "R$ 41.600", expense: "R$ 28.100", balance: "R$ 13.500" },
  { month: "Jan/26", income: "R$ 42.380", expense: "R$ 27.910", balance: "R$ 14.470" },
];

export default async function TesourariaPage() {
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
          {highlights.map((item) => (
            <article key={item.label} className="kpi-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>

        <div className="report-grid">
          <article className="report-card">
            <div>
              <p className="kicker">Fluxo de caixa</p>
              <h3>Resumo mensal</h3>
              <p className="report-meta">Valores consolidados do trimestre.</p>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{"M\u00eas"}</th>
                    <th>Entradas</th>
                    <th>{"Sa\u00eddas"}</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>{row.income}</td>
                      <td>{row.expense}</td>
                      <td>{row.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
