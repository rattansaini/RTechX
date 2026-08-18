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
          {
            /**
             * REPORT-ONLY on purpose — this policy is not enforced yet.
             *
             * The page that matters most here is checkout, and Razorpay's payment
             * window is a third-party script that injects its own styles and opens
             * its own frames, plus the bank pages it hands off to. A policy one
             * directive too tight does not degrade gracefully: the pay button stops
             * working and the shop is shut until somebody notices. Report-only gives
             * the same visibility with none of that risk — violations appear in the
             * browser console and nothing is ever blocked.
             *
             * It lives here rather than in netlify.toml because Netlify's header
             * rules do not reliably reach Next.js server responses; the four headers
             * above are served from this config, and a copy in netlify.toml was
             * silently absent in production.
             *
             * To enforce, once a real payment has completed with the console open and
             * nothing was reported: rename the key to "Content-Security-Policy".
             * Re-check after any change to analytics or embedded third parties.
             */
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "form-action 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com https://www.googletagmanager.com https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.razorpay.com https://www.google-analytics.com https://www.facebook.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.razorpay.com https://lumberjack.razorpay.com https://www.google-analytics.com https://connect.facebook.net",
              "frame-src https://*.razorpay.com https://api.razorpay.com",
              // `upgrade-insecure-requests` belongs here when this policy is
              // enforced, but browsers ignore it in report-only mode and log an
              // error saying so — on every page load. That noise would bury the
              // genuine violations this policy exists to surface. Add it back in
              // the same commit that drops "-Report-Only" from the key.
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
