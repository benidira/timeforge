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

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[1.2fr_2fr_1fr]">
        <div>
          <p className="text-lg font-bold">{SITE.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            {SITE.tagline}. Every conversion runs in your browser, so nothing you enter is uploaded.
          </p>
        </div>
        <nav aria-labelledby="footer-tools">
          <h2 id="footer-tools" className="mb-3 text-sm font-semibold">
            Tools
          </h2>
          <ul className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {TOOLS.map((t) => (
              <li key={t.slug}>
                <Link href={toolPath(t.slug)}>{t.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="footer-site">
          <h2 id="footer-site" className="mb-3 text-sm font-semibold">
            Site
          </h2>
          <ul className="grid gap-2 text-sm">
            {COMPANY.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-10 text-sm text-muted">
        &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </p>
    </footer>
  );
}
