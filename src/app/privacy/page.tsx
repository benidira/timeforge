import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | Castov",
  description: "Detailed information on how Castov handles your data across our time tools, AI tools, BYOK vaults, and Cloud Sync features.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      intro="Last updated: October 2026."
      crumbs={[{ name: "Home", href: "/" }, { name: "Privacy Policy" }]}
      path="/privacy"
    >
      <h2>The Short Version</h2>
      <p>
        The vast majority of Castov’s tools run <strong>entirely in your browser</strong>. Your dates, timestamps, regex patterns, and AI configuration inputs are never sent to our servers unless explicitly stated for specific premium or sync features.
      </p>

      <h2>Core Tools (Time, Date, Regex, Utilities)</h2>
      <ul>
        <li><strong>Processing:</strong> 100% Local. The timestamps, dates, and patterns you enter are processed on your device.</li>
        <li><strong>Data Uploaded:</strong> None. We do not upload your inputs to any server.</li>
      </ul>

      <h2>AI Developer Tools & BYOK (Bring Your Own Key)</h2>
      <p>
        Some of our AI generation tools connect to external LLM providers (e.g., OpenAI, Anthropic) if you provide an API key.
      </p>
      <ul>
        <li><strong>External APIs:</strong> If a tool explicitly requires an API key, the request is made directly from your browser to the external provider's API.</li>
        <li><strong>API Key Storage:</strong> API keys are stored locally in your browser's <code>localStorage</code> or session storage. They are <strong>never sent to Castov's backend</strong>.</li>
        <li><strong>Data Uploaded:</strong> Your prompts and generated code are only shared with the external API provider you configure. Castov does not intercept or store this traffic.</li>
      </ul>

      <h2>Personal Workspace, Cloud Sync, and Team Vaults</h2>
      <p>
        If you choose to create an account and sign in, you gain access to Cloud Sync and Team Vaults.
      </p>
      <ul>
        <li><strong>Cloud Sync & Storage:</strong> Account data and synced environments are stored in our secure Supabase backend.</li>
        <li><strong>Encryption:</strong> Team Vault secrets are encrypted on your device (client-side) using industry-standard AES-GCM and RSA-OAEP before they are uploaded. Your data is encrypted in transit and at rest.</li>
        <li><strong>Server Visibility:</strong> Castov cannot read the plaintext contents of your synced `.env` files. We only store the encrypted ciphertext. We do not have access to your encryption keys.</li>
      </ul>

      <h2>Data Retention and Deletion</h2>
      <p>
        You can delete your account and all associated cloud-synced data at any time from your Workspace settings. Once deleted, the data is permanently removed from our active databases and will age out of automated rolling backups within 30 days. Local storage items can be cleared at any time via your browser settings.
      </p>

      <h2>Server Logs and Analytics</h2>
      <p>
        Our hosting infrastructure (Vercel/Supabase) maintains standard technical logs (e.g., IP address, browser type, timestamp of access) for operational security and rate limiting. These logs are not used to identify you personally and do not contain any data from the tools you use.
      </p>

      <h2>Contact Us</h2>
      <p>If you have any questions about your privacy or data, please contact us at <a href="mailto:support@castov.com">support@castov.com</a>.</p>
    </StaticPage>
  );
}
