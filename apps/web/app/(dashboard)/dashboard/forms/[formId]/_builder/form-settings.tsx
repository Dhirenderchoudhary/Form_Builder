"use client";

import { useState } from "react";
import { ScrollText, Palette, Clock, Hash, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { BuilderForm } from "./types";
import { PasswordSection } from "./password-section";
import { QrCodeSection } from "./qr-code-section";

interface Props {
  form: BuilderForm;
  onChange: (patch: Partial<BuilderForm>) => void;
}

const inputCls =
  "w-full h-10 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20";

const textareaCls =
  "w-full min-h-[88px] rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20";

const labelCls =
  "block text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground";

interface AvailableTheme {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  colors: { primary: string; accent: string };
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function FormSettings({ form, onChange }: Props) {
  const themesQuery = trpc.explore.listThemes.useQuery();
  const themes = (themesQuery.data ?? []) as AvailableTheme[];

  const [slugError, setSlugError] = useState<string | null>(null);

  const handleSlugChange = (raw: string) => {
    // Auto-sanitize: lowercase, replace spaces with hyphens, strip invalid chars
    const sanitized = raw
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    setSlugError(null);
    if (sanitized && !SLUG_REGEX.test(sanitized)) {
      setSlugError("Use only lowercase letters, numbers, and hyphens");
    }
    onChange({ slug: sanitized });
  };

  // Format closesAt for datetime-local input
  const closesAtValue = (() => {
    if (!form.closesAt) return "";
    const d = typeof form.closesAt === "string" ? new Date(form.closesAt) : form.closesAt;
    // Convert to local datetime string for input
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  })();

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-konoha-forest/60 bg-konoha-ink text-konoha-orange">
          <ScrollText className="h-3.5 w-3.5" />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Scroll Settings
        </span>
      </div>

      <label className="flex flex-col gap-2">
        <span className={labelCls}>Scroll title</span>
        <input
          className={inputCls}
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelCls}>Brief</span>
        <textarea
          className={textareaCls}
          value={form.description ?? ""}
          placeholder="What does this scroll capture?"
          onChange={(e) => onChange({ description: e.target.value || null })}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelCls}>Success message</span>
        <textarea
          className={textareaCls}
          value={form.successMessage ?? ""}
          placeholder="Thank you, shinobi. Your scroll has been delivered."
          onChange={(e) => onChange({ successMessage: e.target.value || null })}
        />
      </label>

      <Toggle
        label="Public scroll"
        description="Public scrolls can appear in the Village Map directory"
        checked={form.visibility === "public"}
        onChange={(v) =>
          onChange({ visibility: v ? "public" : "unlisted" })
        }
      />

      <Toggle
        label="Collect respondent email"
        description="Add a hidden email field for confirmation messages"
        checked={form.collectEmail}
        onChange={(v) => onChange({ collectEmail: v })}
      />

      {/* ──── Custom Slug ──── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={labelCls}>Custom Slug</span>
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <Hash className="h-3 w-3" />
            URL path
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">/f/</span>
          <input
            className={`${inputCls} font-mono`}
            value={form.slug}
            placeholder="my-form-slug"
            onChange={(e) => handleSlugChange(e.target.value)}
          />
        </div>
        {slugError && (
          <p className="flex items-center gap-1 text-[11px] text-konoha-akatsuki">
            <AlertCircle className="h-3 w-3" />
            {slugError}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground/70">
          Changing the slug will break existing links to this scroll.
        </p>
      </div>

      {/* ──── Response Limit ──── */}
      <div className="flex flex-col gap-3 rounded-md border border-konoha-forest/40 bg-konoha-ink/30 p-3">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-konoha-orange/80" />
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange/80">
            Expiry & Limits
          </span>
        </div>

        <label className="flex flex-col gap-2">
          <span className={labelCls}>Max responses</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.maxResponses ?? ""}
              placeholder="Unlimited"
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value, 10) : null;
                onChange({ maxResponses: val && val > 0 ? val : null });
              }}
            />
            {form.maxResponses && (
              <button
                type="button"
                onClick={() => onChange({ maxResponses: null })}
                className="shrink-0 text-[9px] uppercase tracking-[0.2em] text-konoha-akatsuki hover:text-konoha-akatsuki/80"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/70">
            Stop accepting responses after this many submissions.
          </p>
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelCls}>Closes at</span>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              className={`${inputCls} text-xs`}
              value={closesAtValue}
              onChange={(e) => {
                const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                onChange({ closesAt: val });
              }}
            />
            {form.closesAt && (
              <button
                type="button"
                onClick={() => onChange({ closesAt: null })}
                className="shrink-0 text-[9px] uppercase tracking-[0.2em] text-konoha-akatsuki hover:text-konoha-akatsuki/80"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/70">
            Automatically seal the scroll after this date.
          </p>
        </label>
      </div>

      <div className="flex flex-col gap-4 border-t border-konoha-forest/30 pt-4">
        <label className="flex flex-col gap-2">
          <span className={labelCls}>Password Protection</span>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder={form.settings?.passwordHash ? "••••••••" : "Enter a password..."}
              className={`${inputCls} text-xs`}
              onBlur={async (e) => {
                const val = e.target.value;
                if (!val) return;
                const msgBuffer = new TextEncoder().encode(val);
                const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
                
                onChange({ settings: { ...form.settings, passwordHash: hash } });
                e.target.value = ""; // clear after saving
              }}
            />
            {form.settings?.passwordHash && (
              <button
                type="button"
                onClick={() => onChange({ settings: { ...form.settings, passwordHash: undefined } })}
                className="shrink-0 text-[9px] uppercase tracking-[0.2em] text-konoha-akatsuki hover:text-konoha-akatsuki/80"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/70">
            Require a password to access the form.
          </p>
        </label>
      </div>

      {/* Theme picker */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={labelCls}>Theme</span>
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <Palette className="h-3 w-3" />
            {themes.length} available
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ThemeChoice
            active={!form.themeId}
            onClick={() => onChange({ themeId: null })}
            name="None"
            description="Default Konoha"
            swatches={["#FF6B00", "#00D4FF"]}
          />
          {themesQuery.isLoading ? (
            <div className="h-16 animate-pulse rounded-md bg-konoha-forest/20" />
          ) : (
            themes.map((t) => (
              <ThemeChoice
                key={t.id}
                active={form.themeId === t.id}
                onClick={() => onChange({ themeId: t.id })}
                name={t.name}
                description={t.description ?? "Custom palette"}
                swatches={[t.colors.primary, t.colors.accent]}
              />
            ))
          )}
        </div>
      </div>

      <PasswordSection
        formId={form.id}
        hasPassword={!!form.settings?.passwordHash}
      />

      <QrCodeSection formId={form.id} slug={form.slug} />
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-md border border-konoha-forest/40 bg-konoha-ink/30 p-3 text-left transition-colors hover:border-konoha-orange/50"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
        )}
      </div>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-konoha-orange shadow-[0_0_12px_rgba(255,107,0,0.5)]" : "bg-konoha-forest/60"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function ThemeChoice({
  active,
  onClick,
  name,
  description,
  swatches,
}: {
  active: boolean;
  onClick: () => void;
  name: string;
  description: string;
  swatches: string[];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-1.5 rounded-md border p-3 text-left transition-all ${
        active
          ? "border-konoha-orange/60 bg-konoha-orange/10 shadow-[0_0_16px_rgba(255,107,0,0.15)]"
          : "border-konoha-forest/60 bg-konoha-ink/40 hover:border-konoha-forest"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {swatches.map((c, i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: c,
              boxShadow: `0 0 6px ${c}80`,
            }}
          />
        ))}
        {active && (
          <span className="ml-auto text-[8px] font-medium uppercase tracking-[0.2em] text-konoha-orange">
            Active
          </span>
        )}
      </div>
      <p
        className={`text-xs font-medium ${
          active ? "text-konoha-orange" : "text-foreground"
        }`}
      >
        {name}
      </p>
      <p className="line-clamp-1 text-[10px] leading-snug text-muted-foreground">
        {description}
      </p>
    </button>
  );
}
