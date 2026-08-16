import { NextResponse } from "next/server";
import { z } from "zod";
import { getCourse, tierById } from "@/content/courses";
import { resolveCoupon } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z
  .object({
    code: z.string().trim().min(1).max(40),
    courseSlug: z.string().min(1).max(120),
    tierId: z.enum(["core", "full"]),
    upgrade: z.boolean().default(false),
  })
  .strict();

/**
 * Coupon codes are validated here and applied again server-side at order
 * creation. This endpoint only exists to give the user a reason when a code is
 * refused — it is never the thing that sets the price.
 *
 * Rate limited harder than the other endpoints because it is the one an
 * attacker would use to brute-force valid codes.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`coupon:${ip}`, { limit: 6, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, reason: "Too many attempts. Try again shortly." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "Enter a coupon code." }, { status: 400 });
  }

  const { code, courseSlug, tierId, upgrade } = parsed.data;

  const course = getCourse(courseSlug);
  const tier = course ? tierById(course, tierId) : undefined;
  if (!course || !tier) {
    return NextResponse.json({ ok: false, reason: "Unknown course." }, { status: 404 });
  }

  let subtotalPaise = Math.round(tier.priceINR * 100);
  if (upgrade) {
    const parent = tier.inheritsFrom ? tierById(course, tier.inheritsFrom) : undefined;
    if (!parent) {
      return NextResponse.json(
        { ok: false, reason: "This option can't be upgraded to." },
        { status: 400 }
      );
    }
    subtotalPaise -= Math.round(parent.priceINR * 100);
  }

  const result = await resolveCoupon(code, tierId, subtotalPaise);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason });
  }

  return NextResponse.json({
    ok: true,
    code: result.coupon.code,
    label: result.label,
    discountPaise: result.discountPaise,
    totalPaise: subtotalPaise - result.discountPaise,
  });
}
