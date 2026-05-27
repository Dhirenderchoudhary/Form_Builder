"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "online" | "offline";

/**
 * Tiny status pill that pings the backend health endpoint.
 * Uses fetch (REST passthrough on the tRPC OpenAPI middleware) so
 * we don't need to wire the full tRPC client just to prove connectivity.
 */
export function NetworkStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const [uptime, setUptime] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    const ping = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/health`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        if (cancelled) return;
        setStatus("online");
        setUptime(json?.data?.uptime ?? json?.uptime ?? null);
      } catch {
        if (cancelled) return;
        setStatus("offline");
      }
    };

    ping();
    const id = setInterval(ping, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const dotColor =
    status === "online"
      ? "bg-konoha-orange shadow-[0_0_12px_#FF6B00]"
      : status === "offline"
        ? "bg-red-500"
        : "bg-konoha-gold";

  const label =
    status === "online"
      ? "Hokage Network · Online"
      : status === "offline"
        ? "Network · Offline"
        : "Connecting…";

  return (
    <div
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-konoha-forest/60 bg-konoha-ink/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md"
      title={uptime !== null ? `Uptime: ${uptime}s` : undefined}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </div>
  );
}
