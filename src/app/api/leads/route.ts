import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyN8n } from "@/lib/n8n";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const attributionSchema = z
  .object({
    utm_source: z.string().max(200).optional(),
    utm_medium: z.string().max(200).optional(),
    utm_campaign: z.string().max(200).optional(),
    utm_content: z.string().max(200).optional(),
    utm_term: z.string().max(200).optional(),
    ad_id: z.string().max(200).optional(),
    campaign_id: z.string().max(200).optional(),
    adgroup_id: z.string().max(200).optional(),
    fbclid: z.string().max(200).optional(),
    gclid: z.string().max(200).optional(),
    landing_path: z.string().max(300).optional(),
    referrer: z.string().max(300).optional(),
  })
  .strict()
  .optional();

const leadSchema = z
  .object({
    email: z.email().max(254),
    /** Which form this came from, e.g. "free-resources", "course-notify". */
    source: z.string().min(1).max(60),
    name: z.string().max(120).optional(),
    phone: z.string().max(24).optional(),
    courseSlug: z.string().max(120).optional(),
    attribution: attributionSchema,
    /** Honeypot — real users never fill this. */
    company: z.string().max(0).optional(),
  })
  .strict();

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`leads:${ip}`, { limit: 8, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const lead = parsed.data;

  // Silently accept honeypot hits so bots don't learn they were caught.
  if (lead.company) return NextResponse.json({ ok: true });

  // TODO(step 6): persist to Supabase `leads` with the service-role client.
  // Deliberately kept out of the response path — a storage failure must not
  // cost us the enquiry, so it will be written best-effort and logged.

  await notifyN8n("lead.created", {
    email: lead.email,
    name: lead.name ?? null,
    phone: lead.phone ?? null,
    source: lead.source,
    courseSlug: lead.courseSlug ?? null,
    attribution: lead.attribution ?? {},
  });

  return NextResponse.json({ ok: true });
}
