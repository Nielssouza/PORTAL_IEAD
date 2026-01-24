"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "portal-theme";

export default function ThemeToggle() {
  const [isBlue, setIsBlue] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "blue") {
      document.documentElement.setAttribute("data-theme", "blue");
      setIsBlue(true);
    }
  }, []);

  function toggleTheme() {
    const next = !isBlue;
    setIsBlue(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "blue");
      window.localStorage.setItem(STORAGE_KEY, "blue");
    } else {
      document.documentElement.removeAttribute("data-theme");
      window.localStorage.setItem(STORAGE_KEY, "light");
    }
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme}>
      {isBlue ? "Voltar ao claro" : "Modo azul"}
    </button>
  );
}
