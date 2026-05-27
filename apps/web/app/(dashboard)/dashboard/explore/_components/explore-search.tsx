"use client";

import { useRef } from "react";
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (raw: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(raw), 300);
  };

  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        aria-label="Search themes"
        defaultValue={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder ?? "Search the Five Nations\u2026"}
        className="h-11 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-konoha-forest/30 hover:text-konoha-orange"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
