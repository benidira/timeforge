import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/static-page";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact Castov | Castov",
  description:
    "Get in touch with Castov to report a bug, suggest a new time or timestamp tool, or ask a question about privacy or how the tools work.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      intro="Report a bug, suggest a tool or ask a question."
      crumbs={[{ name: "Home", href: "/" }, { name: "Contact" }]}
      path="/contact"
    >
      <h2>Email</h2>
      {SITE.contactEmail ? (
        <p>
          Write to <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. We read every message, and replies may take a few days.
        </p>
      ) : (
        <p role="note" className="rounded-lg border border-line p-3">
          Development notice: set NEXT_PUBLIC_CONTACT_EMAIL. Production builds fail without it.
        </p>
      )}

      <h2>What helps most</h2>
      <ul>
        <li>For a bug: the tool name, the exact value you entered, the result you expected and the result you saw.</li>
        <li>Please include your browser and device, because date and time zone support varies slightly between browsers.</li>
        <li>For a new tool: what you are trying to do and what you searched for.</li>
      </ul>

      <h2>Privacy</h2>
      <p>
        Castov has no forms and no accounts, and the tools do not send your input anywhere. See the{" "}
        <Link href="/privacy">Privacy Policy</Link> for details.
      </p>
    </StaticPage>
  );
}
