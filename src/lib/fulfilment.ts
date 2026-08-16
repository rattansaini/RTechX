import "server-only";
import { getCourse, nextBatch, tierById, type Tier } from "@/content/courses";
import { sendEnrolmentEmail } from "@/lib/email";
import { notifyN8n } from "@/lib/n8n";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Turning a verified payment into an enrolment.
 *
 * Shared by two callers that must not disagree:
 *   - /api/checkout/verify   — the browser callback, when it arrives
 *   - /api/razorpay/webhook  — Razorpay's server-to-server notice
 *
 * The second exists because the first is unreliable in exactly the situation
 * Indian checkout hits most: someone pays by UPI, their phone switches to the
 * banking app, and the tab is gone before the callback fires. Without the
 * webhook that payment is captured by Razorpay and invisible to us.
 *
 * Both can fire for the same order, so this is idempotent throughout.
 */

export type FulfilResult =
  | { ok: true; alreadyProcessed: true }
  | { ok: true; alreadyProcessed: false; emailSent: boolean }
  | { ok: false; reason: "order-not-found" | "content-missing" | "update-failed" };

export async function fulfilOrder(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  /** Where this came from, for the logs. */
  via: "callback" | "webhook";
}): Promise<FulfilResult> {
  const db = supabaseAdmin();

  const { data: orderRow, error: fetchError } = await db
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", input.razorpayOrderId)
    .maybeSingle();

  if (fetchError || !orderRow) {
    console.error(`[fulfil:${input.via}] order not found`, input.razorpayOrderId);
    return { ok: false, reason: "order-not-found" };
  }

  if (orderRow.status === "paid") {
    return { ok: true, alreadyProcessed: true };
  }

  const { error: updateError } = await db
    .from("orders")
    .update({ status: "paid", razorpay_payment_id: input.razorpayPaymentId })
    .eq("razorpay_order_id", input.razorpayOrderId);

  if (updateError) {
    console.error(`[fulfil:${input.via}] order update failed`, updateError);
    return { ok: false, reason: "update-failed" };
  }

  const course = getCourse(orderRow.course_slug);
  const tier = course ? tierById(course, orderRow.tier_id as Tier["id"]) : undefined;
  const batch = course ? nextBatch(course) : null;

  if (!course || !tier || !batch) {
    // Money is captured and recorded; this one just needs a human.
    console.error(`[fulfil:${input.via}] content lookup failed`, input.razorpayOrderId);
    return { ok: false, reason: "content-missing" };
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

  const duplicate =
    enrolError?.message?.includes("duplicate") || enrolError?.code === "23505";
  if (enrolError && !duplicate) {
    console.error(`[fulfil:${input.via}] enrolment insert failed`, enrolError);
  }

  // A miscount must never fail a paid enrolment.
  if (orderRow.coupon_code) {
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

  // If the enrolment already existed, the email already went out.
  let emailSent = false;
  if (!duplicate) {
    const result = await sendEnrolmentEmail({
      to: orderRow.buyer_email,
      name: orderRow.buyer_name,
      course,
      tier,
      batchStartDate: batch.startDate,
      timeIST: batch.timeIST,
      amountPaise: orderRow.amount_paise,
      orderId: input.razorpayOrderId,
    }).catch((err) => {
      console.error(`[fulfil:${input.via}] email threw`, err);
      return { skipped: true as const };
    });
    emailSent = !("skipped" in result && result.skipped);

    void notifyN8n("enrolment.created", {
      name: orderRow.buyer_name,
      email: orderRow.buyer_email,
      phone: orderRow.buyer_phone,
      courseSlug: orderRow.course_slug,
      tierId: orderRow.tier_id,
      amountPaise: orderRow.amount_paise,
      batchStartDate: batch.startDate,
      razorpayOrderId: input.razorpayOrderId,
      attribution: orderRow.attribution ?? {},
    });
  }

  return { ok: true, alreadyProcessed: false, emailSent };
}

/** Records a failed payment without touching an order that already succeeded. */
export async function markOrderFailed(razorpayOrderId: string, reason: string) {
  const db = supabaseAdmin();
  const { data } = await db
    .from("orders")
    .select("status, buyer_email, buyer_phone")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (!data || data.status === "paid") return;

  await db
    .from("orders")
    .update({ status: "failed" })
    .eq("razorpay_order_id", razorpayOrderId);

  void notifyN8n("order.failed", {
    razorpayOrderId,
    email: data.buyer_email,
    phone: data.buyer_phone,
    reason,
  });
}
