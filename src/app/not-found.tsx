import type { Metadata } from "next";
import Link from "next/link";
import { RelatedTools } from "@/components/related-tools";

export const metadata: Metadata = {
  title: { absolute: "Page not found | TimeForge" },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">
        That page does not exist. Try one of these tools, or go back to the <Link href="/">home page</Link>.
      </p>
      <RelatedTools slugs={["unix-timestamp-converter", "current-unix-timestamp", "timezone-converter"]} heading="Popular tools" />
    </div>
  );
}
