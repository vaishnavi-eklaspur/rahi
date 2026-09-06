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
  // Self-contained server bundle (.next/standalone/server.js) for the container image,
  // so the app runs on any orchestrator (Kubernetes / OpenShift) with no Vercel runtime.
  // Skipped on Vercel — its own build packages output and standalone's file-tracing
  // collides with it (missing .nft.json). The Dockerfile build (VERCEL unset) gets it.
  output: process.env.VERCEL ? undefined : "standalone",
  // Don't advertise the framework. Vercel's edge already strips this header; setting it
  // here also covers the container/Kubernetes path, where Next would otherwise send it.
  poweredByHeader: false,
  // A stray package-lock.json in a parent dir confuses Next's root inference; pin it here.
  turbopack: { root: __dirname },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
