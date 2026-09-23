import type { FaqItem } from "@/lib/seo";

/** Fully visible FAQ (no collapsed answers), so it matches the FAQPage structured data. */
export function FaqSection({ items, headingId = "faq" }: { items: FaqItem[]; headingId?: string }) {
  return (
    <section aria-labelledby={headingId} className="prose-tf">
      <h2 id={headingId}>Frequently asked questions</h2>
      {items.map((item) => (
        <div key={item.q}>
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </div>
      ))}
    </section>
  );
}
