# TimeForge — Free Time & Timestamp Tools

A free, ad-supported (later) collection of 25 browser-only tools for Unix timestamps, dates, time
zones and developer scheduling. Next.js (App Router) + TypeScript + Tailwind CSS v4. No backend, no
database, no accounts, no external APIs — every calculation runs in the visitor's browser.

## Tools

| # | Tool | Route |
|---|------|-------|
| 1 | Unix Timestamp Converter | `/unix-timestamp-converter` |
| 2 | Epoch Converter | `/epoch-converter` |
| 3 | Timestamp to Date | `/timestamp-to-date` |
| 4 | Date to Timestamp | `/date-to-timestamp` |
| 5 | Current Unix Timestamp | `/current-unix-timestamp` |
| 6 | Milliseconds to Date | `/milliseconds-to-date` |
| 7 | ISO 8601 to Unix Timestamp | `/iso-8601-to-unix` |
| 8 | Unix Timestamp to ISO 8601 | `/unix-to-iso-8601` |
| 9 | Timezone Converter | `/timezone-converter` |
| 10 | Timestamp Difference Calculator | `/timestamp-difference` |
| 11 | UTC Converter | `/utc-converter` |
| 12 | Date Difference Calculator | `/date-difference` |
| 13 | Time Duration Calculator | `/time-duration-calculator` |
| 14 | Add Time Calculator | `/add-time` |
| 15 | Subtract Time Calculator | `/subtract-time` |
| 16 | Unix Timestamp Validator | `/unix-timestamp-validator` |
| 17 | Epoch Milliseconds Converter | `/epoch-milliseconds` |
| 18 | Unix Timestamp Batch Converter | `/unix-timestamp-batch-converter` |
| 19 | Date Format Converter | `/date-format-converter` |
| 20 | ISO 8601 Converter | `/iso-8601-converter` |
| 21 | RFC 3339 Converter | `/rfc-3339-converter` |
| 22 | Time Zone Offset Calculator | `/timezone-offset` |
| 23 | World Clock | `/world-clock` |
| 24 | Business Hours Converter | `/business-hours-converter` |
| 25 | Cron Expression Generator | `/cron-generator` |

Plus 7 guides (`/guides/*`) and the standard `/about`, `/privacy`, `/terms`, `/contact` pages.

## Tech stack

Next.js 16 (App Router, static generation), React 19, TypeScript (strict), Tailwind CSS v4,
Vitest + Testing Library + axe-core for tests. Zero runtime dependencies beyond React/Next — every
time calculation is hand-written in `src/lib/time/` using `Intl.DateTimeFormat` for time zone data.

## Development

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_CONTACT_EMAIL
npm run dev                  # http://localhost:3000
```

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes**, for `npm run build` | `https://` origin, no path. Used for canonical URLs, sitemap, robots, Open Graph. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | **Yes**, for `npm run build` | Shown on `/contact`. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` + 3 slot IDs | No | Nothing loads or renders until these are set — see "AdSense" below. |
| `ALLOW_PLACEHOLDER_ENV=1` | No | Bypasses the two required checks above as a **warning** instead of a build failure. Local QA only — a build made this way is not production-ready. |

`npm run build` runs `scripts/check-env.mjs` first (via the `prebuild` script) and **fails the build**
if the site URL or contact email is missing, malformed, or still a placeholder (e.g. `example.com`,
`your-domain.com`, `localhost`). This is a hard build failure, not a warning, so a placeholder domain
can never reach production by accident.

## Quality gates

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest — time library, every tool's UI, SEO content, accessibility (axe)
npm run build        # production build (prebuild runs the env guard first)
npm run check:seo   # after build: titles/descriptions, canonicals, JSON-LD, internal links,
                     #   sitemap/robots, no-example-domain, no-secrets-in-bundle
npm run verify       # all of the above in order
```

`check:seo` (`scripts/check-build.mjs`) crawls the actual built HTML for every URL in the sitemap and
checks: exactly one `<h1>`, a title and meta description within sensible SEO length, a canonical URL
that matches the real configured domain (fails if it's still `example.com`), valid JSON-LD, that every
internal link resolves to a real page, that `sitemap.xml`/`robots.txt` exist and agree, and that the
client JS bundle contains no secret-shaped strings and only references an allow-listed set of external
hosts (your own domain, Google/AdSense, and a few well-known doc sites).

## Testing

417 tests across 12 files:
- **Time library** (`tests/time-*.test.ts`, ~200 tests): every conversion, edge case and DST
  transition, tested against the pure functions in `src/lib/time/` — leap years, negative
  timestamps, daylight saving gaps/overlaps, RFC 2822/3339 parsing, cron field parsing, business-hours
  overlap logic, etc.
- **Tool UI** (`tests/tool-interfaces.test.tsx`, `tests/new-tool-interfaces.test.tsx`, ~90 tests):
  renders each tool's actual component and drives it through Testing Library, covering the specific
  edge cases named in the spec (same-date, leap year, midnight crossing, 24-hour duration, valid/invalid
  timestamps, boundary values, mixed-unit batches, invalid cron expressions, DST offsets).
- **Accessibility** (`tests/pages-a11y.test.tsx`): every one of the 25 tool pages, both guide pages
  types, and the static pages are rendered and run through `axe-core` with zero violations.
- **SEO/content** (`tests/content-seo.test.ts`): unique titles/descriptions/FAQs, sensible metadata
  length, every internal link resolves, sitemap completeness, valid structured data.
- **UI components + theme contrast** (`tests/ui-components.test.tsx`, `tests/theme-contrast.test.ts`).

## Deploy

Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CONTACT_EMAIL` to real values **before** building.
- **Vercel / Netlify / Cloudflare (Next adapter):** import the repo, add the env vars, deploy.
- **Own server:** `npm run build && npm start` (Node 20.9+), behind HTTPS.

## Add a tool

1. Add its content to `src/content/tools.ts` (title, description, sections, FAQ ≥4, howTo ≥4,
   related ≥4) and its worked examples to `src/content/examples.ts`.
2. Build its logic as pure, tested functions in `src/lib/time/` (add a test file).
3. Build its interface in `src/components/tools/`, reusing `ResultList`, `TimezoneSelect`,
   `CopyButton`, `UnitSelect` where they fit.
4. Register it in `src/components/tool-interface.tsx`. Routing, sitemap, `/tools` cards, footer
   links and SEO metadata are all generated automatically from the `TOOLS` registry.

## Architecture

```
src/
  app/           routes (mostly thin wrappers around components below)
  components/    layout, shared UI (ui/), and one file per tool (tools/)
  lib/           lib/time/ = pure calculation library (no React); site.ts, seo.ts = config/helpers
  content/       tools.ts, examples.ts, guides.ts — all page copy, separate from presentation
tests/           mirrors the structure above
scripts/         check-env.mjs (prebuild), check-build.mjs (post-build SEO/security audit)
```

## AdSense preparation

`AdSlot` renders nothing — no placeholder box, no fake ad — until `NEXT_PUBLIC_ADSENSE_CLIENT` and a
slot ID are set; `AdSenseScript` (mounted once in the root layout) loads the AdSense library the same
way, only when a client ID is configured. Before actually enabling ads in production: add a consent
banner (required in the EEA/UK), an `ads.txt` in `public/`, and a nonce-based Content-Security-Policy
that allow-lists Google's ad hosts (not added yet — see "Security" below for why).

## Security

Every response gets `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
`Permissions-Policy`, `Strict-Transport-Security` and `Cross-Origin-Opener-Policy` (see
`next.config.ts`). No secrets exist in the frontend (`check:seo` scans the built client bundle for
secret-shaped strings on every build) and there is nothing to keep secret: no API keys, no backend.

**No Content-Security-Policy is set.** Next.js needs a nonce-based CSP for its own inline bootstrap
script, and AdSense needs its own set of allowed hosts; a static CSP added without both of those would
either break the site or be too permissive to matter. Add a nonce-based CSP together with wiring up
AdSense for real, not before.

## Known limitations (see final report for the full list)

- No real mobile/desktop browser is available in this environment. Responsive CSS, `overflow-x-auto`
  wrappers on every table, and Tailwind breakpoints were reviewed and are consistent with the rest of
  the site, but this has not been visually confirmed on an actual device — do that before launch.
- The World Clock's city list is not persisted between visits (resets to the default cities on reload).
- Auto-unit detection treats 12+ digit values as milliseconds; this is wrong only for real dates before
  March 1973 or after the year 5138.
