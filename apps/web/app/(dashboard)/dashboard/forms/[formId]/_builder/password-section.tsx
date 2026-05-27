"use client";

import { useState } from "react";
import { Lock, Unlock, Eye, EyeOff, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/konoha/toast";

interface Props {
  formId: string;
  hasPassword: boolean;
}

/**
 * Konoha-themed password gate for a form.
 * Stores SHA-256 hash server-side via forms.setPassword.
 */
export function PasswordSection({ formId, hasPassword }: Props) {
  const toast = useToast();
  const utils = trpc.useUtils();
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(!hasPassword);
  const [value, setValue] = useState("");

  const setPassword = trpc.forms.setPassword.useMutation({
    onSuccess: async () => {
      await utils.forms.get.invalidate({ formId });
      await utils.forms.list.invalidate();
      setEditing(false);
      setValue("");
    },
    onError: (err) =>
      toast.push({
        variant: "error",
        title: "Could not save seal",
        message: err.message?.slice(0, 120) ?? "Try again.",
      }),
  });

  const apply = () => {
    if (!value || value.length < 4) {
      toast.push({
        variant: "error",
        title: "Seal too weak",
        message: "Use at least 4 characters.",
      });
      return;
    }
    setPassword.mutate({ formId, password: value });
    toast.push({
      variant: "success",
      title: "Seal applied",
      message: "Only those who know the seal can submit.",
    });
  };

  const clear = () => {
    setPassword.mutate({ formId, password: null });
    toast.push({
      variant: "success",
      title: "Seal removed",
      message: "Anyone can submit now.",
    });
    setEditing(true);
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-konoha-forest/40 bg-konoha-ink/30 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded ${
              hasPassword
                ? "bg-konoha-akatsuki/15 text-konoha-akatsuki"
                : "bg-konoha-forest/20 text-muted-foreground"
            }`}
          >
            {hasPassword ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </span>
          <p className="text-sm font-medium text-foreground">
            Password seal
          </p>
        </div>
        {hasPassword && !editing && (
          <span className="text-[9px] uppercase tracking-[0.25em] text-konoha-akatsuki">
            Active
          </span>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {hasPassword
          ? "Respondents must enter the seal to view and submit this scroll."
          : "Lock the scroll. Only those with the seal can fill it out."}
      </p>

      {hasPassword && !editing ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-konoha-forest/60 px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange"
          >
            Change seal
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={setPassword.isPending}
            className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-konoha-akatsuki/40 px-3 text-[10px] uppercase tracking-[0.18em] text-konoha-akatsuki hover:bg-konoha-akatsuki/10 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="At least 4 characters"
              className="h-10 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 pr-9 text-sm text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-konoha-orange"
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={apply}
              disabled={!value || setPassword.isPending}
              className="btn-rasengan flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-4 font-heading text-[10px] uppercase tracking-[0.18em] text-white shadow-[0_0_16px_rgba(255,107,0,0.25)] disabled:opacity-50 disabled:shadow-none"
            >
              {setPassword.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Sealing
                </>
              ) : hasPassword ? (
                "Save new seal"
              ) : (
                "Apply seal"
              )}
            </button>
            {hasPassword && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setValue("");
                }}
                className="flex h-9 items-center gap-1.5 rounded-md border border-konoha-forest/60 px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
