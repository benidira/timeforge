import Script from "next/script";
import { ADS } from "@/lib/site";

/** Loads the AdSense library only when a publisher id is configured. */
export function AdSenseScript() {
  if (!ADS.client) return null;
  return (
    <Script
      id="adsense"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADS.client)}`}
      crossOrigin="anonymous"
    />
  );
}
