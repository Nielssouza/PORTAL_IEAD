"use client";

import { useEffect, useState } from "react";

type FavoriteLink = {
  id: string;
  label: string;
  href: string;
};

const STORAGE_KEY = "portal:favorites";

const LINKS: FavoriteLink[] = [
  { id: "membros", label: "Membros", href: "/membros" },
  { id: "quadro", label: "Quadro de avisos", href: "/quadro-avisos" },
  { id: "cadastro", label: "Cadastro manual", href: "/cadastro-manual" },
  { id: "relatorios", label: "Relat\u00f3rios", href: "#relatorios" },
];

const TEXT = {
  title: "Favoritos",
  subtitle: "Links fixos escolhidos por voc\u00ea.",
  edit: "Editar favoritos",
  done: "Concluir",
};

export default function UserFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
          return;
        }
      } catch {
        // ignore
      }
    }
    setFavorites(["membros", "quadro"]);
  }, []);

  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  const selected = LINKS.filter((link) => favorites.includes(link.id));

  function toggleFavorite(id: string) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <div className="favorites-card">
      <div className="favorites-header">
        <div>
          <p className="kicker">{TEXT.title}</p>
          <h3>{TEXT.title}</h3>
          <p className="report-meta">{TEXT.subtitle}</p>
        </div>
        <button className="cta ghost" type="button" onClick={() => setEditing((v) => !v)}>
          {editing ? TEXT.done : TEXT.edit}
        </button>
      </div>
      <div className="favorites-grid">
        {selected.map((link) => (
          <a key={link.id} className="favorite-card" href={link.href}>
            {link.label}
          </a>
        ))}
        {selected.length === 0 ? (
          <span className="section-text">Nenhum favorito selecionado.</span>
        ) : null}
      </div>
      {editing ? (
        <div className="favorites-editor">
          {LINKS.map((link) => (
            <label key={link.id} className="favorite-option">
              <input
                type="checkbox"
                checked={favorites.includes(link.id)}
                onChange={() => toggleFavorite(link.id)}
              />
              {link.label}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
