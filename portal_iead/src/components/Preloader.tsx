"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const start = Date.now();
    let timeoutId: number | null = null;

    const markLoaded = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(6000 - elapsed, 0);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => setLoaded(true), remaining);
    };

    if (document.readyState === "complete") {
      markLoaded();
    } else {
      window.addEventListener("load", markLoaded, { once: true });
    }

    timeoutId = window.setTimeout(() => setLoaded(true), 6000);

    return () => {
      window.removeEventListener("load", markLoaded);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div
      className={`preloader${loaded ? " is-loaded" : ""}`}
      aria-hidden={loaded}
    >
      <div className="preloader-card" role="status" aria-live="polite">
        <div className="preloader-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="16" r="8" />
            <path d="M20 28c4 2 8 8 12 20" />
            <path d="M44 28c-4 2-8 8-12 20" />
            <path d="M26 26l6 8l6-8" />
          </svg>
        </div>
        <span className="preloader-text">Carregando...</span>
      </div>
    </div>
  );
}
