"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Sale = {
  id: number;
  number: string;
  buyer: string;
  seller: string;
  paid: number;
  createdAt: string;
};

type Raffle = {
  id: number;
  name: string;
  description: string | null;
  drawDate: string;
  salesDeadline: string;
  quotaTotal: number;
  status: string;
  soldCount: number;
  paidCount: number;
  percent: number;
  sales: Sale[];
};

const TEXT = {
  formTitle: "Criar nova ação",
  create: "Criar ação",
  update: "Salvar edição",
  cancel: "Cancelar",
  addSale: "Registrar venda",
  export: "Exportar planilha",
  quota: "Quotas vendidas",
  percent: "Percentual vendido",
  drawDate: "Data do sorteio",
  deadline: "Prazo de compras",
};

const emptyForm = {
  name: "",
  description: "",
  drawDate: "",
  salesDeadline: "",
  quotaTotal: "",
  status: "Ativa",
};

const sampleRaffles: Raffle[] = [
  {
    id: 0,
    name: "Rifa Solidária - Janeiro",
    description: "Ação de apoio social para arrecadação de recursos.",
    drawDate: "10/02/2026",
    salesDeadline: "05/02/2026",
    quotaTotal: 200,
    status: "Exemplo",
    soldCount: 146,
    paidCount: 120,
    percent: 73,
    sales: [
      { id: 1, number: "001", buyer: "Maria Souza", seller: "João Lima", paid: 1, createdAt: "" },
      { id: 2, number: "014", buyer: "Lucas Silva", seller: "Ana Ribeiro", paid: 0, createdAt: "" },
      { id: 3, number: "055", buyer: "Carla Santos", seller: "João Lima", paid: 1, createdAt: "" },
      { id: 4, number: "110", buyer: "Rafael Almeida", seller: "Pr. Sérgio", paid: 1, createdAt: "" },
    ],
  },
  {
    id: 1,
    name: "Ação de Missões",
    description: "Campanha de arrecadação para projetos missionários.",
    drawDate: "20/03/2026",
    salesDeadline: "15/03/2026",
    quotaTotal: 120,
    status: "Exemplo",
    soldCount: 78,
    paidCount: 52,
    percent: 65,
    sales: [
      { id: 5, number: "007", buyer: "Fernanda Cruz", seller: "Equipe 1", paid: 1, createdAt: "" },
      { id: 6, number: "033", buyer: "Igor Rocha", seller: "Equipe 2", paid: 0, createdAt: "" },
      { id: 7, number: "070", buyer: "Helena Dias", seller: "Equipe 1", paid: 1, createdAt: "" },
    ],
  },
];

export default function RafflesManager() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ ...emptyForm });
  const [saleForms, setSaleForms] = useState<
    Record<number, { number: string; buyer: string; seller: string; paid: boolean }>
  >({});

  async function loadRaffles() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/raffles");
    if (!response.ok) {
      setError("Não foi possível carregar os sorteios.");
      setLoading(false);
      return;
    }
    const payload = await response.json();
    setRaffles(payload.raffles ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadRaffles();
  }, []);

  function updateSaleForm(raffleId: number, patch: Partial<{ number: string; buyer: string; seller: string; paid: boolean }>) {
    setSaleForms((prev) => ({
      ...prev,
      [raffleId]: { number: "", buyer: "", seller: "", paid: false, ...prev[raffleId], ...patch },
    }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/raffles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description.trim(),
        drawDate: form.drawDate,
        salesDeadline: form.salesDeadline,
        quotaTotal: Number(form.quotaTotal),
        status: form.status,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Não foi possível criar a ação.");
      return;
    }

    setForm({ ...emptyForm });
    await loadRaffles();
  }

  function startEdit(raffle: Raffle) {
    setEditingId(raffle.id);
    setEditForm({
      name: raffle.name,
      description: raffle.description ?? "",
      drawDate: raffle.drawDate,
      salesDeadline: raffle.salesDeadline,
      quotaTotal: String(raffle.quotaTotal),
      status: raffle.status,
    });
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    setError(null);

    const response = await fetch(`/api/raffles/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        drawDate: editForm.drawDate,
        salesDeadline: editForm.salesDeadline,
        quotaTotal: Number(editForm.quotaTotal),
        status: editForm.status,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Não foi possível atualizar a ação.");
      return;
    }

    setEditingId(null);
    await loadRaffles();
  }

  async function handleAddSale(raffleId: number, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saleForm = saleForms[raffleId] ?? { number: "", buyer: "", seller: "", paid: false };
    setError(null);

    const response = await fetch(`/api/raffles/${raffleId}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: saleForm.number.trim(),
        buyer: saleForm.buyer.trim(),
        seller: saleForm.seller.trim(),
        paid: saleForm.paid,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Não foi possível registrar a venda.");
      return;
    }

    updateSaleForm(raffleId, { number: "", buyer: "", seller: "", paid: false });
    await loadRaffles();
  }

  return (
    <div className="raffles-wrapper">
      {raffles.length === 0 ? (
        <div className="raffle-sample-banner">
          <p className="kicker">Exemplo</p>
          <p className="section-text">
            Nenhuma ação cadastrada ainda. Os cards abaixo são um exemplo do layout. Crie uma
            ação para começar.
          </p>
        </div>
      ) : null}
      <article className="report-card">
        <div>
          <p className="kicker">{TEXT.formTitle}</p>
          <h3>Nova ação de rifa</h3>
          <p className="report-meta">Preencha as informações para abrir uma nova campanha.</p>
        </div>
        <form className="raffle-form" onSubmit={handleCreate}>
          <div className="raffle-form-grid">
            <input
              type="text"
              placeholder="Nome da ação"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
            <input
              type="date"
              value={form.drawDate}
              onChange={(event) => setForm({ ...form, drawDate: event.target.value })}
              required
            />
            <input
              type="date"
              value={form.salesDeadline}
              onChange={(event) => setForm({ ...form, salesDeadline: event.target.value })}
              required
            />
            <input
              type="number"
              min={1}
              placeholder="Total de quotas"
              value={form.quotaTotal}
              onChange={(event) => setForm({ ...form, quotaTotal: event.target.value })}
              required
            />
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="Ativa">Ativa</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Encerrada">Encerrada</option>
            </select>
          </div>
          <textarea
            placeholder="Descrição da ação (opcional)"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            rows={2}
          />
          <button className="cta primary" type="submit">
            {TEXT.create}
          </button>
        </form>
      </article>

      {error ? <p className="auth-error">{error}</p> : null}
      {loading ? <p className="section-text">Carregando ações...</p> : null}

      <div className="report-grid">
        {(raffles.length > 0 ? raffles : sampleRaffles).map((raffle) => {
          const percent = raffle.percent ?? Math.round((raffle.soldCount / raffle.quotaTotal) * 100);
          const saleForm = saleForms[raffle.id] ?? { number: "", buyer: "", seller: "", paid: false };
          const isSample = raffle.status === "Exemplo";
          return (
            <article key={raffle.id} className="report-card raffle-card">
              <div className="raffle-header">
                <div>
                  <p className="kicker">Ação</p>
                  <h3>{raffle.name}</h3>
                  <p className="report-meta">{raffle.description || "Sem descrição adicional."}</p>
                </div>
                <div className="raffle-actions">
                  <span className={isSample ? "status-pill pendente" : "status-pill ativo"}>
                    {raffle.status}
                  </span>
                  {isSample ? null : (
                    <a className="cta ghost" href={`/api/raffles/${raffle.id}/export`}>
                      {TEXT.export}
                    </a>
                  )}
                  {isSample ? null : (
                    <button className="cta ghost" type="button" onClick={() => startEdit(raffle)}>
                      Editar ação
                    </button>
                  )}
                </div>
              </div>

              {editingId === raffle.id && !isSample ? (
                <form className="raffle-form" onSubmit={handleUpdate}>
                  <div className="raffle-form-grid">
                    <input
                      type="text"
                      placeholder="Nome da ação"
                      value={editForm.name}
                      onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                      required
                    />
                    <input
                      type="date"
                      value={editForm.drawDate}
                      onChange={(event) => setEditForm({ ...editForm, drawDate: event.target.value })}
                      required
                    />
                    <input
                      type="date"
                      value={editForm.salesDeadline}
                      onChange={(event) => setEditForm({ ...editForm, salesDeadline: event.target.value })}
                      required
                    />
                    <input
                      type="number"
                      min={1}
                      value={editForm.quotaTotal}
                      onChange={(event) => setEditForm({ ...editForm, quotaTotal: event.target.value })}
                      required
                    />
                    <select
                      value={editForm.status}
                      onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}
                    >
                      <option value="Ativa">Ativa</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Encerrada">Encerrada</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Descrição da ação"
                    value={editForm.description}
                    onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                    rows={2}
                  />
                  <div className="raffle-edit-actions">
                    <button className="cta primary" type="submit">
                      {TEXT.update}
                    </button>
                    <button className="cta ghost" type="button" onClick={() => setEditingId(null)}>
                      {TEXT.cancel}
                    </button>
                  </div>
                </form>
              ) : null}

              <div className="raffle-info">
                <div>
                  <span>{TEXT.drawDate}</span>
                  <strong>{raffle.drawDate}</strong>
                </div>
                <div>
                  <span>{TEXT.deadline}</span>
                  <strong>{raffle.salesDeadline}</strong>
                </div>
                <div>
                  <span>{TEXT.quota}</span>
                  <strong>
                    {raffle.soldCount}/{raffle.quotaTotal}
                  </strong>
                </div>
                <div>
                  <span>{TEXT.percent}</span>
                  <strong>{percent}%</strong>
                </div>
              </div>

              <div className="raffle-progress">
                <span style={{ width: `${Math.min(percent, 100)}%` }} />
              </div>

              {isSample ? null : (
                <form className="raffle-sale-form" onSubmit={(event) => handleAddSale(raffle.id, event)}>
                  <div className="raffle-form-grid">
                    <input
                      type="text"
                      placeholder="Número"
                      value={saleForm.number}
                      onChange={(event) => updateSaleForm(raffle.id, { number: event.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Comprador"
                      value={saleForm.buyer}
                      onChange={(event) => updateSaleForm(raffle.id, { buyer: event.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Vendedor"
                      value={saleForm.seller}
                      onChange={(event) => updateSaleForm(raffle.id, { seller: event.target.value })}
                      required
                    />
                    <label className="checkbox-field">
                      <input
                        type="checkbox"
                        checked={saleForm.paid}
                        onChange={(event) => updateSaleForm(raffle.id, { paid: event.target.checked })}
                      />
                      Pago
                    </label>
                  </div>
                  <button className="cta ghost" type="submit">
                    {TEXT.addSale}
                  </button>
                </form>
              )}

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Comprador</th>
                      <th>Vendedor</th>
                      <th>Pagamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raffle.sales.length === 0 ? (
                      <tr>
                        <td colSpan={4}>Nenhum número vendido ainda.</td>
                      </tr>
                    ) : (
                      raffle.sales.map((sale) => (
                        <tr key={sale.id}>
                          <td>{sale.number}</td>
                          <td>{sale.buyer}</td>
                          <td>{sale.seller}</td>
                          <td>
                            <span className={sale.paid ? "status-pill ativo" : "status-pill pendente"}>
                              {sale.paid ? "Pago" : "Pendente"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
