"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-konoha-orange" />
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Unsealing scroll…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
