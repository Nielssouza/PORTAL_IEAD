"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: username, password }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Não foi possível entrar.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/home");
    }, 2500);
  }

  return (
    <main className="auth-page">
      {success ? (
        <div className="auth-preloader" role="status" aria-live="polite">
          <div className="preloader-card">
            <div className="preloader-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <circle cx="32" cy="16" r="8" />
                <path d="M20 28c4 2 8 8 12 20" />
                <path d="M44 28c-4 2-8 8-12 20" />
                <path d="M26 26l6 8l6-8" />
              </svg>
            </div>
            <span className="preloader-text">Autenticação concluída</span>
          </div>
        </div>
      ) : null}

      <section className="auth-card">
        <div className="auth-brand">
          <a className="auth-logo" href="/">
          <div className="logo-shell">
            <Image
              src="/logo.jfif"
              alt="Logo Assembleia de Deus"
              width={72}
              height={72}
              className="logo"
            />
          </div>
          <div>
            <p className="brand-title">Assembleia de Deus</p>
            <span className="brand-sub">Ministério Missão Jardim das Oliveiras</span>
          </div>
        </a>
        </div>
        <div>
          <p className="kicker">Acesso restrito</p>
          <h1>Entrar no Portal</h1>
          <p className="section-text">
            Informe seu usuário e senha para acessar os módulos internos da igreja.
          </p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Usuário
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Seu usuário"
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              required
            />
          </label>
          {error ? <span className="auth-error">{error}</span> : null}
          <div className="form-actions">
            <button className="cta primary" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <a className="cta ghost" href="/registro">
              Cadastre-se
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}
