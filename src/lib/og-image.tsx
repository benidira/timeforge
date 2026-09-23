import { ImageResponse } from "next/og";

import { OG_SIZE } from "./og-constants";

/** Static social card, rendered once at build time. */
export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0B1020",
          color: "#F3F4F6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            T
          </div>
          <div style={{ marginLeft: 24, fontSize: 44, fontWeight: 700 }}>TimeForge</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>Free Time &amp; Timestamp Tools</div>
        <div style={{ marginTop: 28, fontSize: 34, color: "#A1A9B8" }}>
          Unix timestamp, epoch, ISO 8601 and time zone converters
        </div>
        <div style={{ marginTop: 48, fontSize: 40, color: "#A5B4FC", fontFamily: "monospace" }}>1790000000</div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
