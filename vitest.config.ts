import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Unit tests only, and deliberately so.
 *
 * Everything covered here is pure: signature verification, price arithmetic and
 * calendar dates. None of it touches Razorpay, Supabase or Resend, so the suite
 * can never move money, write a row or send mail. That is the point — the parts
 * of this codebase most worth testing are exactly the parts you must not test
 * against production.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // `server-only` throws when imported outside a React Server Component.
      // These modules are server-only in production and plain functions here.
      "server-only": new URL("./tests/stubs/server-only.ts", import.meta.url).pathname,
    },
  },
});
