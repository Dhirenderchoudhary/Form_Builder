"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  ExternalLink,
  Link2,
  Send,
  Lock,
  Trash2,
  Pencil,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/konoha/toast";

interface Props {
  formId: string;
  formSlug: string;
  status: "draft" | "published" | "closed" | "archived";
  onRequestDelete: () => void;
  onEdit: () => void;
}

/**
 * Per-row dropdown menu. Closes on outside click and Escape.
 */
export function FormRowMenu({
  formId,
  formSlug,
  status,
  onRequestDelete,
  onEdit,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const toast = useToast();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const publish = trpc.forms.publish.useMutation({
    onSuccess: async () => {
      await utils.forms.list.invalidate();
      toast.push({
        variant: "success",
        title: "Scroll deployed",
        message: "The link is now live across the village.",
      });
    },
    onError: (err) => {
      toast.push({
        variant: "error",
        title: "Cannot deploy",
        message: err.message?.slice(0, 120) ?? "Add at least one field first.",
      });
    },
  });

  const unpublish = trpc.forms.unpublish.useMutation({
    onSuccess: async () => {
      await utils.forms.list.invalidate();
      toast.push({
        variant: "success",
        title: "Scroll sealed",
        message: "Public link is no longer accepting responses.",
      });
    },
    onError: (err) => {
      toast.push({
        variant: "error",
        title: "Could not seal scroll",
        message: err.message?.slice(0, 120) ?? "Try again.",
      });
    },
  });

  const isPublished = status === "published";

  const copyLink = () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/f/${formSlug}`;
    navigator.clipboard
      .writeText(url)
      .then(() =>
        toast.push({
          variant: "success",
          title: "Link copied",
          message: "Hand it to your courier.",
        }),
      )
      .catch(() =>
        toast.push({
          variant: "error",
          title: "Clipboard blocked",
          message: "Copy the link manually from the form page.",
        }),
      );
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Form actions"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((s) => !s);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-konoha-forest/30 hover:text-konoha-orange"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1.5 min-w-[200px] overflow-hidden rounded-md border border-konoha-forest/60 bg-konoha-ink/95 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md animate-[menuIn_0.15s_ease]"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MenuItem
            icon={Pencil}
            label="Edit fields"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          />

          {isPublished ? (
            <>
              <MenuItem
                icon={ExternalLink}
                label="View live scroll"
                onClick={() => {
                  window.open(`/f/${formSlug}`, "_blank");
                  setOpen(false);
                }}
              />
              <MenuItem icon={Link2} label="Copy public link" onClick={copyLink} />
              <MenuItem
                icon={Lock}
                label="Seal scroll"
                onClick={() => {
                  unpublish.mutate({ formId });
                  setOpen(false);
                }}
                disabled={unpublish.isPending}
              />
            </>
          ) : (
            <MenuItem
              icon={Send}
              label="Deploy scroll"
              onClick={() => {
                publish.mutate({ formId });
                setOpen(false);
              }}
              disabled={publish.isPending}
              accent
            />
          )}

          <div className="my-1 border-t border-konoha-forest/40" />

          <MenuItem
            icon={Trash2}
            label="Archive"
            danger
            onClick={() => {
              setOpen(false);
              onRequestDelete();
            }}
          />
        </div>
      )}

      <style jsx global>{`
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  disabled,
  danger,
  accent,
}: {
  icon: typeof MoreHorizontal;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "text-konoha-akatsuki hover:bg-konoha-akatsuki/10"
          : accent
            ? "text-konoha-orange hover:bg-konoha-orange/10"
            : "text-foreground hover:bg-konoha-forest/30"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="text-left">{label}</span>
    </button>
  );
}
