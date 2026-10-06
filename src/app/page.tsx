import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CategorySection } from "@/components/category-section";
import { FaqSection } from "@/components/faq-section";
import { HOME_FAQ } from "@/content/home";
import { buildMetadata, faqJsonLd, websiteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { ArrowRight, Terminal, ShieldCheck, Workflow, Database, Component, Play, Lock, Command, Zap } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Castov | Developer Tools & Engineering Workspace",
  description: "Fast, simple, privacy-friendly tools for timestamps, dates, time zones, formats, and developer workflows.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="bg-bg min-h-screen text-fg font-sans selection:bg-accent/20">
      <JsonLd data={[websiteJsonLd(), faqJsonLd(HOME_FAQ)]} />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden border-b border-line">
        {/* Subtle grid background for professional look */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="container relative mx-auto px-4 text-center max-w-5xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-field border border-line text-sm font-medium mb-8 text-muted">
            <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
            Castov Engine v2.0 is Live
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-fg mb-8 leading-[1.1]">
            The Ultimate Workspace for <br />
            <span className="text-accent">Software Engineers</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-muted max-w-3xl mx-auto mb-10 leading-relaxed">
            Stop searching for scattered tools. Castov provides a unified, secure, and lightning-fast suite of developer utilities—from timestamp converters and regex explainers to local AI environments.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/tools" className="flex items-center justify-center gap-2 bg-accent text-white dark:text-[#050505] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-accent-hover transition-colors w-full sm:w-auto shadow-sm">
              Explore Tools <ArrowRight size={20} />
            </Link>
            <Link href="/developer" className="flex items-center justify-center gap-2 bg-card border border-line text-fg px-8 py-4 rounded-xl font-semibold text-lg hover:bg-hover transition-colors w-full sm:w-auto shadow-sm">
              Read Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* --- PRODUCT SHOWCASE / IMAGES --- */}
      <section className="py-24 border-b border-line bg-card">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">Everything you need in one place</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              A comprehensive toolkit designed specifically for modern web development, DevOps, and AI engineering.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-bg rounded-2xl border border-line p-2 shadow-sm overflow-hidden">
              <Image 
                src="/hero-dashboard.jpg" 
                alt="Castov Developer Dashboard" 
                width={800} 
                height={500}
                className="rounded-xl border border-line w-full h-auto"
                priority
              />
            </div>
            <div className="space-y-6 lg:pl-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10 text-accent shrink-0">
                  <Terminal size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Zero-Latency Utilities</h3>
                  <p className="text-muted leading-relaxed">
                    All core utilities run 100% locally in your browser. No server round-trips, no data collection. Instant results for formatting, decoding, and parsing.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-success/10 text-success shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Privacy & Security First</h3>
                  <p className="text-muted leading-relaxed">
                    Your code never leaves your machine. Environment variables and secrets are managed via zero-knowledge encryption using your own BYOK setup.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-warning/10 text-warning shrink-0">
                  <Workflow size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Advanced Regex & AST</h3>
                  <p className="text-muted leading-relaxed">
                    Visually debug complex Regular Expressions with real-time Abstract Syntax Tree (AST) visualization and live match testing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECOND FEATURE SHOWCASE --- */}
      <section className="py-24 border-b border-line bg-bg">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center flex-col-reverse md:flex-row">
            <div className="space-y-6 lg:pr-8 order-2 md:order-1">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10 text-accent shrink-0">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Local SQLite Fiddle</h3>
                  <p className="text-muted leading-relaxed">
                    Write, execute, and format SQL queries entirely in the browser using a WASM-compiled SQLite engine. 
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-danger/10 text-danger shrink-0">
                  <Component size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Team Vaults</h3>
                  <p className="text-muted leading-relaxed">
                    Share API keys securely across your team using end-to-end encrypted vaults that integrate seamlessly into your workflow.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-field rounded-2xl border border-line p-2 shadow-sm overflow-hidden order-1 md:order-2">
              <Image 
                src="/canvas-workflow.jpg" 
                alt="Castov AI Canvas Workflow" 
                width={800} 
                height={500}
                className="rounded-xl border border-line w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- TOOLS CATEGORIES SECTION --- */}
      <section className="py-24 bg-card border-b border-line">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Explore Our Toolkit</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              From time manipulation to cryptography, everything is beautifully structured and instantly accessible.
            </p>
          </div>
          <CategorySection />
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-bg border-b border-line">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-muted text-lg">
              Everything you need to know about Castov.
            </p>
          </div>
          <FaqSection items={HOME_FAQ} />
        </div>
      </section>
      
      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to supercharge your workflow?</h2>
          <p className="text-xl text-muted mb-10">
            Join thousands of developers who save hours every week using Castov.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/signup" className="flex items-center justify-center gap-2 bg-accent text-white dark:text-[#050505] px-8 py-4 rounded-xl font-bold text-lg hover:bg-accent-hover transition-colors shadow-sm w-full sm:w-auto">
              Create Free Account
            </Link>
            <Link href="/tools" className="flex items-center justify-center gap-2 bg-bg border border-line text-fg px-8 py-4 rounded-xl font-bold text-lg hover:bg-hover transition-colors shadow-sm w-full sm:w-auto">
              Browse Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
