"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const FormViewDynamic = dynamic<{ slug: string }>(
  () => import("./form-view").then((mod) => mod.FormView as React.ComponentType<{ slug: string }>),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-konoha-orange" />
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Unsealing scroll…
          </p>
        </div>
      </div>
    ),
  }
);
