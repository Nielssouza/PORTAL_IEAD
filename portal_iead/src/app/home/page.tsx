import NoticeBoard from "@/components/NoticeBoard";
import LogoutButton from "@/components/LogoutButton";
import UserAdmin from "@/components/UserAdmin";
import { requireAuth } from "@/lib/auth";

const modules = [
  {
    title: "Secretaria",
    description: "Gest?o de documentos, cartas e atendimentos internos.",
  },
  {
    title: "Membros",
    description: "Acompanhamento de cadastro, presen?a e hist?rico pastoral.",
  },
  {
    title: "Tesouraria",
    description: "Controle financeiro, entradas e relat?rios da igreja.",
  },
  {
    title: "Cursos",
    description: "Matr?culas, turmas e trilhas de ensino b?blico.",
  },
  {
    title: "Sorteios",
    description: "Campanhas, inscri??es e resultados para eventos.",
  },
  {
    title: "Meus certificados",
    description: "Hist?rico de certificados e conquistas ministeriais.",
  },
  {
    title: "Cadastro e edi??o de usu?rios",
    description: "Gerencie permiss?es e acessos da equipe.",
    adminOnly: true,
  },
];

export default function HomePage() {
  const user = requireAuth();
  const isAdmin = user.role === "admin";

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="kicker">Painel interno</p>
          <h1>Bem-vindo, {user.name}</h1>
          <p className="section-text">
            Perfil atual: {isAdmin ? "Admin" : "Membro"}. Use os m?dulos abaixo para
            administrar as ?reas da igreja.
          </p>
        </div>
        <div className="dashboard-actions">
          <LogoutButton />
        </div>
      </header>

      <section className="module-grid">
        {modules
          .filter((module) => (module.adminOnly ? isAdmin : true))
          .map((module) => (
            <article key={module.title} className="module-card">
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
      </section>

      <NoticeBoard />

      {isAdmin ? <UserAdmin /> : null}
    </main>
  );
}
