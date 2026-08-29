import type { NextConfig } from "next";

// Baseline security headers applied to every response. A full Content-Security-Policy
// is intentionally omitted here — Next's inline styles/scripts and next/og need a nonce
// pipeline to do CSP without breaking rendering (see SECURITY_AUDIT.md, Known Limitations).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" }, // no framing → clickjacking protection
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // A stray package-lock.json in a parent dir confuses Next's root inference; pin it here.
  turbopack: { root: __dirname },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
