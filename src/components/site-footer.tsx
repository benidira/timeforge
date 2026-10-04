import Link from "next/link";
import { TOOLS, toolPath } from "@/content/tools";
import { SITE } from "@/lib/site";

const COMPANY = [
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
];

const TOP_TOOLS = [
  "current-unix-timestamp",
  "unix-timestamp-converter",
  "world-clock",
  "timezone-converter",
  "date-difference",
];

export function SiteFooter() {
  return (
    <footer className="footer-gradient mt-20 border-t border-line/50">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-8 lg:grid-cols-5">
        {/* Brand column */}
        <div className="lg:col-span-2">
          <Link href="/" className="inline-block text-xl font-bold tracking-tight text-fg transition-colors hover:text-accent">
            {SITE.name}
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            {SITE.tagline}. Fast, accurate, and privacy-friendly. Every conversion runs in your browser — nothing you enter is ever uploaded.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tools" className="btn btn-secondary btn-sm">All Tools</Link>
            <Link href="/developer" className="btn btn-secondary btn-sm">For Developers</Link>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 gap-8 lg:col-span-3 sm:grid-cols-4">
          <nav aria-labelledby="footer-tools">
            <h2 id="footer-tools" className="mb-4 text-sm font-semibold text-fg">Popular Tools</h2>
            <ul className="grid gap-3 text-sm">
              {TOOLS.filter(t => TOP_TOOLS.includes(t.slug)).map((t) => (
                <li key={t.slug}>
                  <Link href={toolPath(t.slug)} className="text-muted transition-colors hover:text-fg">{t.name}</Link>
                </li>
              ))}
              <li><Link href="/tools" className="text-accent transition-colors hover:text-fg">View all tools &rarr;</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-hubs">
            <h2 id="footer-hubs" className="mb-4 text-sm font-semibold text-fg">Hubs</h2>
            <ul className="grid gap-3 text-sm">
              <li><Link href="/timezones" className="text-muted transition-colors hover:text-fg">Time Zones</Link></li>
              <li><Link href="/developer" className="text-muted transition-colors hover:text-fg">Developer</Link></li>
              <li><Link href="/timestamps" className="text-muted transition-colors hover:text-fg">Timestamps</Link></li>
              <li><Link href="/resources" className="text-muted transition-colors hover:text-fg">Resources</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-resources">
            <h2 id="footer-resources" className="mb-4 text-sm font-semibold text-fg">Resources</h2>
            <ul className="grid gap-3 text-sm">
              <li><Link href="/guides" className="text-muted transition-colors hover:text-fg">Guides & Articles</Link></li>
              <li><Link href="/code" className="text-muted transition-colors hover:text-fg">Code Snippets</Link></li>
              <li><Link href="/timezones/UTC" className="text-muted transition-colors hover:text-fg">UTC Time</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2 id="footer-company" className="mb-4 text-sm font-semibold text-fg">Company</h2>
            <ul className="grid gap-3 text-sm">
              {COMPANY.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted transition-colors hover:text-fg">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      
      <div className="border-t border-line/30 bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row sm:px-8">
          <p className="text-sm text-muted">&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
