import Link from "next/link";
import { ArrowUpRight, Inbox, ScrollText, Calendar } from "lucide-react";

interface ExploreForm {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  publishedAt: string | Date | null;
  responseCount: number;
  owner?: { id: string; fullName: string | null; email: string } | null;
}

interface Props {
  form: ExploreForm;
  /** Where the "Open" button takes you. Public explore uses /f/, dashboard uses /f/ too. */
  href?: string;
}

function formatDate(d: string | Date | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function ownerLabel(owner: ExploreForm["owner"]): string {
  if (!owner) return "Anonymous shinobi";
  if (owner.fullName) return owner.fullName;
  // Strip the email domain for display privacy
  const email = owner.email;
  return email.split("@")[0] ?? "Shinobi";
}

function ownerInitial(owner: ExploreForm["owner"]): string {
  const name = owner?.fullName || owner?.email || "S";
  return name.trim().charAt(0).toUpperCase();
}

export function ExploreCard({ form, href }: Props) {
  const target = href ?? `/f/${form.slug}`;

  return (
    <article className="scroll-card group flex h-full flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-konoha-orange/60 hover:shadow-[0_0_24px_rgba(255,107,0,0.12)]">
      {/* Top: status + slug */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-konoha-orange/40 bg-konoha-orange/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.25em] text-konoha-orange">
          <span className="h-1 w-1 rounded-full bg-konoha-orange shadow-[0_0_4px_#FF6B00]" />
          Live
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/60">
          /{form.slug}
        </span>
      </div>

      {/* Title + description */}
      <div className="flex-1">
        <h3 className="line-clamp-2 font-heading text-lg font-bold tracking-wide text-foreground transition-colors group-hover:text-konoha-orange">
          {form.title}
        </h3>
        {form.description && (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {form.description}
          </p>
        )}
      </div>

      {/* Owner + date */}
      <div className="flex items-center gap-2 border-t border-konoha-forest/40 pt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-konoha-orange/40 bg-konoha-ink font-mono text-[9px] font-bold text-konoha-orange">
          {ownerInitial(form.owner)}
        </span>
        <span className="truncate text-foreground/70 normal-case">
          {ownerLabel(form.owner)}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(form.publishedAt)}
        </span>
      </div>

      {/* Footer: responses + open */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <Inbox className="h-3.5 w-3.5 text-konoha-orange" />
          <span className="font-mono tabular-nums text-foreground">
            {form.responseCount}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            responses
          </span>
        </div>
        <Link
          href={target}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 items-center gap-1.5 rounded-md border border-konoha-forest/60 px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-konoha-orange hover:text-konoha-orange"
        >
          Open scroll
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

export function ExploreCardSkeleton() {
  return (
    <div className="scroll-card flex h-full flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-12 animate-pulse rounded-full bg-konoha-forest/30" />
        <div className="h-3 w-20 animate-pulse rounded bg-konoha-forest/30" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-konoha-forest/40" />
        <div className="h-3 w-full animate-pulse rounded bg-konoha-forest/30" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-konoha-forest/30" />
      </div>
      <div className="mt-auto h-8 w-full animate-pulse rounded bg-konoha-forest/30" />
    </div>
  );
}

export function ExploreEmpty({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="scroll-card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <ScrollText className="h-8 w-8 text-muted-foreground" />
      <p className="font-heading text-base font-bold tracking-wide">{message}</p>
      {hint && (
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
