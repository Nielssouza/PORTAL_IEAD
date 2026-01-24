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
] as const;

export default async function HomePage() {
  const user = await requireAuth();
  const isAdmin = user.role === "admin";
  const role = isAdmin ? "admin" : "member";

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
    </main>
  );
}
