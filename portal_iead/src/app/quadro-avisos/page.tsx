import NoticeBoard from "@/components/NoticeBoard";

export default function QuadroAvisosPage() {
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
