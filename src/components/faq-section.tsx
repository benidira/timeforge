import type { FaqItem } from "@/lib/seo";
import { ChevronDown } from "lucide-react";

export function FaqSection({ items, headingId = "faq" }: { items: FaqItem[]; headingId?: string }) {
  if (!items || items.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="w-full max-w-4xl mx-auto my-16">
      <h2 id={headingId} className="text-3xl font-bold tracking-tight mb-8 text-center text-fg">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <details 
            key={index} 
            className="group bg-card border border-line rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-md [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-fg text-lg list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              <span>{item.q}</span>
              <span className="ml-6 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-field group-hover:bg-accent/10 transition-colors">
                <ChevronDown className="w-5 h-5 text-muted group-open:-rotate-180 transition-transform duration-300 group-hover:text-accent" />
              </span>
            </summary>
            <div className="px-6 pb-6 text-muted text-base leading-relaxed border-t border-line/50 mt-2 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
