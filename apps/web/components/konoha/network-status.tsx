"use client";

import { useQuery } from "@tanstack/react-query";

export function NetworkStatus() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["networkStatus"],
    queryFn: async () => {
      const res = await fetch("/api/backend/health.check", {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      return json?.result?.data ?? json?.data ?? json;
    },
    refetchInterval: 15_000,
  });

  const status = isLoading ? "checking" : isError ? "offline" : "online";
  const uptime = data?.uptime ?? null;

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
