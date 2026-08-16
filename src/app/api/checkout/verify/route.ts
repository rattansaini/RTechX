import { NextResponse } from "next/server";
import { z } from "zod";
import { getCourse, nextBatch, tierById, type Tier } from "@/content/courses";
import { sendEnrolmentEmail } from "@/lib/email";
import { notifyN8n } from "@/lib/n8n";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const bodySchema = z
  .object({
    razorpay_order_id: z.string().min(4).max(64),
    razorpay_payment_id: z.string().min(4).max(64),
    razorpay_signature: z.string().min(16).max(256),
  })
  .strict();

/**
 * The trust boundary of the entire checkout.
 *
 * Razorpay's browser callback can be forged by anyone with the network tab
 * open — the payment id it carries proves nothing on its own. What proves a
 * payment is the HMAC signature, which can only be produced with the key
 * secret. Nothing is written, no email sent and no enrolment created until
 * that signature verifies.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`verify:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment response." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  const db = supabaseAdmin();

  const signatureValid = verifyPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!signatureValid) {
    console.error("[verify] SIGNATURE MISMATCH for order", razorpay_order_id);
    await db
      .from("orders")
      .update({ status: "failed" })
      .eq("razorpay_order_id", razorpay_order_id);
    return NextResponse.json(
      { error: "We couldn't verify that payment. Nothing has been charged to you." },
      { status: 400 }
    );
  }

  const { data: orderRow, error: fetchError } = await db
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", razorpay_order_id)
    .maybeSingle();

  if (fetchError || !orderRow) {
    console.error("[verify] order not found:", razorpay_order_id, fetchError);
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Idempotent: a double-submitted callback must not enrol twice or resend.
  if (orderRow.status === "paid") {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const { error: updateError } = await db
    .from("orders")
    .update({ status: "paid", razorpay_payment_id })
    .eq("razorpay_order_id", razorpay_order_id);

  if (updateError) {
    console.error("[verify] order update failed:", updateError);
    return NextResponse.json({ error: "Could not record the payment." }, { status: 500 });
  }

  const course = getCourse(orderRow.course_slug);
  const tier = course ? tierById(course, orderRow.tier_id as Tier["id"]) : undefined;
  const batch = course ? nextBatch(course) : null;

  if (!course || !tier || !batch) {
    // Payment is captured and recorded; the enrolment just needs a human.
    console.error("[verify] content lookup failed for order", razorpay_order_id);
    return NextResponse.json({ ok: true, needsManualEnrolment: true });
  }

  // Unique index on order_id makes this safe to retry.
  const { error: enrolError } = await db.from("enrollments").insert({
    order_id: orderRow.id,
    email: orderRow.buyer_email,
    name: orderRow.buyer_name,
    phone: orderRow.buyer_phone,
    course_slug: orderRow.course_slug,
    tier_id: orderRow.tier_id,
    batch_start_date: batch.startDate,
    status: "confirmed",
  });

  if (enrolError && !enrolError.message.includes("duplicate")) {
    console.error("[verify] enrolment insert failed:", enrolError);
  }

  if (orderRow.coupon_code) {
    // Increment redemption count. Best-effort: a miscount must never fail a
    // paid enrolment.
    const { data: c } = await db
      .from("coupons")
      .select("redeemed_count")
      .eq("code", orderRow.coupon_code)
      .maybeSingle();
    if (c) {
      await db
        .from("coupons")
        .update({ redeemed_count: (c.redeemed_count ?? 0) + 1 })
        .eq("code", orderRow.coupon_code);
    }
  }

  // Neither of these may block the response — the customer has paid.
  const emailResult = await sendEnrolmentEmail({
    to: orderRow.buyer_email,
    name: orderRow.buyer_name,
    course,
    tier,
    batchStartDate: batch.startDate,
    timeIST: batch.timeIST,
    amountPaise: orderRow.amount_paise,
    orderId: razorpay_order_id,
  }).catch((err) => {
    console.error("[verify] email threw:", err);
    return { skipped: true as const };
  });

  void notifyN8n("enrolment.created", {
    name: orderRow.buyer_name,
    email: orderRow.buyer_email,
    phone: orderRow.buyer_phone,
    courseSlug: orderRow.course_slug,
    tierId: orderRow.tier_id,
    amountPaise: orderRow.amount_paise,
    batchStartDate: batch.startDate,
    razorpayOrderId: razorpay_order_id,
    attribution: orderRow.attribution ?? {},
  });

  return NextResponse.json({
    ok: true,
    emailSent: !("skipped" in emailResult && emailResult.skipped),
  });
}
