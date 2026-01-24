"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "portal-theme";
const THEME_OPTIONS = [
  { id: "light", label: "Claro" },
  { id: "blue", label: "Azul" },
  { id: "dark", label: "Escuro" },
] as const;

type Theme = (typeof THEME_OPTIONS)[number]["id"];

type ThemeOption = (typeof THEME_OPTIONS)[number];

function applyTheme(theme: Theme) {
  if (theme === "light") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved && THEME_OPTIONS.some((option) => option.id === saved)) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, []);

  function setThemeAndPersist(next: Theme) {
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Tema">
      {THEME_OPTIONS.map((option: ThemeOption) => (
        <button
          key={option.id}
          type="button"
          className={`theme-pill${theme === option.id ? " is-active" : ""}`}
          aria-pressed={theme === option.id}
          onClick={() => setThemeAndPersist(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
