import LogoutButton from "@/components/LogoutButton";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import BibleVerseTicker from "@/components/BibleVerseTicker";

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
  const db = getDb();
  const viewRows = db
    .prepare("SELECT path, count FROM page_views WHERE path IN (?, ?, ?)")
    .all("/", "/register", "/login") as Array<{ path: string; count: number }>;
  const viewMap = new Map(viewRows.map((row) => [row.path, row.count]));
  const indexViews = viewMap.get("/") ?? 0;
  const registerViews = viewMap.get("/register") ?? 0;
  const loginViews = viewMap.get("/login") ?? 0;
  const userDetails = db
    .prepare(
      `
        SELECT
          cpf,
          birth_date,
          member_type,
          has_role,
          role_title,
          baptized,
          baptism_date,
          profession,
          education_level,
          marital_status,
          address
        FROM users
        WHERE id = ?
        LIMIT 1
      `
    )
    .get(user.id) as
      | {
          cpf: string | null;
          birth_date: string | null;
          member_type: string | null;
          has_role: number | null;
          role_title: string | null;
          baptized: number | null;
          baptism_date: string | null;
          profession: string | null;
          education_level: string | null;
          marital_status: string | null;
          address: string | null;
        }
      | undefined;

  const humanize = (value?: string | null) => {
    if (!value) return "-";
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const baptizedLabel =
    userDetails?.baptized === 1 ? "Sim" : userDetails?.baptized === 0 ? "Não" : "-";
  const hasRoleLabel =
    userDetails?.member_type === "membro"
      ? userDetails?.has_role === 1
        ? "Sim"
        : userDetails?.has_role === 0
        ? "Não"
        : "-"
      : "-";

  const userInfo = [
    { label: "Nome", value: user.name },
    { label: "E-mail", value: user.email },
    { label: "Perfil", value: isAdmin ? "Admin" : "Membro" },
    {
      label: "Status",
      value:
        user.status === "active" ? "Ativo" : user.status === "pending" ? "Pendente" : "Bloqueado",
    },
    { label: "CPF", value: userDetails?.cpf || "-" },
    { label: "Nascimento", value: formatDate(userDetails?.birth_date) },
    { label: "Vínculo", value: humanize(userDetails?.member_type) },
    { label: "Possui cargo", value: hasRoleLabel },
    { label: "Cargo", value: userDetails?.role_title || "-" },
    { label: "Batizado", value: baptizedLabel },
    { label: "Data do batismo", value: formatDate(userDetails?.baptism_date) },
    { label: "Profissão", value: userDetails?.profession || "-" },
    { label: "Escolaridade", value: humanize(userDetails?.education_level) },
    { label: "Estado civil", value: humanize(userDetails?.marital_status) },
    { label: "Endereço", value: userDetails?.address || "-" },
  ];

  const notifications = [
    {
      title: "Novo cadastro pendente",
      detail: "Ana Paula Ribeiro aguardando validação.",
      time: "Hoje 09:20",
    },
    {
      title: "Relatório financeiro atualizado",
      detail: "Balancete de janeiro disponível.",
      time: "Ontem 18:05",
    },
    {
      title: "Agenda de domingo confirmada",
      detail: "Culto de celebração às 18:00.",
      time: "Ontem 10:40",
    },
  ];
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
        <div className="dashboard-intro">
          <p className="kicker">Painel interno</p>
          <h1>Bem-vindo, {user.name}</h1>
          <p className="section-text">
            Perfil atual: {isAdmin ? "Admin" : "Membro"}.{" "}
            {isAdmin
              ? "Use os m\u00f3dulos abaixo para administrar as \u00e1reas da igreja."
              : "Voc\u00ea tem acesso a cursos, certificados e ao quadro de avisos."}
          </p>
        </div>
        <div className="dashboard-side">
          <div className="dashboard-actions">
            <details className="popover">
              <summary className="icon-button" aria-label="Notifica\u00e7\u00f5es">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 18H9" />
                  <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2z" />
                </svg>
              </summary>
              <div className="popover-card notification-panel">
                <div>
                  <p className="kicker">{"Notifica\u00e7\u00f5es"}</p>
                  <h3>{"Atualiza\u00e7\u00f5es recentes"}</h3>
                  <p className="report-meta">{"Atividades importantes do dia"}</p>
                </div>
                <div className="notification-list">
                  {notifications.map((item) => (
                    <div key={item.title} className="notification-item">
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                      </div>
                      <small>{item.time}</small>
                    </div>
                  ))}
                </div>
              </div>
            </details>

            <details className="popover">
              <summary className="icon-button" aria-label="Usu\u00e1rio">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 21c-2.2-3.4-4.9-5-8-5s-5.8 1.6-8 5" />
                  <circle cx="12" cy="9" r="4" />
                </svg>
              </summary>
              <div className="popover-card user-panel">
                <div>
                  <p className="kicker">{"Usu\u00e1rio"}</p>
                  <h3>{"Dados completos"}</h3>
                  <p className="report-meta">{"Perfil e informa\u00e7\u00f5es cadastrais"}</p>
                </div>
                <div className="user-details">
                  {userInfo.map((item) => (
                    <div key={item.label} className="detail-item">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="user-actions">
                  <LogoutButton />
                </div>
              </div>
            </details>
          </div>
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

      <section className="dashboard-metrics">
        <div className="section-head">
          <div>
            <p className="kicker">{"Acessos"}</p>
            <h2>{"Monitoramento de p\u00e1ginas"}</h2>
            <p className="section-text">
              {"Contagem total de acessos \u00e0s p\u00e1ginas principais do portal."}
            </p>
          </div>
        </div>
        <div className="metrics-grid">
          <article className="metric-card">
            <div>
              <p className="kicker">{"P\u00e1gina inicial"}</p>
              <h3>{"Acessos \u00e0 index"}</h3>
              <p className="report-meta">{"http://localhost:3000/"}</p>
            </div>
            <strong className="metric-value">{indexViews}</strong>
            <span className="metric-note">{"Total acumulado"}</span>
          </article>
          <article className="metric-card">
            <div>
              <p className="kicker">{"Cadastro"}</p>
              <h3>{"Acessos ao /register"}</h3>
              <p className="report-meta">{"http://localhost:3000/register"}</p>
            </div>
            <strong className="metric-value">{registerViews}</strong>
            <span className="metric-note">{"Total acumulado"}</span>
          </article>
          <article className="metric-card">
            <div>
              <p className="kicker">{"Login"}</p>
              <h3>{"Acessos ao /login"}</h3>
              <p className="report-meta">{"http://localhost:3000/login"}</p>
            </div>
            <strong className="metric-value">{loginViews}</strong>
            <span className="metric-note">{"Total acumulado"}</span>
          </article>
        </div>
      </section>
      

    </main>
  );
}
