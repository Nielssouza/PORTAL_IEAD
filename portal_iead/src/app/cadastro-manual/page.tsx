import ManualUserRegistration from "@/components/ManualUserRegistration";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CadastroManualPage() {
  await requireAdmin();

  return (
    <main className="page members-page">
      <section className="section">
        <div className="section-head">
          <div>
            <p className="kicker">{"Administra\u00e7\u00e3o"}</p>
            <h1>{"Cadastro manual de usu\u00e1rios"}</h1>
            <p className="section-text">
              {
                "Cadastre manualmente ou importe uma planilha para agilizar o cadastro dos membros."
              }
            </p>
          </div>
          <div className="board-actions">
            <a className="cta ghost" href="/home">
              Voltar para o painel
            </a>
          </div>
        </div>
        <ManualUserRegistration />
      </section>
    </main>
  );
}
