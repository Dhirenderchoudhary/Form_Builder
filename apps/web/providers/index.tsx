"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useAuth } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc";
import { ToastProvider } from "@/components/konoha/toast";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

export function Providers({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getApiUrl()}/api/trpc`,
          headers: async () => {
            // Attach Clerk session token so protected procedures pass.
            // getToken returns null when signed out — that's fine for public routes.
            const token = await getToken().catch(() => null);
            return {
              "ngrok-skip-browser-warning": "true",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
