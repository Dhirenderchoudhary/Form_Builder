"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell, Search, Plus, Menu } from "lucide-react";
import { KonohaLeaf } from "@/components/konoha/leaf";
import { Sidebar } from "./sidebar";

/**
 * Dashboard shell — sidebar + topbar + content area.
 * "Hokage's Office" command center.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Build breadcrumb crumbs from pathname segments
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    return { label: seg.replace(/-/g, " "), href, last: i === segments.length - 1 };
  });

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop fixed, mobile drawer */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-konoha-forest/40 bg-konoha-ink/80 px-4 backdrop-blur-md md:px-6">
          {/* Mobile menu */}
          <button
            type="button"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md border border-konoha-forest/60 text-muted-foreground hover:text-konoha-orange"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="hidden flex-1 items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground sm:flex"
          >
            <Link href="/dashboard" className="hover:text-konoha-orange">
              Hokage&apos;s Office
            </Link>
            {crumbs.slice(1).map((c) => (
              <span key={c.href} className="flex items-center gap-2">
                <span className="text-konoha-forest">/</span>
                {c.last ? (
                  <span className="text-konoha-orange">{c.label}</span>
                ) : (
                  <Link href={c.href} className="hover:text-konoha-orange">
                    {c.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="flex-1 sm:hidden" />

          {/* Search */}
          <div className="relative hidden w-72 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search the village…"
              className="h-9 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 pl-9 pr-3 text-xs uppercase tracking-[0.15em] text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
            />
          </div>

          {/* New form CTA */}
          <Link
            href="/dashboard/forms?new=1"
            className="hidden h-9 items-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-4 font-heading text-[11px] uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)] sm:flex"
          >
            <Plus className="h-3.5 w-3.5" />
            Forge scroll
          </Link>

          {/* Bell */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-konoha-forest/60 text-muted-foreground hover:text-konoha-orange"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-konoha-orange shadow-[0_0_6px_#FF6B00]" />
          </button>

          {/* Avatar */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 ring-2 ring-konoha-orange/40 hover:ring-konoha-orange",
              },
            }}
          />
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

/* Re-export for use in layout.tsx without circular import surprises */
export { DashboardShell as default };
