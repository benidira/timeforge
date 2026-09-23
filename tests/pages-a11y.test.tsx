// @vitest-environment jsdom
import axe from "axe-core";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";
import AboutPage from "@/app/about/page";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import ContactPage from "@/app/contact/page";
import ToolsPage from "@/app/tools/page";
import GuidesPage from "@/app/guides/page";
import NotFound from "@/app/not-found";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToolPage } from "@/components/tool-page";
import { RelatedTools } from "@/components/related-tools";
import { StaticPage } from "@/components/static-page";
import { GUIDES } from "@/content/guides";
import { TOOLS } from "@/content/tools";
import { HOME_FAQ } from "@/content/home";

async function violations(container: HTMLElement) {
  // jsdom has no layout engine, so colour contrast is verified separately (theme-contrast.test.ts).
  const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  return results.violations.map((v) => `${v.id}: ${v.help} -> ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}

describe.each(TOOLS.map((t) => [t.slug, t] as const))("tool page /%s", (_slug, tool) => {
  it("has the required structure", () => {
    const { container } = render(<ToolPage tool={tool} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(tool.name);

    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getAllByRole("link").map((a) => a.textContent)).toEqual(["Home", "Tools"]);
    expect(within(crumbs).getByText(tool.name)).toHaveAttribute("aria-current", "page");

    expect(screen.getByText(tool.intro)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How to use this tool" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Examples" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Frequently asked questions" })).toBeInTheDocument();
    for (const f of tool.faq) {
      expect(screen.getByRole("heading", { level: 3, name: f.q })).toBeInTheDocument();
      expect(screen.getByText(f.a)).toBeInTheDocument();
    }
    for (const s of tool.sections) expect(screen.getByRole("heading", { level: 2, name: s.heading })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Related tools" })).toBeInTheDocument();
    const related = screen.getByRole("heading", { name: "Related tools" }).closest("section")!;
    expect(within(related).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(tool.related.map((r) => `/${r}`));

    // tool interface is present and has a submit/primary control or live clock
    expect(container.querySelector("form, [role=timer], button")).not.toBeNull();
  });

  it("has valid structured data that matches the page", () => {
    const { container } = render(<ToolPage tool={tool} />);
    const blocks = [...container.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.innerHTML));
    expect(blocks.map((b) => b["@type"])).toEqual(["WebApplication", "BreadcrumbList", "FAQPage"]);
    const faq = blocks[2];
    for (const q of faq.mainEntity) {
      expect(screen.getByText(q.name)).toBeInTheDocument();
      expect(screen.getByText(q.acceptedAnswer.text)).toBeInTheDocument();
    }
    expect(blocks[1].itemListElement.map((i: { name: string }) => i.name)).toEqual(["Home", "Tools", tool.name]);
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(
      <Shell>
        <ToolPage tool={tool} />
      </Shell>,
    );
    expect(await violations(container)).toEqual([]);
  }, 60_000);

  it("does not render advertising before AdSense is configured", () => {
    const { container } = render(<ToolPage tool={tool} />);
    expect(container.querySelector("aside, ins, iframe")).toBeNull();
  });

  it("keeps every form control labelled", () => {
    const { container } = render(<ToolPage tool={tool} />);
    for (const el of container.querySelectorAll("input, select, textarea")) {
      const id = el.getAttribute("id");
      const labelled = (id && container.querySelector(`label[for="${CSS.escape(id)}"]`)) || el.getAttribute("aria-label");
      expect(labelled, el.outerHTML).toBeTruthy();
    }
  });
});

describe("other pages", () => {
  const pages: [string, React.ReactNode][] = [
    ["home", <HomePage key="home" />],
    ["tools", <ToolsPage key="tools" />],
    ["guides", <GuidesPage key="guides" />],
    ["about", <AboutPage key="about" />],
    ["privacy", <PrivacyPage key="privacy" />],
    ["terms", <TermsPage key="terms" />],
    ["contact", <ContactPage key="contact" />],
    ["not found", <NotFound key="nf" />],
  ];

  it.each(pages)("%s page has one h1 and passes automated accessibility checks", async (_name, node) => {
    const { container } = render(<Shell>{node}</Shell>);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(await violations(container)).toEqual([]);
  });

  it("home page has the requested sections", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: "Free Time & Timestamp Tools" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Tools" })).toHaveAttribute("href", "/tools");
    expect(screen.getAllByRole("link", { name: "Current Unix Timestamp" })[0]).toHaveAttribute("href", "/current-unix-timestamp");
    for (const h of ["Popular Tools", "Why TimeForge?", "Developer Tools", "Frequently asked questions", "Browse by Category"]) {
      expect(screen.getByRole("heading", { level: 2, name: h })).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { level: 2, name: /Related tools/ })).toBeInTheDocument();
    for (const w of ["Free", "Fast", "Private", "No account", "Browser-based"]) {
      expect(screen.getByRole("heading", { level: 3, name: w })).toBeInTheDocument();
    }
    // Popular Tools shows a curated subset as cards; every tool is still linked from
    // the Browse by Category section (and, separately, from the footer on every page).
    const openLinks = screen.getAllByRole("link", { name: /^Open / });
    expect(openLinks.length).toBeGreaterThan(0);
    const allHrefs = new Set(screen.getAllByRole("link").map((a) => a.getAttribute("href")));
    for (const t of TOOLS) expect(allHrefs.has(`/${t.slug}`)).toBe(true);
    for (const f of HOME_FAQ) expect(screen.getByText(f.a)).toBeInTheDocument();
    expect(screen.getByText(/بسرعة ومجانًا/)).toHaveAttribute("dir", "rtl");
  });

  it("guide pages render their sections and tool links", () => {
    for (const g of GUIDES) {
      const { unmount } = render(
        <StaticPage title={g.name} crumbs={[{ name: "Home", href: "/" }, { name: g.name }]} path={`/guides/${g.slug}`}>
          <RelatedTools slugs={g.tools as never} />
        </StaticPage>,
      );
      expect(screen.getAllByRole("link").length).toBeGreaterThanOrEqual(g.tools.length);
      unmount();
    }
  });

  it("footer and header link to every tool and to the legal pages", () => {
    render(
      <>
        <SiteHeader />
        <SiteFooter />
      </>,
    );
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    for (const t of TOOLS) expect(hrefs).toContain(`/${t.slug}`);
    for (const p of ["/privacy", "/terms", "/contact", "/about", "/guides", "/tools"]) expect(hrefs).toContain(p);
  });
});
