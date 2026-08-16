import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. SERVER ONLY.
 *
 * This key bypasses row-level security, and the `rtechx` tables carry RLS with
 * zero policies precisely so nothing else can reach them. The `server-only`
 * import above makes the build fail rather than let this file be pulled into a
 * client bundle.
 *
 * Scoped to the `rtechx` schema — the same Postgres database also hosts an
 * unrelated Amazon reporting project in `public`, including its own `orders`
 * table that would otherwise collide.
 */

// supabase-js types the schema as a literal, so widen it deliberately rather
// than letting `string` from the environment break the client's generics.
const SCHEMA = (process.env.SUPABASE_SCHEMA ?? "rtechx") as "rtechx";

function build() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, key, {
    db: { schema: SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "rtechx-site" } },
  });
}

let cached: ReturnType<typeof build> | null = null;

export function supabaseAdmin() {
  cached ??= build();
  return cached;
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
