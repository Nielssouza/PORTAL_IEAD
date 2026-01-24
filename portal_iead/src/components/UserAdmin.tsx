"use client";

import { useState } from "react";
import type { FormEvent } from "react";

const TEXT = {
  sectionKicker: "Administra\u00e7\u00e3o",
  sectionTitle: "Cadastro e edi\u00e7\u00e3o de usu\u00e1rios",
  name: "Nome",
  email: "E-mail",
  password: "Senha",
  createUser: "Criar usu\u00e1rio",
  createError: "N\u00e3o foi poss\u00edvel criar usu\u00e1rio.",
  member: "Membro",
  admin: "Admin",
};

export default function UserAdmin() {
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });

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
      setError(payload.error ?? TEXT.createError);
      return;
    }

    setForm({ name: "", email: "", password: "", role: "member" });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  return (
    <section className="user-admin">
      <div className="board-header">
        <div>
          <p className="kicker">{TEXT.sectionKicker}</p>
          <h2>{TEXT.sectionTitle}</h2>
        </div>
      </div>
      <form className="user-form" onSubmit={handleCreate}>
        <input
          placeholder={TEXT.name}
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <input
          type="email"
          placeholder={TEXT.email}
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <input
          type="password"
          placeholder={TEXT.password}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
          <option value="member">{TEXT.member}</option>
          <option value="admin">{TEXT.admin}</option>
        </select>
        <button className="cta primary" type="submit">
          {TEXT.createUser}
        </button>
      </form>
      {error ? <span className="auth-error">{error}</span> : null}
    </section>
  );
}
