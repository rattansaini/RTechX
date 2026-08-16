import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Emits a self-contained server bundle in .next/standalone with only the
   * dependencies actually reached at runtime. On a VPS this is the difference
   * between shipping node_modules (hundreds of MB) and shipping ~50MB, and it
   * means the box never needs a production `npm install`.
   *
   * Harmless on Vercel/Netlify, which ignore it.
   */
  output: "standalone",

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
