"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

/**
 * Debounced search input — fires onChange 300ms after the user stops typing.
 * Keeps the parent's network calls cheap.
 */
export function ExploreSearch({ value, onChange, placeholder }: Props) {
  const [local, setLocal] = useState(value);

  // Sync external value (e.g. clear button)
  useEffect(() => {
    setLocal(value);
  }, [value]);

  // Debounced upstream propagation
  useEffect(() => {
    if (local === value) return;
    const id = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder ?? "Search the Five Nations…"}
        className="h-11 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
      />
      {local && (
        <button
          type="button"
          onClick={() => setLocal("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-konoha-forest/30 hover:text-konoha-orange"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
