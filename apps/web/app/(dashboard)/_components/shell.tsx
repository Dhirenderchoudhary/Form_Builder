"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell, Search, Plus, Menu } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { KonohaLeaf } from "@/components/konoha/leaf";
import { Sidebar } from "./sidebar";

/**
 * Dashboard shell — sidebar + topbar + content area.
 * "Hokage's Office" command center.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: me } = trpc.auth.getMe.useQuery();

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

          {/* Glowing Demo Sandbox Badge */}
          {me?.clerkId === "clerk_demo_shinobi" && (
            <div className="flex items-center gap-1.5 rounded-full border border-konoha-orange/40 bg-konoha-orange/10 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.2em] text-konoha-orange shadow-[0_0_12px_rgba(255,107,0,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-konoha-orange shadow-[0_0_6px_#FF6B00] animate-pulse" />
              Demo Sandbox
            </div>
          )}

          {/* Avatar */}
          {me?.clerkId === "clerk_demo_shinobi" ? (
            <div className="relative group">
              <button
                type="button"
                className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-konoha-orange shadow-[0_0_12px_rgba(255,107,0,0.4)] transition-all hover:ring-konoha-gold flex items-center justify-center bg-gradient-to-br from-konoha-orange to-[#cc4400]"
              >
                <span className="font-heading text-xs font-bold text-white uppercase">D</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-konoha-forest/60 bg-konoha-ink p-2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150 origin-top-right shadow-[0_4px_24px_rgba(0,0,0,0.8)] z-50">
                <div className="px-2 py-1.5 border-b border-konoha-forest/30 mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-konoha-orange">Demo Shinobi</p>
                  <p className="text-[9px] text-muted-foreground truncate">{me.email}</p>
                </div>
                <a
                  href="/api/demo-logout"
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-konoha-akatsuki hover:bg-konoha-akatsuki/10 transition-colors"
                >
                  Exit Demo Mode
                </a>
              </div>
            </div>
          ) : (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-2 ring-konoha-orange/40 hover:ring-konoha-orange",
                },
              }}
            />
          )}
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

/* Re-export for use in layout.tsx without circular import surprises */
export { DashboardShell as default };
