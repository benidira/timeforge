import type { Metadata } from "next";
import Link from "next/link";
import { RelatedTools } from "@/components/related-tools";

export const metadata: Metadata = {
  title: { absolute: "404 – Page not found | TimeForge" },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <section className="hero-section mx-auto max-w-4xl px-6 py-24 text-center sm:py-32 animate-fade-in-up">
        <div className="hero-glow mb-8 mx-auto w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
          <span className="text-4xl font-mono text-accent">404</span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-fg sm:text-6xl">Lost in Time</h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-muted">
          The page you&apos;re looking for has been swallowed by a black hole, or it never existed. Let&apos;s get you back to the present.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/" className="btn btn-primary btn-lg px-8">
            Return Home
          </Link>
          <Link href="/tools" className="btn btn-secondary btn-lg px-8">
            Browse Tools
          </Link>
        </div>
      </section>
      
      <div className="mx-auto max-w-5xl px-6 pb-24">
        <div className="border-t border-line pt-16">
          <RelatedTools
            slugs={["unix-timestamp-converter", "current-unix-timestamp", "timezone-converter"]}
            heading="Popular Tools to Try Instead"
          />
        </div>
      </div>
    </>
  );
}
