"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { SITE } from "@/lib/site";
import { BrandMark } from "./brand-mark";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { AuthModal } from "./auth-modal";

const DESKTOP_NAV = [
  { href: "/tools", label: "Tools" },
  { href: "/guides", label: "Guides" },
  { href: "/developer", label: "Developer" },
  { href: "/timezones", label: "Time Zones" },
  { href: "/resources", label: "Resources" },
] as const;

export function SiteHeader() {
  const pathname = usePathname() || "";
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (href: string) => {
    if (href === "/tools") return pathname === "/tools" || pathname.startsWith("/tools/");
    if (href === "/guides") return pathname === "/guides" || pathname.startsWith("/guides/");
    if (href === "/developer") return pathname === "/developer" || pathname.startsWith("/developer/");
    if (href === "/timezones") return pathname === "/timezones" || pathname.startsWith("/timezones/");
    if (href === "/resources") return pathname === "/resources" || pathname.startsWith("/resources/");
    return pathname === href;
  };

  return (
    <header className="fixed top-4 inset-x-0 mx-auto max-w-6xl rounded-2xl border border-line bg-card/80 backdrop-blur-xl z-50 shadow-sm">
      <div className="relative mx-auto flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link
            href="/"
            className="flex items-center gap-2.5 text-fg no-underline group focus-visible:outline-accent"
            aria-label={`${SITE.name} home`}
          >
            <BrandMark />
            <span className="text-lg font-bold tracking-tight text-fg">
              {SITE.name}
            </span>
          </Link>
        </div>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {DESKTOP_NAV.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all no-underline ${
                      active
                        ? "bg-hover text-fg font-semibold shadow-xs"
                        : "text-muted hover:bg-hover hover:text-fg"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Global Search Trigger */}
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-field hover:bg-hover border border-line rounded-lg text-sm text-muted transition-colors"
            aria-label="Open command palette"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="w-32 text-left">Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 h-5 px-1.5 text-[10px] font-medium bg-card text-muted rounded border border-line/40 font-mono">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          {/* Mobile Search Icon */}
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="btn btn-secondary btn-sm lg:hidden inline-flex p-2"
            aria-label="Search tools"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <Link href="/canvas" className="btn btn-secondary btn-sm hidden sm:inline-flex shadow-xs ml-1">
            Workflows
          </Link>
          <Link href="/ai" className="btn btn-primary btn-sm hidden sm:inline-flex shadow-xs ml-1">
            AI Tools
          </Link>
          {user ? (
            <div className="hidden sm:flex items-center gap-3 ml-2 border-l border-line pl-3">
              <div className="flex items-center gap-2 group cursor-pointer relative">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden relative">
                  <span className="text-xs font-bold text-primary">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Minimal dropdown on hover */}
                <div className="absolute top-10 right-0 w-48 bg-card border border-line rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-line">
                    <p className="text-xs text-muted font-medium truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link href="/tools/env-vault" className="block px-3 py-2 text-sm text-fg hover:bg-hover rounded-lg transition-colors">
                      My Vaults
                    </Link>
                    <Link href="/canvas" className="block px-3 py-2 text-sm text-fg hover:bg-hover rounded-lg transition-colors">
                      Workflows
                    </Link>
                  </div>
                  <div className="p-1 border-t border-line">
                    <button 
                      onClick={async () => {
                        const supabase = createClient();
                        await supabase.auth.signOut();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="hidden sm:inline-flex items-center justify-center h-8 px-4 ml-2 rounded-lg bg-primary text-primary-fg font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Sign In
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}
