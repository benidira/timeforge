import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/static-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use | Castov",
  description:
    "The terms for using Castov: free tools provided as is, guidance on accuracy, acceptable use and how these terms may change over time.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of Use"
      intro="Last updated: 20 September 2026."
      crumbs={[{ name: "Home", href: "/" }, { name: "Terms of Use" }]}
      path="/terms"
    >
      <h2>Using Castov</h2>
      <p>
        By using Castov you agree to these terms. The tools are free for personal and commercial use. If you do not agree,
        please do not use the site.
      </p>

      <h2>No warranty</h2>
      <p>
        The tools and content are provided &quot;as is&quot; without warranties of any kind. We work to keep results accurate,
        but they depend on your browser&apos;s date and time zone support and on the rules in the IANA time zone database it
        contains. Do not rely on Castov alone for legal, financial, medical or safety-critical decisions.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, Castov and its operators are not liable for any loss or damage arising from your use
        of, or inability to use, the site or its results.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Please do not attempt to disrupt the site, overload it with automated requests, or use it to break the law. You may
        link to any page. You may not copy the site&apos;s content in bulk and republish it as your own.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The site design, text and code are owned by Castov or its licensors. Names of third-party products mentioned on the
        site belong to their respective owners.
      </p>

      <h2>Changes</h2>
      <p>
        We may change the tools or these terms from time to time. Continued use after a change means you accept the updated
        terms. See also our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </StaticPage>
  );
}
