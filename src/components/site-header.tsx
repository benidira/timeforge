import Link from "next/link";
import { SITE } from "@/lib/site";
import { BrandMark } from "./brand-mark";
import { MobileNav } from "./mobile-nav";
import { NAV_LINKS } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 text-fg no-underline" aria-label={`${SITE.name} home`}>
            <BrandMark />
            <span className="text-lg font-bold tracking-tight">{SITE.name}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="rounded-lg px-3 py-2 font-medium text-fg no-underline hover:bg-hover">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link href="/tools" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Explore Tools
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
