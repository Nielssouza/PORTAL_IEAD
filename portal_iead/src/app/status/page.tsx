import { requireAuth } from "@/lib/auth";

async function getHealth() {
  const res = await fetch("/api/health", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Falha ao consultar a API");
  }
  return res.json();
}

export default async function StatusPage() {
  await requireAuth();
  const data = await getHealth();

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Status</p>
        <h1>API respondendo</h1>
        <p>Timestamp: {data.timestamp}</p>
      </section>
    </main>
  );
}
