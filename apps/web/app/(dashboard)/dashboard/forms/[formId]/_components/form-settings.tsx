"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/konoha/toast";

interface Props {
  form: {
    id: string;
    title: string;
    description: string | null;
    visibility: "public" | "unlisted";
    collectEmail: boolean;
    successMessage: string | null;
    maxResponses: number | null;
    settings: Record<string, unknown>;
    themeId?: string | null;
  };
}

export function FormSettingsPanel({ form }: Props) {
  const toast = useToast();
  const utils = trpc.useUtils();

  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description ?? "");
  const [visibility, setVisibility] = useState(form.visibility);
  const [collectEmail, setCollectEmail] = useState(form.collectEmail);
  const [successMessage, setSuccessMessage] = useState(
    form.successMessage ?? "",
  );
  const [maxResponses, setMaxResponses] = useState<string>(
    form.maxResponses?.toString() ?? "",
  );
  const [oneResponsePerIp, setOneResponsePerIp] = useState(
    Boolean((form.settings as { oneResponsePerIp?: boolean })?.oneResponsePerIp),
  );
  const [themeId, setThemeId] = useState<string | null>(form.themeId ?? null);

  const themesQuery = trpc.explore.listThemes.useQuery();
  const themes = (themesQuery.data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    colors: { primary: string; accent: string };
  }>;

  useEffect(() => {
    setTitle(form.title);
    setDescription(form.description ?? "");
    setVisibility(form.visibility);
    setCollectEmail(form.collectEmail);
    setSuccessMessage(form.successMessage ?? "");
    setMaxResponses(form.maxResponses?.toString() ?? "");
    setThemeId(form.themeId ?? null);
  }, [form]);

  const update = trpc.forms.update.useMutation({
    onSuccess: async () => {
      await utils.forms.list.invalidate();
      await utils.forms.get.invalidate({ formId: form.id });
      toast.push({
        variant: "success",
        title: "Settings sealed",
        message: "Your changes are saved.",
      });
    },
    onError: (err) => {
      toast.push({
        variant: "error",
        title: "Save failed",
        message: err.message?.slice(0, 120) ?? "Try again.",
      });
    },
  });

  const dirty =
    title !== form.title ||
    description !== (form.description ?? "") ||
    visibility !== form.visibility ||
    collectEmail !== form.collectEmail ||
    successMessage !== (form.successMessage ?? "") ||
    maxResponses !== (form.maxResponses?.toString() ?? "") ||
    themeId !== (form.themeId ?? null) ||
    oneResponsePerIp !==
      Boolean((form.settings as { oneResponsePerIp?: boolean })?.oneResponsePerIp);

  const save = () => {
    const cap = maxResponses.trim();
    update.mutate({
      formId: form.id,
      title,
      description: description.trim() || undefined,
      visibility,
      collectEmail,
      successMessage: successMessage.trim() || undefined,
      maxResponses: cap ? Number(cap) : undefined,
      themeId: themeId ?? undefined,
      settings: {
        oneResponsePerIp,
      },
    });
  };

  return (
    <div className="space-y-6">
      <SettingsSection title="Identity" description="How the scroll appears in the village.">
        <Field label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 text-sm text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
          />
        </Field>
        <Field label="Description" hint="A short brief shown above the form.">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="min-h-[88px] w-full resize-none rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-2.5 text-sm leading-relaxed text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
          />
        </Field>
      </SettingsSection>

      <SettingsSection title="Visibility & Access" description="Who can find this scroll.">
        <Field label="Visibility">
          <div className="grid grid-cols-2 gap-2">
            <RadioCard
              active={visibility === "unlisted"}
              onClick={() => setVisibility("unlisted")}
              title="Unlisted"
              description="Only people with the link can respond."
            />
            <RadioCard
              active={visibility === "public"}
              onClick={() => setVisibility("public")}
              title="Public"
              description="Listed on the Village Map for anyone to find."
            />
          </div>
        </Field>

        <Toggle
          label="Collect respondent's email"
          hint="Adds an email field at the end. Respondents get a confirmation."
          checked={collectEmail}
          onChange={setCollectEmail}
        />

        <Toggle
          label="One response per IP"
          hint="Block duplicate submissions from the same network."
          checked={oneResponsePerIp}
          onChange={setOneResponsePerIp}
        />
      </SettingsSection>

      <SettingsSection
        title="Theme"
        description="The visual world your scroll lives in."
      >
        <Field
          label="Applied theme"
          hint="Themes restyle the public scroll page. Default uses Hidden Leaf."
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            <ThemeRadio
              active={!themeId}
              onClick={() => setThemeId(null)}
              name="None"
              description="Use the default Konoha look"
              swatches={["#FF6B00", "#00D4FF"]}
            />
            {themesQuery.isLoading ? (
              <div className="col-span-2 h-16 animate-pulse rounded-md bg-konoha-forest/20 md:col-span-2" />
            ) : (
              themes.map((t) => (
                <ThemeRadio
                  key={t.id}
                  active={themeId === t.id}
                  onClick={() => setThemeId(t.id)}
                  name={t.name}
                  description={t.description ?? "Custom palette"}
                  swatches={[t.colors.primary, t.colors.accent]}
                />
              ))
            )}
          </div>
        </Field>
      </SettingsSection>

      <SettingsSection
        title="Limits"
        description="Cap responses or close the scroll automatically."
      >
        <Field label="Max responses" hint="Leave empty for unlimited.">
          <input
            type="number"
            min={1}
            value={maxResponses}
            onChange={(e) => setMaxResponses(e.target.value)}
            placeholder="Unlimited"
            className="h-11 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 text-sm text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
          />
        </Field>
      </SettingsSection>

      <SettingsSection
        title="After Submission"
        description="The message respondents see after sending the scroll."
      >
        <Field label="Success message">
          <textarea
            value={successMessage}
            onChange={(e) => setSuccessMessage(e.target.value)}
            rows={3}
            placeholder="Thank you, shinobi. Your scroll has been delivered."
            className="min-h-[88px] w-full resize-none rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-2.5 text-sm leading-relaxed text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
          />
        </Field>
      </SettingsSection>

      <div className="sticky bottom-0 -mx-4 -mb-4 mt-4 flex items-center justify-end gap-3 border-t border-konoha-forest/40 bg-konoha-ink/95 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8">
        <span className="mr-auto text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {dirty ? "Unsealed changes" : "All sealed"}
        </span>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || update.isPending}
          className="btn-rasengan h-10 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-5 font-heading text-xs uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] transition-shadow hover:shadow-[0_0_30px_rgba(255,107,0,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {update.isPending ? "Sealing…" : "Seal changes"}
        </button>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-card p-5">
      <div className="mb-4">
        <h3 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-foreground">
          {title}
        </h3>
        <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>
      {children}
      {hint && (
        <p className="mt-1.5 text-[10px] text-muted-foreground/70">{hint}</p>
      )}
    </div>
  );
}

function RadioCard({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border p-3 text-left transition-all ${
        active
          ? "border-konoha-orange/60 bg-konoha-orange/10 shadow-[0_0_16px_rgba(255,107,0,0.15)]"
          : "border-konoha-forest/60 bg-konoha-ink/40 hover:border-konoha-forest"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            active ? "bg-konoha-orange shadow-[0_0_6px_#FF6B00]" : "bg-konoha-forest"
          }`}
        />
        <p
          className={`text-xs font-medium ${
            active ? "text-konoha-orange" : "text-foreground"
          }`}
        >
          {title}
        </p>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </button>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-konoha-forest/40 bg-konoha-ink/40 p-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {hint && (
          <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-konoha-orange" : "bg-konoha-forest"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function ThemeRadio({
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
      className={`group relative flex flex-col gap-2 rounded-md border p-3 text-left transition-all ${
        active
          ? "border-konoha-orange/60 bg-konoha-orange/10 shadow-[0_0_16px_rgba(255,107,0,0.15)]"
          : "border-konoha-forest/60 bg-konoha-ink/40 hover:border-konoha-forest"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {swatches.map((c, i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-full"
            style={{
              background: c,
              boxShadow: `0 0 6px ${c}80`,
            }}
          />
        ))}
        {active && (
          <span className="ml-auto text-[9px] font-medium uppercase tracking-[0.2em] text-konoha-orange">
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
      <p className="line-clamp-2 text-[10px] leading-snug text-muted-foreground">
        {description}
      </p>
    </button>
  );
}
