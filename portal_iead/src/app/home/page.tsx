import LogoutButton from "@/components/LogoutButton";
import UserAdmin from "@/components/UserAdmin";
import { requireAuth } from "@/lib/auth";

const modules = [
  {
    title: "Secretaria",
    description: "Gestão de documentos, cartas e atendimentos internos.",
    roles: ["admin"],
  },
  {
    title: "Membros",
    description: "Acompanhamento de cadastro, presença e histórico pastoral.",
    roles: ["admin"],
  },
  {
    title: "Tesouraria",
    description: "Controle financeiro, entradas e relatórios da igreja.",
    roles: ["admin"],
  },
  {
    title: "Cursos",
    description: "Acesso aos cursos em que você está matriculado.",
    roles: ["admin", "member"],
  },
  {
    title: "Meus certificados",
    description: "Histórico de certificados e conquistas ministeriais.",
    roles: ["admin", "member"],
  },
  {
    title: "Quadro de avisos",
    description: "Publicações oficiais para toda a igreja.",
    roles: ["admin", "member"],
  },
  {
    title: "Cadastro e edição de usuários",
    description: "Gerencie permissões e acessos da equipe.",
    roles: ["admin"],
  },
];

export default async function HomePage() {
  const user = await requireAuth();
  const isAdmin = user.role === "admin";

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="kicker">Painel interno</p>
          <h1>Bem-vindo, {user.name}</h1>
          <p className="section-text">
            Perfil atual: {isAdmin ? "Admin" : "Membro"}.{" "}
            {isAdmin
              ? "Use os módulos abaixo para administrar as áreas da igreja."
              : "Você tem acesso a cursos, certificados e ao quadro de avisos."}
          </p>
        </div>
        <div className="dashboard-actions">
          <a className="cta ghost" href="/quadro-avisos">
            Acessar Quadro de avisos
          </a>
          <LogoutButton />
        </div>
      </header>

      <section className="module-grid">
        {modules
          .filter((module) => module.roles.includes(isAdmin ? "admin" : "member"))
          .map((module) => (
            <article key={module.title} className="module-card">
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
      </section>

      {isAdmin ? <UserAdmin /> : null}
    </main>
  );
}
