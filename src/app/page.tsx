import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CategorySection } from "@/components/category-section";
import { FaqSection } from "@/components/faq-section";
import { HOME_FAQ } from "@/content/home";
import { buildMetadata, faqJsonLd, websiteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { CopyButton } from "@/components/ui/copy-button";
import { ArrowRightIcon, TerminalIcon, ShieldCheckIcon, WorkflowIcon, DatabaseIcon, ComponentIcon, PlayIcon, LockIcon, CommandIcon, ZapIcon, LockKeyholeIcon } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Castov | Developer tools that just work",
  description: "Fast, simple, privacy-friendly tools for timestamps, dates, time zones, formats, and developer workflows.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="bg-[#050505] min-h-screen selection:bg-accent/30 text-gray-200">
      <JsonLd data={[websiteJsonLd(), faqJsonLd(HOME_FAQ)]} />

      {/* ── 1. Hero Section (Pitch Black) ── */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQgMzBoLTh2LThoOHY4em0wIDMwaC04di04aDh2OHptLTMwIDBoLTh2LThoOHY4em0tMzAgMGgtdnYtOGg4djh6bTAtMzBoLTh2LThoOHY4em0wLTMwaC04di04aDh2OHptMzAgMGgtOHYtOGg4djh6bTMwIDBoLTh2LThoOHY4eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjAyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

        <div className="container relative mx-auto px-4 text-center max-w-5xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium mb-8 backdrop-blur-md shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            Castov Engine v2.0 is Live
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-8 leading-[1.1]">
            A Growing Collection of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Free Developer Tools
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Stop searching for scattered tools. Castov provides a unified, secure, and lightning-fast workspace for your daily engineering tasks—from environment vaults to Docker visualizers.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/tools" className="flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-accent/90 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] w-full sm:w-auto">
              Explore Tools <ArrowRightIcon size={20} />
            </Link>
            <Link href="/signup" className="flex items-center justify-center gap-2 bg-white/5 text-white border border-white/10 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md w-full sm:w-auto">
              Create Account <CommandIcon size={20} className="text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Hero Abstract Image / Graphic */}
        <div className="relative max-w-5xl mx-auto mt-24 px-4 perspective-[1000px]">
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden transform rotate-x-[5deg] hover:rotate-x-0 transition-transform duration-700 ease-out">
            <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="mx-auto bg-white/5 text-gray-400 text-xs px-3 py-1 rounded-md font-mono flex items-center gap-2 border border-white/5">
                <LockIcon size={12} className="text-emerald-400" /> castov.com/workspace
              </div>
            </div>
            
            <div className="bg-[#050505] flex flex-col items-center justify-center min-h-[300px] overflow-hidden relative">
               <Image 
                  src="/hero-dashboard.jpg" 
                  alt="Castov SaaS Developer Dashboard" 
                  width={1200} 
                  height={800} 
                  className="object-cover w-full h-auto scale-[1.01] hover:scale-105 transition-transform duration-[2000ms] opacity-90" 
                  priority
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Feature Bento Grid ── */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 tracking-tight">Everything You Need. <span className="text-gray-500">Zero Friction.</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Castov replaces dozens of separate utilities with one cohesive platform designed for modern engineering teams.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Big Card 1 */}
            <Link href="/canvas" className="lg:col-span-2 bg-[#0a0a0a] rounded-3xl p-8 border border-white/10 shadow-lg hover:border-accent/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full group-hover:bg-accent/20 transition-colors" />
              <div className="mb-8 rounded-xl overflow-hidden shadow-2xl border border-white/10 h-64 relative bg-[#050505]">
                <Image src="/canvas-workflow.jpg" alt="Workflow Canvas" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                <WorkflowIcon className="text-accent" /> Agentic Canvas
              </h3>
              <p className="text-gray-400 leading-relaxed max-w-xl">
                Visually build and connect workflows using our interactive drag-and-drop canvas. Chain encodings, extractors, and logic nodes seamlessly without writing scripts.
              </p>
            </Link>

            {/* Small Card 1 */}
            <Link href="/env-vault" className="bg-[#0a0a0a] rounded-3xl p-8 border border-white/10 shadow-lg hover:border-emerald-500/50 transition-all group relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-colors" />
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <LockKeyholeIcon className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Zero-Knowledge Vaults</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Share `.env` files safely with your team. We use WebCrypto AES-GCM to ensure secrets are never stored in plain-text on our servers.
              </p>
            </Link>

            {/* Small Card 2 */}
            <Link href="/sqlite-fiddle" className="bg-[#0a0a0a] rounded-3xl p-8 border border-white/10 shadow-lg hover:border-purple-500/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full" />
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <DatabaseIcon className="text-purple-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">In-Browser SQLite</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Instantly spin up a WebAssembly-powered SQLite database right in your browser. Test schemas and queries with zero backend required.
              </p>
            </Link>

            {/* Small Card 3 */}
            <Link href="/docker-visualizer" className="bg-[#0a0a0a] rounded-3xl p-8 border border-white/10 shadow-lg hover:border-orange-500/50 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[60px] rounded-full" />
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <ComponentIcon className="text-orange-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Docker Visualizer</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Paste your `docker-compose.yml` and instantly generate a beautiful architectural diagram of your containers and networks.
              </p>
            </Link>

            {/* Small Card 4 (CTA) */}
            <div className="bg-gradient-to-br from-accent/20 to-[#0a0a0a] rounded-3xl p-8 border border-accent/20 shadow-lg flex flex-col justify-center items-center text-center relative overflow-hidden">
              <ZapIcon className="text-accent mb-4" size={48} />
              <h3 className="text-2xl font-bold text-white mb-3">40+ More Tools</h3>
              <p className="text-gray-400 mb-8 text-sm">Timestamps, Encoders, JSON Formatters, JWT Decoders, and more.</p>
              <Link href="/tools" className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 w-full justify-center">
                View All Tools <ArrowRightIcon size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── 3. CLI Banner ── */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-accent/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="container relative mx-auto px-4 max-w-4xl text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md shadow-2xl">
            <TerminalIcon size={40} className="text-accent" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Also Available in your Terminal</h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg">Access the core engine of Castov directly from your command line without ever opening a browser tab.</p>
          <div className="inline-flex items-center gap-4 bg-[#050505] border border-white/10 px-8 py-5 rounded-2xl font-mono text-xl shadow-2xl">
            <span className="text-accent font-bold">$</span> 
            <span className="text-gray-200">npx castov</span>
            <div className="ml-4 pl-4 border-l border-white/10">
              <CopyButton value="npx castov" label="copy command" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Standard Tool Categories ── */}
      <section className="py-24 bg-[#050505]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Explore by Category</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Find exactly what you need to format, convert, or calculate.
            </p>
          </div>
          <div className="opacity-90">
             <CategorySection headingLevel={3} />
          </div>
        </div>
      </section>

      {/* ── 5. FAQ Section ── */}
      <section className="bg-[#0a0a0a] border-t border-white/5">
        <FaqSection items={HOME_FAQ} headingId="faq" />
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container relative mx-auto px-4 max-w-4xl text-center z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Ready to Supercharge Your Workflow?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Join a growing community of developers using Castov to build, debug, and collaborate efficiently.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/tools" className="bg-accent text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-accent/90 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)]">
              Start Using Tools
            </Link>
            <Link href="/signup" className="bg-white/10 text-white border border-white/20 px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-md">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
