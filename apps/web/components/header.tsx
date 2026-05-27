"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KonohaLeaf } from "@/components/konoha/leaf";

export function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Brand */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-konoha-orange/40 bg-konoha-ink/60 transition-all group-hover:border-konoha-orange group-hover:shadow-[0_0_16px_rgba(255,107,0,0.4)]">
            <KonohaLeaf size={24} color="#FF6B00" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-base font-extrabold tracking-[0.18em] text-konoha-orange">
              KONOHA
            </span>
            <span className="text-[9px] tracking-[0.3em] text-muted-foreground">
              FORM SCROLLS
            </span>
          </div>
        </a>

        {/* Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/explore"
            className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-konoha-orange"
          >
            Village Map
          </Link>
          <a
            href="/#features"
            className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-konoha-orange"
          >
            Jutsu
          </a>
          <a
            href="/#how-it-works"
            className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-konoha-orange"
          >
            Training
          </a>
          <Link
            href="/naruto"
            className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-konoha-orange"
          >
            Chunin Exam
          </Link>
          <Link
            href="/api/docs"
            className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-konoha-orange"
          >
            API Docs
          </Link>
          <Link
            href="/pricing"
            className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-konoha-orange"
          >
            Pricing
          </Link>
        </nav>

        {/* Auth & Mobile Menu */}
        <div className="flex items-center justify-end gap-3">
          <div className="hidden min-w-[140px] items-center justify-end gap-3 sm:flex">
            {isLoaded &&
              (isSignedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-xs uppercase tracking-[0.15em] hover:text-konoha-orange"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Hokage&apos;s Desk
                    </Button>
                  </Link>
                  <UserButton appearance={{ elements: { avatarBox: "h-8 w-8 ring-2 ring-konoha-orange/40 hover:ring-konoha-orange" } }} />
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm" className="text-xs uppercase tracking-[0.15em]">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button
                      size="sm"
                      className="btn-rasengan font-heading text-xs uppercase tracking-[0.15em]"
                    >
                      Enlist
                    </Button>
                  </SignUpButton>
                </>
              ))}
          </div>

          {/* Hamburger toggle for phones */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-konoha-forest/60 text-muted-foreground hover:text-konoha-orange md:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden
        />
      )}

      {/* Sliding Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-konoha-forest/60 bg-konoha-ink/95 p-6 backdrop-blur-xl md:hidden animate-in fade-in duration-200">
          <nav className="flex flex-col gap-4 mb-4">
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-konoha-orange"
            >
              Village Map
            </Link>
            <Link
              href="/naruto"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-konoha-orange"
            >
              Chunin Exam
            </Link>
            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-konoha-orange"
            >
              Jutsu
            </a>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-konoha-orange"
            >
              Training
            </a>
            <Link
              href="/api/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-konoha-orange"
            >
              API Docs
            </Link>
          </nav>
          
          <div className="border-t border-konoha-forest/30 pt-4 flex flex-col gap-3">
            {isLoaded &&
              (isSignedIn ? (
                <div className="flex items-center justify-between gap-3">
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      size="sm"
                      className="btn-rasengan gap-2 font-heading text-xs uppercase tracking-[0.15em]"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Hokage&apos;s Desk
                    </Button>
                  </Link>
                  <UserButton appearance={{ elements: { avatarBox: "h-8 w-8 ring-2 ring-konoha-orange/40 hover:ring-konoha-orange" } }} />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <SignInButton mode="modal">
                    <Button variant="outline" size="sm" onClick={() => setMobileMenuOpen(false)} className="w-full text-xs uppercase tracking-[0.15em] border-konoha-forest text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button
                      size="sm"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-rasengan w-full font-heading text-xs uppercase tracking-[0.15em]"
                    >
                      Enlist
                    </Button>
                  </SignUpButton>
                </div>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
