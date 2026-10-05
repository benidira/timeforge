import type { NextConfig } from "next";

/**
 * Security headers that are safe for a fully static, script-light site.
 * A Content-Security-Policy is intentionally NOT set here yet: Next.js needs
 * nonce-based CSP for its inline bootstrap scripts, and Google AdSense will need
 * extra allowed hosts. Add a nonce-based CSP together with AdSense (see README).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: '/tools/:tool(unix-timestamp-converter|epoch-converter|timestamp-to-date|date-to-timestamp|current-unix-timestamp|milliseconds-to-date|iso-8601-to-unix|unix-to-iso-8601|timezone-converter|timestamp-difference|utc-converter|date-difference|time-duration-calculator|add-time|subtract-time|unix-timestamp-validator|epoch-milliseconds|unix-timestamp-batch-converter|date-format-converter|iso-8601-converter|rfc-3339-converter|timezone-offset|world-clock|business-hours-converter|cron-generator)',
        destination: '/:tool',
        permanent: true,
      }
    ];
  }
};

export default nextConfig;
