"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
};

export default function QuickNavSearch({ items }: { items: NavItem[] }) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.label.toLowerCase().includes(term));
  }, [items, query]);

  function handleNavigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div className="nav-search" ref={wrapperRef}>
      <input
        type="search"
        placeholder="Buscar tela..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        aria-label="Buscar telas"
      />
      {open ? (
        <div className="nav-search-panel" role="listbox">
          {filtered.length === 0 ? (
            <p className="nav-search-empty">Nenhuma tela encontrada.</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.href}
                type="button"
                className="nav-search-item"
                onClick={() => handleNavigate(item.href)}
              >
                {item.label}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
