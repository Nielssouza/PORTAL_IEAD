"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

const TEXT = {
  title: "Cadastrar evento",
  submit: "Adicionar evento",
  success: "Evento cadastrado com sucesso.",
  error: "Não foi possível cadastrar o evento.",
};

export default function EventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, time, description, location }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? TEXT.error);
      setLoading(false);
      return;
    }

    setTitle("");
    setDate("");
    setTime("");
    setDescription("");
    setLocation("");
    setMessage(TEXT.success);
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="event-form-header">
        <h4>{TEXT.title}</h4>
      </div>
      <div className="event-form-grid">
        <input
          type="text"
          placeholder="Título do evento"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
        <input
          type="text"
          placeholder="Local (opcional)"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
      </div>
      <textarea
        placeholder="Descrição (opcional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={2}
      />
      {error ? <span className="auth-error">{error}</span> : null}
      {message ? <span className="auth-success">{message}</span> : null}
      <button className="cta primary" type="submit" disabled={loading}>
        {loading ? "Salvando..." : TEXT.submit}
      </button>
    </form>
  );
}
