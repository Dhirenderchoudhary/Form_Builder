"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { KonohaLeaf } from "@/components/konoha/leaf";
import { FieldRenderer } from "./field";
import { validateAllFields, validateField } from "../_lib/validate";
import { isFieldVisible, splitIntoPages, type FormPage } from "../_lib/conditional";
import type { PublicForm, PublicField, AnswerValue } from "../types";

interface Props {
  slug: string;
}

interface FormError {
  code?: string;
  message: string;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "ok"; form: PublicForm }
  | { kind: "locked"; title: string; slug: string; error?: string }
  | { kind: "blocked"; reason: "closed" | "expired" | "full"; message: string }
  | { kind: "not-found" };

/**
 * Public form viewer.
 * - Loads form via public.getForm (no auth)
 * - Tracks view on mount, start on first interaction (debounced)
 * - Validates client-side, submits via public.submit
 * - Supports multi-page forms with page navigation
 * - Evaluates conditional logic to show/hide fields
 * - Renders themed success state with the form's success message
 */
export function FormView({ slug }: Props) {
  const [values, setValues] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [honeypot, setHoneypot] = useState("");

  const startedRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());

  // Check localStorage for previous submission
  useEffect(() => {
    try {
      const key = `konoha_submitted_${slug}`;
      if (localStorage.getItem(key)) {
        setAlreadySubmitted(true);
      }
    } catch {}
  }, [slug]);

  const formQuery = trpc.public.getForm.useQuery({
    slug,
    password: password ?? undefined,
  });

  let state: LoadState = { kind: "loading" };
  if (formQuery.isLoading || formQuery.isFetching) {
    state = { kind: "loading" };
  } else if (formQuery.isError) {
    const msg = formQuery.error?.message ?? "";
    const lower = msg.toLowerCase();
    if (lower.includes("not accepting")) {
      state = { kind: "blocked", reason: "closed", message: msg };
    } else if (lower.includes("expired")) {
      state = { kind: "blocked", reason: "expired", message: msg };
    } else if (lower.includes("maximum") || lower.includes("full")) {
      state = { kind: "blocked", reason: "full", message: msg };
    } else {
      state = { kind: "not-found" };
    }
  } else if (formQuery.data) {
    const data = formQuery.data as PublicForm | { passwordRequired: true; title: string; slug: string };
    if ("passwordRequired" in data && data.passwordRequired) {
      state = {
        kind: "locked",
        title: data.title,
        slug: data.slug,
        error: password ? "Insufficient chakra — wrong seal." : undefined,
      };
    } else {
      state = { kind: "ok", form: data as PublicForm };
    }
  }

  const prevFormId = useRef<string | null>(null);
  if (state.kind === "ok" && state.form.id !== prevFormId.current) {
    prevFormId.current = state.form.id;
    const init: Record<string, AnswerValue> = {};
    for (const f of state.form.fields) {
      if (f.type === "scale") {
        const min = f.minValue ?? 0;
        const max = f.maxValue ?? 100;
        init[f.id] = Math.floor((min + max) / 2);
      }
    }
    setValues(init);
    startTimeRef.current = Date.now();
  }

  // Compute visible fields and pages
  const visibleFields = useMemo(() => {
    if (state.kind !== "ok") return [];
    return state.form.fields.filter((f) => isFieldVisible(f, values));
  }, [state.kind === "ok" ? state.form.fields : null, values]);

  const pages = useMemo(() => splitIntoPages(visibleFields), [visibleFields]);
  const isMultiPage = pages.length > 1;
  const currentPage = pages[currentPageIdx] ?? pages[0];
  const isLastPage = currentPageIdx >= pages.length - 1;

  // Track view once we know the form ID
  const trackEvent = trpc.public.trackEvent.useMutation();
  useEffect(() => {
    if (state.kind !== "ok") return;
    trackEvent.mutate({
      formId: state.form.id,
      event: "view",
      referrer:
        typeof document !== "undefined" ? document.referrer || undefined : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.kind === "ok" ? state.form.id : null]);

  // Track start on first interaction
  const handleFirstInteract = () => {
    if (startedRef.current || state.kind !== "ok") return;
    startedRef.current = true;
    trackEvent.mutate({
      formId: state.form.id,
      event: "start",
    });
  };

  const submit = trpc.public.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      // Mark as submitted in localStorage to block duplicates
      try {
        localStorage.setItem(`konoha_submitted_${slug}`, Date.now().toString());
      } catch {}
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err) => {
      const e = err as unknown as FormError;
      setServerError(e?.message ?? "Submission failed.");
    },
  });

  // Look up the form's applied theme (if any) and build inline CSS overrides.
  const themesQuery = trpc.explore.listThemes.useQuery(undefined, {
    enabled: state.kind === "ok" && !!state.form.themeId,
  });

  const themeStyle = useMemo<React.CSSProperties>(() => {
    if (state.kind !== "ok" || !state.form.themeId) return {};
    const themes = (themesQuery.data ?? []) as Array<{
      id: string;
      colors: {
        primary: string;
        background: string;
        surface: string;
        text: string;
        textMuted: string;
        accent: string;
        border: string;
        error: string;
      };
      fonts: { heading: string; body: string };
    }>;
    const theme = themes.find((t) => t.id === state.form.themeId);
    if (!theme) return {};

    return {
      ["--background" as string]: hexToHsl(theme.colors.background),
      ["--foreground" as string]: hexToHsl(theme.colors.text),
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
      ["--theme-primary" as string]: theme.colors.primary,
      ["--theme-accent" as string]: theme.colors.accent,
      ["--theme-surface" as string]: theme.colors.surface,
      ["--theme-border" as string]: theme.colors.border,
      ["--theme-text-muted" as string]: theme.colors.textMuted,
      ["--theme-heading" as string]: theme.fonts.heading,
    } as React.CSSProperties;
  }, [state, themesQuery.data]);

  // Validate fields on the current page
  const validateCurrentPage = useCallback((): boolean => {
    if (!currentPage) return true;
    const pageErrors = validateAllFields(currentPage.fields, values);
    if (Object.keys(pageErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...pageErrors }));
      const firstId = Object.keys(pageErrors)[0];
      if (firstId) {
        const el = document.getElementById(`field-${firstId}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    return true;
  }, [currentPage, values]);

  const handleNext = () => {
    if (!validateCurrentPage()) return;
    setCurrentPageIdx((i) => Math.min(pages.length - 1, i + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    setCurrentPageIdx((i) => Math.max(0, i - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind !== "ok") return;

    setServerError(null);

    // For multi-page, only validate the last page on submit (previous pages already validated)
    if (!validateCurrentPage()) return;

    setErrors({});

    // Only include visible fields in submission
    const answers: Array<{ fieldId: string; value: AnswerValue }> = [];
    for (const f of visibleFields) {
      const val = values[f.id] ?? null;
      if (val !== null && val !== "" && !(Array.isArray(val) && val.length === 0)) {
        answers.push({ fieldId: f.id, value: val });
      }
    }

    if (answers.length === 0) {
      setServerError("Please answer at least one field.");
      return;
    }

    submit.mutate({
      slug,
      answers,
      password: password ?? undefined,
      _honeypot: honeypot ? honeypot : undefined,
      completionTimeMs: Date.now() - startTimeRef.current,
      metadata: {
        referer:
          typeof document !== "undefined" ? document.referrer || undefined : undefined,
      },
    });
  };

  // ----- Loading -----
  if (state.kind === "loading") {
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

  // ----- Not found -----
  if (state.kind === "not-found") {
    return <CenteredCard
      icon={<AlertCircle className="h-7 w-7 text-konoha-akatsuki" />}
      title="Scroll not found"
      description="This scroll doesn't exist, or has been sealed away by the village."
    />;
  }

  // ----- Locked (password seal) -----
  if (state.kind === "locked") {
    return (
      <PasswordGate
        title={state.title}
        error={state.error}
        onSubmit={(pw) => {
          setPassword(pw);
        }}
      />
    );
  }

  // ----- Blocked -----
  if (state.kind === "blocked") {
    const map = {
      closed: { title: "Scroll sealed", desc: "This scroll is no longer accepting responses." },
      expired: { title: "Scroll expired", desc: "The deadline has passed." },
      full: { title: "Quota filled", desc: "This scroll has received the maximum number of responses." },
    } as const;
    const { title, desc } = map[state.reason];
    return <CenteredCard
      icon={<AlertTriangle className="h-7 w-7 text-konoha-gold" />}
      title={title}
      description={desc}
    />;
  }

  // ----- Already submitted (localStorage check) -----
  if (alreadySubmitted && state.kind === "ok" && state.form.settings?.oneResponsePerIp) {
    return (
      <div className="relative mx-auto max-w-2xl px-4 py-16 md:py-24">
        <div className="scroll-card relative overflow-hidden p-8 text-center md:p-12">
          <div className="mx-auto mb-6 w-16 animate-chakra-pulse">
            <KonohaLeaf size={64} color="#00D4FF" glow />
          </div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-chakra">
            Already Submitted · 提出済み
          </p>
          <h1 className="font-heading text-3xl font-black text-konoha-chakra md:text-4xl">
            You've already responded.
          </h1>
          <div className="mx-auto mt-4 h-px w-24 bg-konoha-chakra/40" />
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Your scroll has already been delivered to the Hokage's office. Each shinobi can only respond once.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-konoha-chakra" />
            Response recorded
          </div>
        </div>
      </div>
    );
  }

  // ----- Success -----
  if (submitted) {
    return (
      <div className="relative mx-auto max-w-2xl px-4 py-16 md:py-24">
        <div className="scroll-card relative overflow-hidden p-8 text-center md:p-12">
          <div className="mx-auto mb-6 w-16 animate-chakra-pulse">
            <KonohaLeaf size={64} color="#FF6B00" glow />
          </div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
            Mission Accepted · 任務受諾
          </p>
          <h1 className="font-heading text-3xl font-black text-konoha-orange md:text-4xl text-glow-orange">
            Scroll delivered.
          </h1>
          <div className="mx-auto mt-4 h-px w-24 chakra-divider" />
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            {state.form.successMessage ??
              "Your scroll has been delivered to the Hokage's office. Report at dawn, shinobi."}
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-konoha-orange" />
            Submission sealed in the village vault
          </div>
        </div>
      </div>
    );
  }

  // ----- Form view -----
  const { form } = state;
  const fieldsToRender = currentPage?.fields ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-16" style={themeStyle}>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 w-14">
          <KonohaLeaf size={56} color="#FF6B00" glow />
        </div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
          Mission Scroll · 巻物
        </p>
        <h1 className="font-heading text-3xl font-black tracking-tight md:text-5xl text-glow-orange">
          {form.title}
        </h1>
        {form.description && (
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
            {form.description}
          </p>
        )}
        <div className="mx-auto mt-6 h-px w-24 chakra-divider" />
      </div>

      {/* Progress bar for multi-page */}
      {isMultiPage && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Page {currentPageIdx + 1} of {pages.length}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-konoha-orange">
              {Math.round(((currentPageIdx + 1) / pages.length) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-konoha-forest/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-konoha-orange to-[#cc4400] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(255,107,0,0.5)]"
              style={{ width: `${((currentPageIdx + 1) / pages.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Page title */}
      {isMultiPage && currentPage?.title && (
        <div className="mb-6 text-center">
          <h2 className="font-heading text-xl font-bold tracking-wide text-foreground">
            {currentPage.title}
          </h2>
          {currentPage.description && (
            <p className="mt-1 text-sm text-muted-foreground">{currentPage.description}</p>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="scroll-card p-4 sm:p-6 md:p-10">
        {/* Honeypot field - visually hidden but accessible to bots */}
        <div style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0, zIndex: -1 }} aria-hidden="true">
          <label htmlFor={`_hp_${form.id}`}>Name (Do not fill this out if you are human)</label>
          <input
            id={`_hp_${form.id}`}
            name={`_hp_${form.id}`}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          {fieldsToRender.map((field) => {
            const error = errors[field.id];
            return (
              <div
                key={field.id}
                id={`field-${field.id}`}
                className="scroll-mt-24 animate-[fadeInUp_0.3s_ease]"
              >
                {field.type !== "checkbox" && (
                  <label className="mb-2 flex items-baseline gap-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    <span>{field.label}</span>
                    {field.required && <span className="text-konoha-orange">✦</span>}
                  </label>
                )}
                <FieldRenderer
                  field={field}
                  value={values[field.id] ?? null}
                  onChange={(v) => {
                    setValues((prev) => ({ ...prev, [field.id]: v }));
                    if (errors[field.id]) {
                      const valid = validateField(field, v);
                      setErrors((prev) => {
                        const next = { ...prev };
                        if (!valid) delete next[field.id];
                        else next[field.id] = valid;
                        return next;
                      });
                    }
                  }}
                  onFirstInteract={handleFirstInteract}
                  error={error}
                  disabled={submit.isPending}
                />
                {field.helpText && !error && (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/70">
                    {field.helpText}
                  </p>
                )}
                {error && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-konoha-akatsuki">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mt-6 flex items-start gap-3 rounded-md border border-konoha-akatsuki/40 bg-konoha-akatsuki/5 p-4 text-sm text-konoha-akatsuki">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

        {/* Navigation / Submit */}
        <div className="mt-8 flex flex-col items-center gap-3">
          {isMultiPage ? (
            <div className="flex w-full items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentPageIdx === 0}
                className="flex h-12 items-center gap-2 rounded-md border border-konoha-forest/60 px-5 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-all hover:border-konoha-orange hover:text-konoha-orange disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              {isLastPage ? (
                <button
                  type="submit"
                  disabled={submit.isPending}
                  className="btn-rasengan flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-8 font-heading text-xs uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(255,107,0,0.4)] transition-shadow hover:shadow-[0_0_50px_rgba(255,107,0,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submit.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sealing…
                    </>
                  ) : (
                    "Submit Scroll"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-rasengan flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-8 font-heading text-xs uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(255,107,0,0.4)] transition-shadow hover:shadow-[0_0_50px_rgba(255,107,0,0.6)]"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="submit"
              disabled={submit.isPending}
              className="btn-rasengan flex h-12 min-w-[220px] items-center justify-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-8 font-heading text-xs uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(255,107,0,0.4)] transition-shadow hover:shadow-[0_0_50px_rgba(255,107,0,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submit.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sealing…
                </>
              ) : (
                "Submit Scroll"
              )}
            </button>
          )}
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Powered by Konoha Forms
          </p>
        </div>
      </form>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function CenteredCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <div className="scroll-card flex flex-col items-center gap-4 p-10 text-center">
        {icon}
        <h1 className="font-heading text-2xl font-black tracking-tight">{title}</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function PasswordGate({
  title,
  error,
  onSubmit,
}: {
  title: string;
  error?: string;
  onSubmit: (password: string) => void;
}) {
  const [pw, setPw] = useState("");
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16 md:py-24">
      <div className="scroll-card flex flex-col items-center gap-5 p-8 text-center md:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-konoha-akatsuki/40 bg-konoha-akatsuki/10 text-konoha-akatsuki">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M6 11V7a6 6 0 0 1 12 0v4M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
          </svg>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-akatsuki">
            Password Seal · 封印
          </p>
          <h1 className="mt-2 font-heading text-2xl font-black tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            This scroll is sealed. Speak the password to unlock it.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pw.trim()) onSubmit(pw);
          }}
          className="flex w-full flex-col gap-3"
        >
          <input
            type="password"
            autoFocus
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter the seal"
            className="h-11 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-4 text-center text-sm tracking-[0.3em] text-foreground placeholder:text-muted-foreground/50 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
          />
          {error && (
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-konoha-akatsuki">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!pw.trim()}
            className="btn-rasengan flex h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] font-heading text-xs uppercase tracking-[0.2em] text-white shadow-[0_0_24px_rgba(255,107,0,0.35)] hover:shadow-[0_0_40px_rgba(255,107,0,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            Break the seal
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Convert "#RRGGBB" to "H S% L%" string used by HSL CSS custom props.
 * Returns "0 0% 0%" on parse failure rather than throwing.
 */
function hexToHsl(hex: string): string {
  const match = hex.replace("#", "").match(/^([a-f0-9]{6})$/i);
  if (!match) return "0 0% 0%";
  const num = parseInt(match[1]!, 16);
  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
