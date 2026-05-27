"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg";
}

const widthMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

/**
 * Themed modal — Konoha scroll card with corner ornaments.
 * Locks body scroll when open, closes on Escape and backdrop click.
 */
export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "md",
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      />

      {/* Panel */}
      <div
        className={`scroll-card relative z-10 w-full ${widthMap[width]} animate-[slideUp_0.25s_cubic-bezier(0.4,0,0.2,1)]`}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-konoha-forest/30 hover:text-konoha-orange"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            {subtitle && (
              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
                {subtitle}
              </p>
            )}
            <h2
              id="dialog-title"
              className="font-heading text-2xl font-black tracking-tight"
            >
              {title}
            </h2>
          </div>

          {children}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/**
 * Themed text input for use inside dialogs and forms.
 */
export function KonohaInput({
  label,
  hint,
  error,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
      <input
        {...rest}
        className={`h-11 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20 ${
          error ? "border-konoha-akatsuki" : ""
        } ${className}`}
      />
      {error ? (
        <span className="text-xs text-konoha-akatsuki">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

/**
 * Themed textarea.
 */
export function KonohaTextarea({
  label,
  hint,
  error,
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
      <textarea
        {...rest}
        className={`min-h-[88px] rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20 ${
          error ? "border-konoha-akatsuki" : ""
        } ${className}`}
      />
      {error ? (
        <span className="text-xs text-konoha-akatsuki">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}
