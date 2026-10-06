import type { Metadata } from "next";
import { Webhook, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Local Webhook Tester | Castov",
  description: "Test webhooks securely. Generate a temporary URL to catch and inspect HTTP requests instantly in your browser.",
};

export default function WebhookTesterPage() {
  return (
    <div className="layout-content max-w-4xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-fg mb-4">
          Local Webhook Tester
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Generate a temporary endpoint to catch and inspect incoming webhooks in real-time. 
          Perfect for testing Stripe, GitHub, or any external API.
        </p>
      </div>

      <div className="card p-12 text-center border-dashed border-2 border-line">
        <Webhook className="w-16 h-16 text-muted mx-auto mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-4">Coming Soon in v2.1</h2>
        <p className="text-muted mb-8 max-w-lg mx-auto">
          We are currently building the realtime infrastructure for this tool using WebSocket connections to ensure payloads are caught instantly without server logging.
        </p>
        <button className="btn btn-primary" disabled>
          Generate Temporary URL
        </button>
      </div>
    </div>
  );
}
