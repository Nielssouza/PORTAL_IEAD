"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
  status: "active" | "pending" | "disabled";
  createdAt: string;
};

export default function UserAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "member",
    status: "active",
    password: "",
  });

  async function loadUsers() {
    const response = await fetch("/api/users");
    if (!response.ok) return;
    const payload = await response.json();
    setUsers(payload.users ?? []);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Não foi possível criar usuário.");
      return;
    }

    setForm({ name: "", email: "", password: "", role: "member" });
    loadUsers();
  }

  function startEdit(user: User) {
    setEditingId(user.id);
    setEditForm({ name: user.name, role: user.role, status: user.status, password: "" });
  }

  async function handleUpdate(userId: number) {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Não foi possível atualizar usuário.");
      return;
    }

    setEditingId(null);
    loadUsers();
  }

  return (
    <section className="user-admin">
      <div className="board-header">
        <div>
          <p className="kicker">Administração</p>
          <h2>Cadastro e edição de usuários</h2>
        </div>
      </div>
      <form className="user-form" onSubmit={handleCreate}>
        <input
          placeholder="Nome"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <select
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value })}
        >
          <option value="member">Membro</option>
          <option value="admin">Admin</option>
        </select>
        <button className="cta primary" type="submit">Criar usuário</button>
      </form>
      {error ? <span className="auth-error">{error}</span> : null}
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <div className="user-badges">
              <span className="user-role">{user.role === "admin" ? "Admin" : "Membro"}</span>
              <span className={`user-status status-${user.status}`}>
                {user.status === "active"
                  ? "Ativo"
                  : user.status === "pending"
                  ? "Pendente"
                  : "Bloqueado"}
              </span>
            </div>
            {editingId === user.id ? (
              <div className="user-edit">
                <input
                  value={editForm.name}
                  onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                />
                <select
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm({ ...editForm, role: event.target.value as "admin" | "member" })
                  }
                >
                  <option value="member">Membro</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      status: event.target.value as "active" | "pending" | "disabled",
                    })
                  }
                >
                  <option value="active">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="disabled">Bloqueado</option>
                </select>
                <input
                  type="password"
                  placeholder="Nova senha (opcional)"
                  value={editForm.password}
                  onChange={(event) => setEditForm({ ...editForm, password: event.target.value })}
                />
                <div className="user-actions">
                  <button className="cta ghost" type="button" onClick={() => setEditingId(null)}>
                    Cancelar
                  </button>
                  <button className="cta primary" type="button" onClick={() => handleUpdate(user.id)}>
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <button className="cta small" type="button" onClick={() => startEdit(user)}>
                Editar
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
