import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import UserFavorites from "@/components/UserFavorites";
import EventForm from "@/components/EventForm";
import HeaderPopovers from "@/components/HeaderPopovers";
import QuickNavSearch from "@/components/QuickNavSearch";

export const dynamic = "force-dynamic";

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
    title: "Sorteios",
    description: "Gerencie rifas, quotas e vendas de n\u00famero.",
    roles: ["admin"],
  },
  {
    title: "Escola B\u00edblica",
    description: "Matr\u00edculas, chamada e conte\u00fado da Escola B\u00edblica.",
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

type Role = "admin" | "member";

const navLinks: Array<{ label: string; href: string; roles: Role[] }> = [
  { label: "Membros", href: "/membros", roles: ["admin"] },
  { label: "Secretaria", href: "/secretaria", roles: ["admin"] },
  { label: "Tesouraria", href: "/tesouraria", roles: ["admin"] },
  { label: "Cursos", href: "/cursos", roles: ["admin", "member"] },
  { label: "Meus certificados", href: "/meus-certificados", roles: ["admin", "member"] },
  { label: "Escola B\u00edblica", href: "/escola-biblica", roles: ["admin"] },
  { label: "Sorteios", href: "/sorteios", roles: ["admin"] },
  { label: "Quadro de avisos", href: "/quadro-avisos", roles: ["admin", "member"] },
  { label: "Cadastro manual", href: "/cadastro-manual", roles: ["admin"] },
];

export default async function HomePage() {
  const user = await requireAuth();
  const isAdmin = user.role === "admin";
  const role = isAdmin ? "admin" : "member";
  const allowedLinks = navLinks.filter((link) => link.roles.includes(role));
  const db = await getDb();
  const viewRows: Array<{ path: string; count: number | string }> = (
    await db.query<{ path: string; count: number | string }>(
      "SELECT path, count FROM page_views WHERE path IN ($1, $2, $3)",
      ["/", "/register", "/login"]
    )
  ).rows;
  const viewMap = new Map(viewRows.map((row) => [row.path, Number(row.count)]));
  const indexViews = viewMap.get("/") ?? 0;
  const registerViews = viewMap.get("/register") ?? 0;
  const loginViews = viewMap.get("/login") ?? 0;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayRegistrationsRow = (await db.query<{ count: string }>(
    "SELECT COUNT(*) as count FROM users WHERE created_at::date = $1::date",
    [todayKey]
  )).rows[0];
  const pendingRow = (await db.query<{ count: string }>(
    "SELECT COUNT(*) as count FROM users WHERE status = 'pending'"
  )).rows[0];
  const approvalsRow = (await db.query<{ count: string }>(
    "SELECT COUNT(*) as count FROM users WHERE status = 'active' AND created_at::date = $1::date",
    [todayKey]
  )).rows[0];
  const totalUsersRow = (await db.query<{ count: string }>(
    "SELECT COUNT(*) as count FROM users"
  )).rows[0];

  const todayRegistrations = Number(todayRegistrationsRow?.count ?? 0);
  const pendingCount = Number(pendingRow?.count ?? 0);
  const approvalsToday = Number(approvalsRow?.count ?? 0);
  const totalUsers = Number(totalUsersRow?.count ?? 0);

  const kpiCards = [
    { label: "Cadastros hoje", value: String(todayRegistrations) },
    { label: "Pendentes", value: String(pendingCount) },
    { label: "Aprovações do dia", value: String(approvalsToday) },
    { label: "Total de membros", value: String(totalUsers) },
  ];

  const alerts = [
    pendingCount > 0
      ? {
          title: "Cadastros aguardando",
          detail: `${pendingCount} cadastros pendentes para aprovação.`,
          tone: "warn",
        }
      : {
          title: "Sem pendências",
          detail: "Nenhum cadastro pendente no momento.",
          tone: "success",
        },
    {
      title: "Saldo mensal",
      detail: "Saldo atual abaixo da meta sugerida.",
      tone: "info",
    },
  ];

  const quickActions = [
    { label: "Membros", href: "/membros" },
    { label: "Quadro de avisos", href: "/quadro-avisos" },
    { label: "Cadastro", href: "/cadastro-manual" },
    { label: "Relatórios", href: "#relatorios" },
  ];

  const weekdayMap = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\u00e1b"];
  const eventRows: Array<{
    title: string;
    description: string | null;
    date: string;
    time: string;
  }> = (
    await db.query<{
      title: string;
      description: string | null;
      date: string;
      time: string;
    }>(
      "SELECT title, description, event_date as date, event_time as time FROM events WHERE event_date >= CURRENT_DATE ORDER BY event_date ASC, event_time ASC LIMIT 14"
    )
  ).rows;

  const fallbackEvents = [
    { title: "Culto de Celebra\u00e7\u00e3o", time: "Dom 18:00", date: "" },
    { title: "Conex\u00e3o de Jovens", time: "Sex 20:00", date: "" },
    { title: "Intercess\u00e3o e Cura", time: "Qua 19:30", date: "" },
    { title: "Discipulado", time: "Ter 19:30", date: "" },
  ];

  const upcomingEvents = eventRows.map((event) => {
    const dateObj = new Date(`${event.date}T00:00:00`);
    const dayLabel = weekdayMap[dateObj.getDay()] ?? "";
    return {
      title: event.title,
      description: event.description ?? "",
      time: `${dayLabel} ${event.time}`.trim(),
      date: event.date,
      rawTime: event.time,
    };
  });

  const weeklyEvents =
    upcomingEvents.length > 0
      ? upcomingEvents.slice(0, 4).map((event) => ({ title: event.title, time: event.time }))
      : fallbackEvents;

  const buildDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const weekCalendar = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const dateKey = buildDateKey(date);
    const label = weekdayMap[date.getDay()] ?? "";
    const matched = upcomingEvents.find((event) => event.date === dateKey);
    return {
      day: label,
      label: matched?.title ?? "Livre",
      time: matched?.rawTime ?? "",
    };
  });

  const timeline = [
    {
      title: "Login administrativo",
      detail: "Administrador acessou o painel.",
      time: "Hoje 08:40",
    },
    {
      title: "Cadastro aprovado",
      detail: "Sérgio Araújo atualizado para ativo.",
      time: "Ontem 18:12",
    },
    {
      title: "Novo aviso publicado",
      detail: "Agenda de domingo atualizada.",
      time: "Ontem 10:05",
    },
  ];
  const userDetails = (
    await db.query<{
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
    }>(
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
        WHERE id = $1
        LIMIT 1
      `,
      [user.id]
    )
  ).rows[0];

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
          <HeaderPopovers notifications={notifications} userInfo={userInfo} />
        </div>
      </header>

      <section className="dashboard-nav">
        {allowedLinks.map((link) => (
          <a key={link.href} className="cta ghost" href={link.href}>
            {link.label}
          </a>
        ))}
        <QuickNavSearch items={allowedLinks.map((link) => ({ label: link.label, href: link.href }))} />
      </section>

      <section className="home-overview">
        <div className="kpi-grid">
          {kpiCards.map((item) => (
            <article key={item.label} className="kpi-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
        <div className="alert-card">
          <div>
            <p className="kicker">{"Alertas"}</p>
            <h3>{"Atenções importantes"}</h3>
          </div>
          <div className="alert-list">
            {alerts.map((alert) => (
              <div key={alert.title} className={`alert-item ${alert.tone}`}>
                <strong>{alert.title}</strong>
                <span>{alert.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-quick">
        <div className="quick-actions">
          <div>
            <p className="kicker">{"Atalhos rápidos"}</p>
            <h2>{"Acesso rápido aos módulos"}</h2>
            <p className="section-text">
              {"Botões grandes para ir direto ao que você precisa."}
            </p>
          </div>
          <div className="quick-grid">
            {quickActions.map((item) => (
              <a key={item.label} className="quick-card" href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <UserFavorites />
      </section>

      <section className="home-events">
        <article className="events-card">
          <div>
            <p className="kicker">{"Agenda semanal"}</p>
            <h3>{"Pr\u00f3ximos encontros"}</h3>
            <p className="report-meta">{"Programa\u00e7\u00e3o resumida da semana"}</p>
          </div>
          <ul>
            {weeklyEvents.map((event) => (
              <li key={event.title}>
                <span className="event-icon" aria-hidden="true">●</span>
                <div>
                  <strong>{event.title}</strong>
                  <span>{event.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </article>
        <article className="calendar-card">
          <div>
            <p className="kicker">{"Semana"}</p>
            <h3>{"Mini-calendário"}</h3>
            <p className="report-meta">{"Visão rápida dos encontros"}</p>
          </div>
          <div className="calendar-grid">
            {weekCalendar.map((day) => (
              <div key={day.day} className="calendar-item">
                <span>{day.day}</span>
                <strong>{day.label}</strong>
                <small>{day.time || "-"}</small>
              </div>
            ))}
          </div>
          <div className="mini-attendance">
            {attendance.map((item) => (
              <div key={item.label} className="mini-bar">
                <span style={{ height: `${Math.round((item.value / attendanceMax) * 100)}%` }} />
                <small>{item.label}</small>
              </div>
            ))}
          </div>
          {isAdmin ? <EventForm /> : null}
        </article>
      </section>

      <section className="home-timeline">
        <div className="section-head">
          <div>
            <p className="kicker">{"Atividades"}</p>
            <h2>{"Timeline recente"}</h2>
            <p className="section-text">{"Acompanhe os últimos eventos do sistema."}</p>
          </div>
        </div>
        <div className="timeline-list">
          {timeline.map((item) => (
            <div key={item.title} className="timeline-item">
              <div>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
              <small>{item.time}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="module-grid">
        {modules
          .filter((module) => module.roles.includes(role))
          .map((module) => {
            const moduleId = module.title
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
            return (
              <article key={module.title} id={moduleId} className="module-card">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </article>
            );
          })}
      </section>

      <section id="relatorios" className="dashboard-reports">
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
