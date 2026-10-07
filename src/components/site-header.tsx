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

const DESKTOP_NAV = [
  { href: "/tools", label: "Tools" },
  { href: "/ai", label: "AI Hub" },
  { href: "/timezones", label: "Time Zones" },
  { href: "/guides", label: "Guides" },
  { href: "/developer", label: "Developer" },
] as const;

export function SiteHeader() {
  const pathname = usePathname() || "";
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
    if (href === "/ai") return pathname === "/ai" || pathname.startsWith("/ai/");
    return pathname === href;
  };

  return (
    <header className="sticky top-0 inset-x-0 w-full border-b border-line bg-bg/90 backdrop-blur-md z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <MobileNav user={user} />
          <Link
            href="/"
            className="flex items-center gap-2.5 text-fg no-underline group focus-visible:outline-accent"
            aria-label={`${SITE.name} home`}
          >
            <BrandMark size={28} />
          </Link>

          <nav aria-label="Main" className="hidden lg:block ml-4">
            <ul className="flex items-center gap-2">
              {DESKTOP_NAV.map((l) => {
                const active = isActive(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-all no-underline ${
                        active
                          ? "bg-field text-fg font-semibold"
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
        </div>

        <div className="flex items-center gap-3">
          {/* Global Search Trigger - Condensed on Desktop */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-field hover:bg-hover border border-line rounded-lg text-sm text-muted transition-colors w-48 lg:w-64"
            aria-label="Open command palette"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="flex-1 text-left opacity-70">Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 h-5 px-1.5 text-[10px] font-medium bg-bg text-muted rounded border border-line font-mono">
              <span className="text-xs">O~</span>K
            </kbd>
          </button>

          {/* Mobile Search Icon */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="btn btn-secondary btn-sm md:hidden inline-flex p-2 rounded-lg"
            aria-label="Search tools"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <div className="h-6 w-[1px] bg-line hidden sm:block mx-1"></div>

          {user ? (
            <div className="hidden sm:flex items-center">
              <div className="flex items-center gap-2 group cursor-pointer relative">
                <Link href="/profile" className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden transition-colors group-hover:bg-accent/20">
                  <span className="text-xs font-bold text-accent">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </Link>
                {/* Minimal dropdown on hover */}
                <div className="absolute top-10 right-0 w-48 bg-card border border-line rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-line">
                    <p className="text-xs text-muted font-medium truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link href="/profile" className="block px-3 py-2 text-sm text-fg hover:bg-field rounded-lg transition-colors">
                      Profile
                    </Link>
                    <Link href="/env-vault/team" className="block px-3 py-2 text-sm text-fg hover:bg-field rounded-lg transition-colors">
                      Team Vaults
                    </Link>
                    <Link href="/canvas" className="block px-3 py-2 text-sm text-fg hover:bg-field rounded-lg transition-colors">
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
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center h-8 px-4 rounded-lg bg-accent text-white dark:text-[#050505] font-semibold text-sm hover:bg-accent-hover transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
