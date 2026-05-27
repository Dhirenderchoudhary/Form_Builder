"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  ScrollText,
  Compass,
  Palette,
  BarChart3,
  LogOut,
  X,
  Sparkles,
  Settings as SettingsIcon,
  LayoutTemplate,
} from "lucide-react";
import { KonohaLeaf } from "@/components/konoha/leaf";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navigation = [
  {
    label: "Hokage's Desk",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Mission Scrolls",
    href: "/dashboard/forms",
    icon: ScrollText,
  },
  {
    label: "Village Map",
    href: "/dashboard/explore",
    icon: Compass,
  },
  {
    label: "Theme Gallery",
    href: "/dashboard/themes",
    icon: Palette,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Templates",
    href: "/dashboard/forms/new",
    icon: LayoutTemplate,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: SettingsIcon,
  },
];

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-konoha-forest/40 bg-konoha-ink/95 backdrop-blur-xl transition-transform lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand */}
      <div className="flex h-16 items-center justify-between border-b border-konoha-forest/40 px-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-konoha-orange/40 bg-konoha-ink">
            <KonohaLeaf size={22} color="#FF6B00" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-sm font-extrabold tracking-[0.18em] text-konoha-orange">
              KONOHA
            </span>
            <span className="text-[8px] tracking-[0.3em] text-muted-foreground">
              FORM SCROLLS
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden text-muted-foreground hover:text-konoha-orange"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <p className="mb-3 px-3 text-[9px] font-medium uppercase tracking-[0.3em] text-muted-foreground/70">
          Village Quarters
        </p>

        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-gradient-to-r from-konoha-orange/15 to-transparent text-konoha-orange"
                      : "text-muted-foreground hover:bg-konoha-forest/20 hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-konoha-orange shadow-[0_0_8px_#FF6B00]" />
                  )}
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      active ? "text-konoha-orange" : "text-muted-foreground group-hover:text-konoha-orange"
                    }`}
                  />
                  <span className="font-medium tracking-wide">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Active mission status */}
      <div className="mx-3 mb-3 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-konoha-orange" />
          <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-konoha-orange">
            Will of Fire
          </p>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Currently stationed in <span className="text-foreground">Konohagakure</span>.
          Ready for the next mission.
        </p>
      </div>

      {/* Sign out */}
      <div className="border-t border-konoha-forest/40 p-3">
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-konoha-forest/20 hover:text-konoha-orange"
        >
          <LogOut className="h-4 w-4" />
          Leave the village
        </button>
      </div>
    </aside>
  );
}
