import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in a parent dir confuses Next's root inference; pin it here.
  turbopack: { root: __dirname },
};

export default nextConfig;
