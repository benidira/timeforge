import type { Metadata } from "next";
import Link from "next/link";
import { Terminal, Shield, Lock, Zap } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Castov CLI & Env Vault | Secure Local Secrets",
  description: "Pull your encrypted environment variables securely into your local development server using the Castov CLI.",
};

export default function CliPage() {
  return (
    <div className="layout-content max-w-4xl py-12">
      <JsonLd data={[websiteJsonLd()]} />
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-fg mb-4">
          Castov <span className="text-accent">CLI</span>
        </h1>
        <p className="text-xl text-muted">
          Stop sharing <code className="bg-field px-2 py-0.5 rounded text-sm text-fg">.env</code> files in Slack. Securely sync secrets to your local dev server.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 mb-16">
        <div className="card p-6">
          <Terminal className="w-8 h-8 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">1. Install the CLI</h3>
          <p className="text-muted text-sm mb-4">Install globally via npm or run via npx.</p>
          <div className="bg-[#050505] rounded-lg p-4 font-mono text-xs text-[#f4f4f5]">
            npm install -g castov-cli
          </div>
        </div>
        <div className="card p-6">
          <Lock className="w-8 h-8 text-success mb-4" />
          <h3 className="text-xl font-bold mb-2">2. Pull Secrets</h3>
          <p className="text-muted text-sm mb-4">Fetch your team's encrypted vault directly into your local process.</p>
          <div className="bg-[#050505] rounded-lg p-4 font-mono text-xs text-[#f4f4f5]">
            castov env pull --vault dev
          </div>
        </div>
      </div>

      <div className="prose prose-sm prose-invert max-w-none text-fg mb-16 bg-card p-8 rounded-2xl border border-line">
        <h2 className="text-2xl font-bold mb-4">How it works (Zero-Knowledge)</h2>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <strong>End-to-End Encrypted:</strong> Variables are encrypted in your browser using AES-GCM before reaching our servers. We never see your plaintext keys.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <strong>Instant Injection:</strong> Use <code className="bg-field px-1.5 py-0.5 rounded">castov run -- npm run dev</code> to inject secrets into your process without ever writing them to disk.
            </div>
          </li>
        </ul>
      </div>

      <div className="text-center">
        <Link href="/env-vault/team" className="btn btn-primary px-8 py-3 text-lg">
          Create a Team Vault
        </Link>
      </div>
    </div>
  );
}
