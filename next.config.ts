import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Self-contained server bundle in .next/standalone, containing only the
   * dependencies actually reached at runtime — what the Dockerfile ships, and
   * what any Docker host or VPS needs.
   *
   * Disabled on Netlify: its Next.js Runtime does its own bundling into
   * Functions and standalone output confuses it. `NETLIFY` is set during their
   * builds, so the same repo deploys correctly to both without a flag.
   */
  output: process.env.NETLIFY ? undefined : "standalone",

  // Surface real problems at build time rather than in production.
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
