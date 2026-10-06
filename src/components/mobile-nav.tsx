"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { NAV_LINKS } from "./nav-links";
import { createClient } from "@/utils/supabase/client";

export function MobileNav({ user }: { user?: any }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-card/95 backdrop-blur-xl px-4 pb-6 pt-3 shadow-xl transition-all"
      >
        <nav
          id={panelId}
          aria-label="Mobile"
          className="mx-auto max-w-6xl"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium text-fg no-underline hover:bg-hover transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span>{l.label}</span>
                  <span className="text-muted text-sm">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mx-auto mt-4 max-w-6xl border-t border-line/60 pt-3">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Developer &amp; Hubs
          </p>
          <ul className="grid grid-cols-2 gap-2 mb-4">
            {[
              { href: "/developer", label: "Developer Hub" },
              { href: "/timezones", label: "Time Zones Hub" },
              { href: "/timestamps", label: "Timestamps Hub" },
              { href: "/resources", label: "Resources Hub" },
            ].map((hub) => (
              <li key={hub.href}>
                <Link
                  href={hub.href}
                  className="block rounded-lg bg-hover/40 px-3 py-2 text-sm font-medium text-fg no-underline hover:bg-hover hover:text-accent transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {hub.label}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="border-t border-line/60 pt-4 px-1">
            {user ? (
              <div className="space-y-2">
                <div className="px-2 pb-2 text-xs text-muted truncate">{user.email}</div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/profile" onClick={() => setOpen(false)} className="btn btn-secondary justify-center w-full">Profile</Link>
                  <Link href="/env-vault/team" onClick={() => setOpen(false)} className="btn btn-secondary justify-center w-full">Vaults</Link>
                </div>
                <button onClick={handleSignOut} className="btn w-full mt-2 justify-center bg-danger/10 text-danger hover:bg-danger/20 border border-transparent">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={() => setOpen(false)} className="btn btn-secondary justify-center w-full">
                  Log In
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="btn bg-accent text-white dark:text-[#050505] hover:bg-accent-hover justify-center w-full border border-transparent">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
