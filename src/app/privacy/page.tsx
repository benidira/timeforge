import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/static-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | Castov",
  description:
    "How Castov handles your data: conversions run in your browser, nothing you enter is uploaded, and we explain what is stored on your device.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      intro="Last updated: 20 September 2026."
      crumbs={[{ name: "Home", href: "/" }, { name: "Privacy Policy" }]}
      path="/privacy"
    >
      <h2>The short version</h2>
      <p>
        The core Castov tools run entirely in your browser (client-side). The timestamps, dates and time zones you enter are
        processed on your device and are not uploaded to our servers. We do not have user accounts.
      </p>

      <h2>What is stored on your device</h2>
      <p>
        If you switch between dark and light mode, your choice is saved in your browser&apos;s local storage under the key
        castov-theme so it is remembered on your next visit. It never leaves your device. You can remove it by clearing site
        data in your browser.
      </p>

      <h2>Server logs</h2>
      <p>
        Like most websites, the hosting provider that serves Castov may keep standard technical logs, such as IP address,
        requested page, browser type and time of request, for security and operations. We do not use these logs to identify
        individual visitors.
      </p>

      <h2>Advertising</h2>
      <p>
        Castov does not currently show ads. We may add Google AdSense in the future. If we do, Google and its partners may
        use cookies or similar technologies to show and measure ads, including personalised ads where permitted. We will update
        this policy first and, where the law requires it, ask for your consent before ads that use cookies are loaded. You can
        manage Google ad personalisation in Google&apos;s Ads Settings.
      </p>

      <h2>Third-party links</h2>
      <p>Castov may link to other websites. We are not responsible for their content or privacy practices.</p>

      <h2>Children</h2>
      <p>Castov is a general-purpose utility and is not directed at children under 13. We do not knowingly collect personal information from anyone.</p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy when the site changes, for example when advertising is introduced. The date at the top shows
        when it was last revised.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Use the <Link href="/contact">contact page</Link>.
      </p>
    </StaticPage>
  );
}
