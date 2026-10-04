"use client";

import { useState } from "react";
import { AdSlot } from "@/components/ad-slot";
import { ADS } from "@/lib/site";

export function StickyAd() {
  const [dismissed, setDismissed] = useState(false);

  if (!ADS.client) return null;
  if (dismissed) return null;

  return (
    <div
      className="hidden max-[359px]:hidden sticky bottom-0 z-30 min-h-[50px] border-t border-line bg-card/95 backdrop-blur"
      data-sticky-ad
    >
      <div className="mx-auto max-w-4xl px-4 py-2 relative">
        <button
          type="button"
          aria-label="Dismiss advertisement"
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-2 z-10 rounded-md p-1.5 text-muted hover:bg-hover hover:text-fg transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="pr-8">
          <AdSlot placement="content-bottom" />
        </div>
      </div>
    </div>
  );
}
