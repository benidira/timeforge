"use client";

import { useEffect } from "react";
import { ADS, type AdPlacement } from "@/lib/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Reserved place for a Google AdSense unit. Renders NOTHING (no fake ads, no empty box) until
 * NEXT_PUBLIC_ADSENSE_CLIENT and the slot id for this placement are configured.
 *
 * Placement rules baked in: always separated from the tool by generous spacing, labelled
 * "Advertisement", never styled like a button, and never placed directly above a Convert button.
 */
export function AdSlot({ placement }: { placement: AdPlacement }) {
  const client = ADS.client;
  const slot = ADS.slots[placement];
  const enabled = Boolean(client && slot);

  useEffect(() => {
    if (!enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* the ad script may be blocked; the page keeps working */
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <aside aria-label="Advertisement" data-ad-placement={placement} className="my-10">
      <p className="mb-1 text-xs text-muted">Advertisement</p>
      <ins
        className="adsbygoogle block min-h-[120px]"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
