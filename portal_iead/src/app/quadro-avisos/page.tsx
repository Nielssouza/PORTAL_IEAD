import NoticeBoard from "@/components/NoticeBoard";
import { requireAuth } from "@/lib/auth";

export default async function QuadroAvisosPage() {
  await requireAuth();
  return (
    <main className="page board-page">
      <section className="section">
        <div className="board-actions">
          <a className="cta ghost" href="/home">
            Voltar para o painel
          </a>
        </div>
        <NoticeBoard />
      </section>
    </main>
  );
}
