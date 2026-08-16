import { NextResponse } from "next/server";
import { z } from "zod";
import { getCourse, nextBatch } from "@/content/courses";
import { notifyN8n } from "@/lib/n8n";
import { resolvePrice } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const bodySchema = z
  .object({
    courseSlug: z.string().min(1).max(120),
    tierId: z.enum(["core", "full"]),
    upgrade: z.boolean().default(false),
    couponCode: z.string().max(40).nullish(),
    name: z.string().trim().min(2).max(120),
    email: z.email().max(254),
    // Deliberately permissive: Indian mobile numbers arrive with +91, spaces,
    // hyphens. Normalised below rather than rejected.
    phone: z.string().trim().min(8).max(24),
    city: z.string().trim().max(80).optional(),
    status: z.enum(["student", "working-recruiter", "other"]).optional(),
    attribution: z.record(z.string(), z.string()).optional(),
    company: z.string().max(0).optional(), // honeypot
  })
  .strict();

const normalisePhone = (raw: string) => raw.replace(/[^\d+]/g, "");

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`create-order:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } }
    );
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Payments aren't switched on yet. Please email us and we'll book you in." },
      { status: 503 }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the details you entered." },
      { status: 400 }
    );
  }

  const input = parsed.data;
  if (input.company) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const course = getCourse(input.courseSlug);
  if (!course) return NextResponse.json({ error: "Unknown course." }, { status: 404 });

  const batch = nextBatch(course);
  if (!batch) {
    return NextResponse.json(
      { error: "There's no upcoming batch open right now." },
      { status: 409 }
    );
  }

  // Price is computed here, never accepted from the client.
  const price = await resolvePrice({
    courseSlug: input.courseSlug,
    tierId: input.tierId,
    isUpgrade: input.upgrade,
    couponCode: input.couponCode ?? null,
  });
  if ("error" in price) {
    return NextResponse.json({ error: price.error }, { status: 400 });
  }

  const phone = normalisePhone(input.phone);

  // Capture the lead before payment is attempted, so an abandoned checkout
  // still leaves us someone to follow up with.
  const db = supabaseAdmin();
  await db
    .from("leads")
    .upsert(
      {
        email: input.email.toLowerCase(),
        name: input.name,
        phone,
        source: "checkout",
        course_slug: course.slug,
        attribution: input.attribution ?? {},
      },
      { onConflict: "email,source", ignoreDuplicates: false }
    )
    .then(({ error }) => {
      if (error) console.error("[create-order] lead upsert failed (ignored):", error);
    });

  let order;
  try {
    order = await createRazorpayOrder({
      amountPaise: price.totalPaise,
      receipt: `rtx_${Date.now().toString(36)}`,
      notes: {
        course: course.slug,
        tier: price.tier.id,
        upgrade: String(price.isUpgrade),
        email: input.email,
      },
    });
  } catch (err) {
    console.error("[create-order] razorpay failed:", err);
    return NextResponse.json(
      { error: "Couldn't start the payment. Please try again." },
      { status: 502 }
    );
  }

  const { error: insertError } = await db.from("orders").insert({
    razorpay_order_id: order.id,
    status: "created",
    course_slug: course.slug,
    tier_id: price.tier.id,
    is_upgrade: price.isUpgrade,
    amount_paise: price.totalPaise,
    currency: "INR",
    coupon_code: price.couponCode,
    buyer_name: input.name,
    buyer_email: input.email.toLowerCase(),
    buyer_phone: phone,
    buyer_city: input.city ?? null,
    buyer_status: input.status ?? null,
    attribution: input.attribution ?? {},
  });

  if (insertError) {
    // Without a row we can't verify this payment later, so stop before the
    // customer is charged rather than take money we can't reconcile.
    console.error("[create-order] order insert failed:", insertError);
    return NextResponse.json(
      { error: "Couldn't start the payment. Please try again." },
      { status: 500 }
    );
  }

  void notifyN8n("lead.created", {
    email: input.email.toLowerCase(),
    name: input.name,
    phone,
    source: "checkout-started",
    courseSlug: course.slug,
    attribution: input.attribution ?? {},
  });

  return NextResponse.json({
    razorpayOrderId: order.id,
    amountPaise: price.totalPaise,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    courseTitle: course.title,
    tierName: price.tier.name,
    discountPaise: price.discountPaise,
    couponLabel: price.couponLabel,
    batchStartDate: batch.startDate,
    prefill: { name: input.name, email: input.email, contact: phone },
  });
}
