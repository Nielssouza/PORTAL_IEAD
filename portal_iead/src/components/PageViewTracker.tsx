"use client";

import { useEffect } from "react";

type PageViewTrackerProps = {
  path: string;
};

export default function PageViewTracker({ path }: PageViewTrackerProps) {
  useEffect(() => {
    if (!path) return;

    const payload = JSON.stringify({ path });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/metrics/page-view", blob);
      return;
    }

    fetch("/api/metrics/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  }, [path]);

  return null;
}
