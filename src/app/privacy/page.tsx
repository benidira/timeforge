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
      <h2>Transparency First</h2>
      <p>
        At Castov, we believe developers should have absolute clarity on where their data goes. This document explicitly categorizes our features into Local, Cloud, and External API processing.
      </p>

      <h2>1. Features That Run Entirely in the Browser (100% Local)</h2>
      <p>
        The following tools use <strong>Zero-Server Architecture</strong>. Your data is processed entirely by your device's CPU and GPU. Data never leaves your browser:
      </p>
      <ul>
        <li><strong>Data Visualization:</strong> JSON Viewer (3D Galaxy) and AST Conflict Telepathy.</li>
        <li><strong>Time & Utility:</strong> All Timestamp Converters, World Clocks, and Date tools.</li>
        <li><strong>Steganography & Crypto:</strong> Env Vault processing (AES-GCM encryption and image encoding).</li>
        <li><strong>Compute & Web APIs:</strong> NexusGrid WebGPU Engine, Sonic-Gap Audio Bridge, and Quantum Simulator.</li>
        <li><strong>P2P Tools:</strong> P2P Ghost Tunnel establishes direct WebRTC connections between peers. Castov only facilitates the initial STUN/TURN handshake; the payload is completely end-to-end encrypted and bypasses our servers.</li>
      </ul>

      <h2>2. Features That Store Data Locally</h2>
      <p>
        Some tools remember your preferences without uploading them.
      </p>
      <ul>
        <li><strong>What is stored:</strong> Custom Timezones, selected AI models, UI theme preferences, and your Master Password for local vaults.</li>
        <li><strong>Where it is stored:</strong> `localStorage` or `IndexedDB` on your specific device.</li>
        <li><strong>Protection:</strong> Local secrets are encrypted using the WebCrypto API (AES-GCM).</li>
      </ul>

      <h2>3. Features That Use External APIs (BYOK)</h2>
      <p>
        Our AI Hub (System Prompt Builders, Agent Designers) utilizes a "Bring Your Own Key" (BYOK) model.
      </p>
      <ul>
        <li><strong>API Key Storage:</strong> API keys you provide are stored strictly in your browser's local storage. They are never sent to Castov servers.</li>
        <li><strong>Data Transmission:</strong> Prompts, Context, and Keys are transmitted directly from your browser to the respective external provider (e.g., OpenAI, Anthropic, Vercel) over HTTPS.</li>
      </ul>

      <h2>4. Features That Send Data to Castov Servers (Account Required)</h2>
      <p>
        Features like <strong>Cloud Sync, Personal Workspace, Canvas, and Team Vaults</strong> require creating a Castov Account.
      </p>
      <ul>
        <li><strong>What is uploaded:</strong> Authentication details (email, provider ID) and cloud-synced workflows (Canvas graphs).</li>
        <li><strong>How synced data is protected:</strong> For Team Vaults, your `.env` variables are encrypted <strong>client-side</strong> before transmission. Castov servers store only the ciphertext. We cannot read your secrets.</li>
      </ul>

      <h2>5. Server Logs, Analytics, and Backups</h2>
      <ul>
        <li><strong>Server Logs:</strong> Our infrastructure providers (Vercel, Supabase) log standard request metadata (IP address, user-agent, timestamp, URL path) for DDoS protection and debugging. These logs <strong>do not</strong> contain the payload data of your tools (e.g., the JSON you parse or the Regex you test).</li>
        <li><strong>Analytics & Error Tracking:</strong> We use privacy-friendly analytics for page views. We do not use session-recording tools (like Hotjar or LogRocket) to capture your screen, ensuring your proprietary code and JSON payloads remain private.</li>
        <li><strong>Backups:</strong> Cloud-synced user data is backed up automatically. If you delete your account, backups are purged within 30 days.</li>
      </ul>

      <h2>Contact Us</h2>
      <p>If you have any questions about your privacy or data, please contact us at <a href="mailto:support@castov.com">support@castov.com</a>.</p>
    </StaticPage>
  );
}
