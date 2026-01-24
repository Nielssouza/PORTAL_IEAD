import LogoutButton from "@/components/LogoutButton";
import UserAdmin from "@/components/UserAdmin";
import { requireAdmin } from "@/lib/auth";

export default async function CadastroUsuariosPage() {
  const user = await requireAdmin();

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="kicker">Administração</p>
          <h1>Cadastro de usuários</h1>
          <p className="section-text">
            Olá, {user.name}. Cadastre novos membros e ajuste as permissões de acesso.
          </p>
        </div>
        <div className="dashboard-actions">
          <a className="cta ghost" href="/home">Voltar ao painel</a>
          <LogoutButton />
        </div>
      </header>

      <UserAdmin />
    </main>
  );
}
