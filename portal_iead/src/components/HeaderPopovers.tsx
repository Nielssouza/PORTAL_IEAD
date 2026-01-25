"use client";

import { useEffect, useRef, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

type NotificationItem = {
  title: string;
  detail: string;
  time: string;
};

type UserDetail = {
  label: string;
  value: string;
};

type HeaderPopoversProps = {
  notifications: NotificationItem[];
  userInfo: UserDetail[];
};

export default function HeaderPopovers({ notifications, userInfo }: HeaderPopoversProps) {
  const [open, setOpen] = useState<"notifications" | "user" | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(null);
      }
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const toggle = (panel: "notifications" | "user") => {
    setOpen((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="dashboard-actions" ref={containerRef}>
      <div className="popover">
        <button
          type="button"
          className="icon-button"
          aria-label="Notificações"
          aria-expanded={open === "notifications"}
          onClick={() => toggle("notifications")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 18H9" />
            <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2z" />
          </svg>
        </button>
        {open === "notifications" ? (
          <div className="popover-card notification-panel">
            <div>
              <p className="kicker">{"Notificações"}</p>
              <h3>{"Atualizações recentes"}</h3>
              <p className="report-meta">{"Atividades importantes do dia"}</p>
            </div>
            <div className="notification-list">
              {notifications.map((item) => (
                <div key={item.title} className="notification-item">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <small>{item.time}</small>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="popover">
        <button
          type="button"
          className="icon-button"
          aria-label="Usuário"
          aria-expanded={open === "user"}
          onClick={() => toggle("user")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 21c-2.2-3.4-4.9-5-8-5s-5.8 1.6-8 5" />
            <circle cx="12" cy="9" r="4" />
          </svg>
        </button>
        {open === "user" ? (
          <div className="popover-card user-panel">
            <div>
              <p className="kicker">{"Usuário"}</p>
              <h3>{"Dados completos"}</h3>
              <p className="report-meta">{"Perfil e informações cadastrais"}</p>
            </div>
            <div className="user-details">
              {userInfo.map((item) => (
                <div key={item.label} className="detail-item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="user-actions">
              <LogoutButton />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
