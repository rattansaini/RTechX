/**
 * Fixed-window rate limiter, in-process.
 *
 * Good enough to stop a script hammering the lead and coupon endpoints from
 * one address. It is per-instance, so a horizontally scaled deployment gets
 * roughly `limit x instances` — swap the store for Upstash/Redis if that
 * matters. It is not a defence against a distributed flood; that belongs at
 * the edge (Vercel WAF / Cloudflare).
 */

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    // Cheap unbounded-growth guard: drop everything once the map gets large.
    if (buckets.size > MAX_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return {
    ok: entry.count <= limit,
    remaining,
    retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
