import type { Config } from "@netlify/functions";

/**
 * The 9am weekday trigger.
 *
 * The package this came from shipped a `vercel.json` cron. This site runs on
 * Netlify, where that file is inert — the schedule would simply never have
 * fired, silently, which is the worst way for a scheduler to fail.
 *
 * This function does no work itself. It calls the pipeline route with the
 * shared secret and reports what happened. Keeping the logic in the Next.js
 * route means one implementation to reason about, and it stays testable by
 * hand with a single curl command.
 *
 * `30 3 * * 1-5` is 03:30 UTC — 09:00 IST — Monday to Friday. Netlify schedules
 * are always UTC, so this does not drift when India has no daylight saving.
 */
export default async () => {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.CRON_SECRET;

  if (!base || !secret) {
    console.error("[schedule] NEXT_PUBLIC_SITE_URL or CRON_SECRET missing — not firing");
    return new Response("not configured", { status: 503 });
  }

  const res = await fetch(`${base}/api/cron/daily-post`, {
    headers: { authorization: `Bearer ${secret}` },
  });

  const body = await res.text();
  // Logged either way: a scheduled job that fails quietly is a post nobody
  // notices is missing until the feed has a gap.
  console.log(`[schedule] pipeline responded ${res.status}: ${body.slice(0, 400)}`);

  return new Response(body, { status: res.status });
};

export const config: Config = {
  schedule: "30 3 * * 1-5",
};
