import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HOME_FAQ } from "@/content/home";
import { buildMetadata, websiteJsonLd, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { CategorySection } from "@/components/category-section";
import { FaqSection } from "@/components/faq-section";
import { CopyButton } from "@/components/ui/copy-button";
import { ArrowRightIcon, TerminalIcon, ShieldCheckIcon, WorkflowIcon, DatabaseIcon, ComponentIcon, PlayIcon, LockIcon } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Castov | Developer tools that just work",
  description: "Fast, simple, privacy-friendly tools for timestamps, dates, time zones, formats, and developer workflows.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <JsonLd data={[websiteJsonLd(), faqJsonLd(HOME_FAQ)]} />

      {/* ── 1. Hero Section ── */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQgMzBoLTh2LThoOHY4em0wIDMwaC04di04aDh2OHptLTMwIDBoLTh2LThoOHY4em0tMzAgMGgtdnYtOGg4djh6bTAtMzBoLTh2LThoOHY4em0wLTMwaC04di04aDh2OHptMzAgMGgtOHYtOGg4djh6bTMwIDBoLTh2LThoOHY4eiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="container relative mx-auto px-4 text-center max-w-5xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Castov Engine v2.0 is Live
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
            A Growing Collection of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Free Developer Tools</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Stop searching for scattered tools. Castov provides a unified, secure, and lightning-fast workspace for your daily engineering tasks—from secure environment vaults to Docker visualizers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/tools" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 w-full sm:w-auto">
              Explore Tools <ArrowRightIcon size={20} />
            </Link>
            <Link href="/env-vault" className="flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm w-full sm:w-auto">
              <ShieldCheckIcon size={20} className="text-blue-600" /> Secure Vault
            </Link>
          </div>
        </div>

        {/* Hero Abstract Image / Graphic */}
        <div className="relative max-w-5xl mx-auto mt-20 px-4">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="mx-auto bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-md font-mono flex items-center gap-2">
                <LockIcon size={12} /> castov.com/workspace
              </div>
            </div>
            
            <div className="bg-gray-100 flex flex-col items-center justify-center min-h-[300px] overflow-hidden relative">
               <Image 
                  src="/hero-dashboard.jpg" 
                  alt="Castov SaaS Developer Dashboard" 
                  width={1200} 
                  height={800} 
                  className="object-cover w-full h-auto scale-[1.02] hover:scale-105 transition-transform duration-700" 
                  priority
               />
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Feature Showcase ── */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Build Faster</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Castov replaces dozens of separate utilities with one cohesive platform designed for modern engineering teams.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/canvas" className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-100 h-40 relative">
                <Image src="/canvas-workflow.jpg" alt="Workflow Canvas" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Agentic Canvas</h3>
              <p className="text-gray-600 leading-relaxed">
                Visually build and connect workflows using our interactive drag-and-drop canvas. Chain encodings, extractors, and logic nodes seamlessly.
              </p>
            </Link>

            <Link href="/env-vault" className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-600 rounded-xl flex items-center justify-center mb-6 transition-colors">
                <ShieldCheckIcon className="text-emerald-600 group-hover:text-white transition-colors" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">Zero-Knowledge Vaults</h3>
              <p className="text-gray-600 leading-relaxed">
                Share `.env` files safely with your team. We use WebCrypto AES-GCM and RSA-OAEP to ensure secrets are never stored in plain-text.
              </p>
            </Link>

            <Link href="/sqlite-fiddle" className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 bg-purple-50 group-hover:bg-purple-600 rounded-xl flex items-center justify-center mb-6 transition-colors">
                <DatabaseIcon className="text-purple-600 group-hover:text-white transition-colors" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">In-Browser SQLite</h3>
              <p className="text-gray-600 leading-relaxed">
                Instantly spin up a WebAssembly-powered SQLite database right in your browser. Write queries, test schemas, and export data with zero backend.
              </p>
            </Link>

            <Link href="/docker-visualizer" className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 bg-orange-50 group-hover:bg-orange-600 rounded-xl flex items-center justify-center mb-6 transition-colors">
                <ComponentIcon className="text-orange-600 group-hover:text-white transition-colors" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Docker Visualizer</h3>
              <p className="text-gray-600 leading-relaxed">
                Paste your `docker-compose.yml` and instantly generate a beautiful architectural diagram of your containers, networks, and volumes.
              </p>
            </Link>

            <Link href="/secret-scanner" className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 bg-pink-50 group-hover:bg-pink-600 rounded-xl flex items-center justify-center mb-6 transition-colors">
                <TerminalIcon className="text-pink-600 group-hover:text-white transition-colors" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">Secret Scanner</h3>
              <p className="text-gray-600 leading-relaxed">
                Scan your codebase client-side for exposed API keys (AWS, Stripe, GitHub). 100% offline regex matching keeps your code private.
              </p>
            </Link>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-sm flex flex-col justify-center items-center text-center text-white">
              <h3 className="text-2xl font-bold mb-3">And 40+ More Tools</h3>
              <p className="text-blue-100 mb-6">Timestamps, Encoders, JSON Formatters, JWT Decoders, and more.</p>
              <Link href="/tools" className="bg-white text-blue-700 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
                View All Tools <ArrowRightIcon size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── 3. CLI Banner ── */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="container relative mx-auto px-4 max-w-4xl text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
            <TerminalIcon size={32} className="text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Also Available in your Terminal</h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg">Access the core engine of Castov directly from your command line without ever opening a browser tab.</p>
          <div className="inline-flex items-center gap-4 bg-black/50 border border-white/20 px-8 py-5 rounded-2xl font-mono text-xl shadow-2xl backdrop-blur-md">
            <span className="text-emerald-400 font-bold">$</span> 
            <span className="text-gray-100">npx castov</span>
            <div className="ml-4 pl-4 border-l border-white/20">
              <CopyButton value="npx castov" label="copy command" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Standard Tool Categories ── */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Explore by Category</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Find exactly what you need to format, convert, or calculate.
            </p>
          </div>
          <CategorySection headingLevel={3} />
        </div>
      </section>

      {/* ── 5. FAQ Section ── */}
      <section className="bg-gray-50 border-t border-gray-200">
        <FaqSection items={HOME_FAQ} headingId="faq" />
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Supercharge Your Workflow?</h2>
          <p className="text-xl text-blue-100 mb-10">Join thousands of developers using Castov to build, debug, and collaborate efficiently.</p>
          <div className="flex justify-center gap-4">
            <Link href="/tools" className="bg-white text-blue-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-xl">
              Start Using Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

