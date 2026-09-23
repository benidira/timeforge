import type { FaqItem } from "@/lib/seo";

/** FAQ shown as plain, fully visible text so FAQPage structured data matches the page. */
export function FaqList({ items, heading = "Frequently asked questions" }: { items: FaqItem[]; heading?: string }) {
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading">{heading}</h2>
      {items.map((item) => (
        <div key={item.q}>
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </div>
      ))}
    </section>
  );
}
