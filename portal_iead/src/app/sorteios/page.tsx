import { requireAdmin } from "@/lib/auth";
import RafflesManager from "@/components/RafflesManager";

const TEXT = {
  kicker: "Sorteios",
  title: "Gest\u00e3o de rifas",
  description:
    "Controle a\u00e7\u00f5es, vendas de n\u00fameros, pagamentos e datas de sorteio.",
  back: "Voltar para o painel",
};

export default async function SorteiosPage() {
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
        <RafflesManager />
      </section>
    </main>
  );
}
