import LogoutButton from "@/components/LogoutButton";
import { requireAuth } from "@/lib/auth";

const modules = [
  {
    title: "Secretaria",
    description: "Gest\u00e3o de documentos, cartas e atendimentos internos.",
    roles: ["admin"],
  },
  {
    title: "Membros",
    description: "Acompanhamento de cadastro, presen\u00e7a e hist\u00f3rico pastoral.",
    roles: ["admin"],
  },
  {
    title: "Tesouraria",
    description: "Controle financeiro, entradas e relat\u00f3rios da igreja.",
    roles: ["admin"],
  },
  {
    title: "Cursos",
    description: "Acesso aos cursos em que voc\u00ea est\u00e1 matriculado.",
    roles: ["admin", "member"],
  },
  {
    title: "Meus certificados",
    description: "Hist\u00f3rico de certificados e conquistas ministeriais.",
    roles: ["admin", "member"],
  },
  {
    title: "Quadro de avisos",
    description: "Publica\u00e7\u00f5es oficiais para toda a igreja.",
    roles: ["admin", "member"],
  },
];

const navLinks = [
  { label: "Membros", href: "/membros", roles: ["admin"] },
  { label: "Quadro de avisos", href: "/quadro-avisos", roles: ["admin", "member"] },
  { label: "Cadastro manual", href: "/cadastro-manual", roles: ["admin"] },
] as const;

export default async function HomePage() {
  const user = await requireAuth();
  const isAdmin = user.role === "admin";
  const role = isAdmin ? "admin" : "member";
  const memberGrowth = [
    { label: "Ago", value: 120 },
    { label: "Set", value: 138 },
    { label: "Out", value: 152 },
    { label: "Nov", value: 165 },
    { label: "Dez", value: 178 },
    { label: "Jan", value: 196 },
  ];
  const memberMax = Math.max(...memberGrowth.map((item) => item.value));

  const attendance = [
    { label: "S1", value: 68 },
    { label: "S2", value: 74 },
    { label: "S3", value: 71 },
    { label: "S4", value: 82 },
    { label: "S5", value: 88 },
    { label: "S6", value: 91 },
  ];
  const attendanceMax = Math.max(...attendance.map((item) => item.value));
  const lineWidth = 320;
  const lineHeight = 140;
  const linePadding = 12;
  const lineStep =
    attendance.length > 1 ? (lineWidth - linePadding * 2) / (attendance.length - 1) : 0;
  const linePoints = attendance
    .map((item, index) => {
      const x = linePadding + index * lineStep;
      const y =
        linePadding + (lineHeight - linePadding * 2) * (1 - item.value / attendanceMax);
      return `${x},${y}`;
    })
    .join(" ");

  const registrationSummary = [
    { label: "Total cadastrado", value: "428" },
    { label: "Pendentes", value: "32" },
    { label: "Ativos", value: "384" },
    { label: "Bloqueados", value: "12" },
  ];

  const recentUsers = [
    { name: "Ana Paula Ribeiro", email: "ana.ribeiro@email.com", status: "Pendente", date: "20/01/2026" },
    { name: "Marcos Vinicius Silva", email: "marcos.silva@email.com", status: "Ativo", date: "18/01/2026" },
    { name: "Larissa Gomes", email: "larissa.gomes@email.com", status: "Ativo", date: "16/01/2026" },
    { name: "Rafael Almeida", email: "rafael.almeida@email.com", status: "Pendente", date: "15/01/2026" },
  ];

  const financeHighlights = [
    { label: "Entradas (m\u00eas)", value: "R$ 42.380", note: "+8% no m\u00eas" },
    { label: "Sa\u00eddas (m\u00eas)", value: "R$ 27.910", note: "-3% no m\u00eas" },
    { label: "Saldo atual", value: "R$ 14.470", note: "Sa\u00fade financeira" },
  ];

  const financeRows = [
    { month: "Out/25", income: "R$ 38.900", expense: "R$ 25.200", balance: "R$ 13.700" },
    { month: "Nov/25", income: "R$ 40.150", expense: "R$ 26.400", balance: "R$ 13.750" },
    { month: "Dez/25", income: "R$ 41.600", expense: "R$ 28.100", balance: "R$ 13.500" },
    { month: "Jan/26", income: "R$ 42.380", expense: "R$ 27.910", balance: "R$ 14.470" },
  ];

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="kicker">Painel interno</p>
          <h1>Bem-vindo, {user.name}</h1>
          <p className="section-text">
            Perfil atual: {isAdmin ? "Admin" : "Membro"}.{" "}
            {isAdmin
              ? "Use os m\u00f3dulos abaixo para administrar as \u00e1reas da igreja."
              : "Voc\u00ea tem acesso a cursos, certificados e ao quadro de avisos."}
          </p>
        </div>
        <div className="dashboard-actions">
          <LogoutButton />
        </div>
      </header>

      <section className="dashboard-nav">
        {navLinks
          .filter((link) => link.roles.includes(role))
          .map((link) => (
            <a key={link.href} className="cta ghost" href={link.href}>
              {link.label}
            </a>
          ))}
      </section>

      <section className="module-grid">
        {modules
          .filter((module) => module.roles.includes(role))
          .map((module) => (
            <article key={module.title} className="module-card">
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
      </section>

      <section className="dashboard-reports">
        <div className="section-head">
          <div>
            <p className="kicker">{"Relat\u00f3rios"}</p>
            <h2>{"Vis\u00e3o geral da plataforma"}</h2>
            <p className="section-text">
              {"Gr\u00e1ficos e tabelas com dados simulados para leitura r\u00e1pida."}
            </p>
          </div>
        </div>

        <div className="report-grid">
          <article className="report-card chart-card">
            <div>
              <p className="kicker">Cadastros</p>
              <h3>Crescimento de membros</h3>
              <p className="report-meta">{"Evolu\u00e7\u00e3o nos \u00faltimos 6 meses"}</p>
            </div>
            <div className="chart-bars">
              {memberGrowth.map((item) => (
                <div
                  key={item.label}
                  className="chart-bar"
                  style={{ height: `${Math.round((item.value / memberMax) * 100)}%` }}
                >
                  <span className="bar-label">{item.label}</span>
                  <span className="bar-value">{item.value}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="report-card chart-card">
            <div>
              <p className="kicker">Engajamento</p>
              <h3>{"Participa\u00e7\u00e3o nos cultos"}</h3>
              <p className="report-meta">{"Percentual semanal de presen\u00e7a"}</p>
            </div>
            <div className="chart-line">
              <svg viewBox={`0 0 ${lineWidth} ${lineHeight}`} aria-hidden="true">
                <defs>
                  <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.02)" />
                  </linearGradient>
                </defs>
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="rgba(59,130,246,0.9)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="line-labels">
                {attendance.map((item) => (
                  <span key={item.label}>{item.label}</span>
                ))}
              </div>
            </div>
          </article>

          <article className="report-card report-summary">
            <div>
              <p className="kicker">Cadastro</p>
              <h3>Resumo de status</h3>
              <p className="report-meta">{"Distribui\u00e7\u00e3o geral dos perfis"}</p>
            </div>
            <div className="summary-grid">
              {registrationSummary.map((item) => (
                <div key={item.label} className="summary-item">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="report-card report-table">
            <div className="report-table-header">
              <div>
                <p className="kicker">{"Usu\u00e1rios"}</p>
                <h3>Cadastros recentes</h3>
                <p className="report-meta">{"Atualiza\u00e7\u00f5es na \u00faltima semana"}</p>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((userItem) => (
                    <tr key={`${userItem.email}-${userItem.date}`}>
                      <td>{userItem.name}</td>
                      <td>{userItem.email}</td>
                      <td>
                        <span className={`status-pill ${userItem.status.toLowerCase()}`}>
                          {userItem.status}
                        </span>
                      </td>
                      <td>{userItem.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="report-card report-finance">
            <div>
              <p className="kicker">Financeiro</p>
              <h3>{"Relat\u00f3rio financeiro"}</h3>
              <p className="report-meta">{"Consolidado mensal e saldo atual"}</p>
            </div>
            <div className="finance-grid">
              {financeHighlights.map((item) => (
                <div key={item.label} className="finance-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.note}</small>
                </div>
              ))}
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
                  {financeRows.map((row) => (
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
