"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  User as UserIcon,
  Mail,
  Calendar,
  LogOut,
  ExternalLink,
  Bell,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { KakashiSilhouette } from "@/components/konoha/characters";

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function AccountSettingsPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { data: me } = trpc.auth.getMe.useQuery();

  const fullName =
    user?.fullName || me?.fullName || user?.username || "Shinobi";
  const email =
    user?.primaryEmailAddress?.emailAddress || me?.email || "—";
  const initial = (fullName.trim().charAt(0) || "S").toUpperCase();
  const joined = me?.createdAt ?? null;

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-8 overflow-hidden rounded-lg border border-konoha-forest/40 bg-gradient-to-br from-konoha-ink/80 via-konoha-ink/60 to-transparent p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-4 hidden opacity-[0.18] md:block lg:-right-2 lg:opacity-[0.22]"
        >
          <KakashiSilhouette size={300} />
        </div>

        <div className="relative max-w-2xl">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
            Account · 自分
          </p>
          <h1 className="font-heading text-3xl font-black leading-tight md:text-4xl">
            Your shinobi profile
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Identity, hawk address, notification preferences. Your dossier in
            the Hokage&apos;s archives.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Identity card */}
          <section className="scroll-card p-6">
            <header className="mb-5 flex items-center gap-2">
              <UserIcon className="h-3.5 w-3.5 text-konoha-orange" />
              <h2 className="font-heading text-sm font-bold uppercase tracking-[0.2em]">
                Identity
              </h2>
            </header>

            <div className="flex items-start gap-4">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={fullName}
                  className="h-16 w-16 shrink-0 rounded-full border-2 border-konoha-orange/40 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-konoha-orange/40 bg-konoha-ink font-heading text-xl font-black text-konoha-orange">
                  {initial}
                </div>
              )}

              <div className="min-w-0 flex-1">
                {!userLoaded ? (
                  <div className="space-y-2">
                    <div className="h-5 w-40 animate-pulse rounded bg-konoha-forest/30" />
                    <div className="h-3 w-56 animate-pulse rounded bg-konoha-forest/30" />
                  </div>
                ) : (
                  <>
                    <p className="font-heading text-lg font-bold tracking-wide text-foreground">
                      {fullName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {email}
                    </p>
                    {joined && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Joined the village {formatDate(joined)}
                      </p>
                    )}
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => openUserProfile()}
                className="flex h-9 items-center gap-2 rounded-md border border-konoha-forest/60 px-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Manage
              </button>
            </div>

            <p className="mt-5 rounded-md border border-konoha-forest/40 bg-konoha-ink/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              Name, avatar, email, and password are managed via Clerk. Click{" "}
              <span className="text-konoha-orange">Manage</span> to update them
              in the secure profile vault.
            </p>
          </section>

          {/* Notifications */}
          <NotificationsCard />
        </div>

        {/* Side column — sign out */}
        <aside className="flex flex-col gap-4">
          <section className="scroll-card p-6">
            <header className="mb-3 flex items-center gap-2">
              <LogOut className="h-3.5 w-3.5 text-konoha-akatsuki" />
              <h2 className="font-heading text-sm font-bold uppercase tracking-[0.2em]">
                Leave the village
              </h2>
            </header>
            <p className="mb-4 text-[11px] leading-relaxed text-muted-foreground">
              Sign out of your shinobi account. You&apos;ll be returned to the
              gate.
            </p>
            <button
              type="button"
              onClick={() => signOut({ redirectUrl: "/" })}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-konoha-akatsuki/60 px-3 text-xs uppercase tracking-[0.2em] text-konoha-akatsuki hover:bg-konoha-akatsuki/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function NotificationsCard() {
  // Notification preferences are persisted in localStorage today —
  // a real implementation would store them on the user table.
  // This UI is wired to a backend toggle in a follow-up task.
  return (
    <section className="scroll-card p-6">
      <header className="mb-5 flex items-center gap-2">
        <Bell className="h-3.5 w-3.5 text-konoha-orange" />
        <h2 className="font-heading text-sm font-bold uppercase tracking-[0.2em]">
          Notifications
        </h2>
      </header>

      <p className="mb-5 text-[11px] leading-relaxed text-muted-foreground">
        How you hear from the Hokage&apos;s office about new responses and
        scroll activity.
      </p>

      <NotificationToggle
        title="New response notifications"
        description="Email me when someone submits one of my scrolls."
        storageKey="konoha-notify-responses"
        defaultValue={true}
      />
      <NotificationToggle
        title="Weekly digest"
        description="A weekly summary of activity across all scrolls."
        storageKey="konoha-notify-digest"
        defaultValue={false}
      />
      <NotificationToggle
        title="Product updates"
        description="Hear about new themes, jutsu, and features."
        storageKey="konoha-notify-product"
        defaultValue={false}
      />
    </section>
  );
}

function NotificationToggle({
  title,
  description,
  storageKey,
  defaultValue,
}: {
  title: string;
  description: string;
  storageKey: string;
  defaultValue: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) setEnabled(stored === "true");
    } catch {
      // ignore — SSR or restricted storage
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    setEnabled((v) => {
      const next = !v;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="flex items-start justify-between gap-3 border-t border-konoha-forest/40 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={!hydrated}
        onClick={toggle}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          enabled
            ? "bg-konoha-orange shadow-[0_0_10px_rgba(255,107,0,0.4)]"
            : "bg-konoha-forest"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
