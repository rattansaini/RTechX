import { NextResponse } from "next/server";
import { fulfilOrder, markOrderFailed } from "@/lib/fulfilment";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";
// Signature is computed over the exact bytes Razorpay sent, so this route must
// never let a framework re-serialise the body.
export const dynamic = "force-dynamic";

/**
 * Razorpay server-to-server webhook.
 *
 * This is the safety net for the most common Indian checkout failure: someone
 * pays by UPI, their phone switches to the banking app, and the browser tab is
 * gone before the success callback fires. Razorpay captured the money; without
 * this endpoint we would never know, and a paying student would be left with
 * no enrolment and no email.
 *
 * Setup: Razorpay dashboard → Settings → Webhooks → Add.
 *   URL     https://www.rtechx.com/api/razorpay/webhook
 *   Secret  any value you choose — put the same one in RAZORPAY_WEBHOOK_SECRET
 *   Events  payment.captured, payment.failed
 */
export async function POST(req: Request) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.error("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET unset — rejecting");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  // Read raw text, not JSON: the HMAC covers the literal payload.
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("[razorpay-webhook] SIGNATURE MISMATCH — ignoring");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string; error_description?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;
  const paymentId = payment?.id;

  if (!orderId || !paymentId) {
    // Acknowledge anyway: a 4xx makes Razorpay retry an event we can't use.
    return NextResponse.json({ ok: true, ignored: "no order id" });
  }

  if (event.event === "payment.captured") {
    const result = await fulfilOrder({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      via: "webhook",
    });
    // Always 200. Razorpay retries non-2xx, and retrying a missing order or a
    // content lookup failure will never succeed — it just floods the log.
    return NextResponse.json({ ok: true, result });
  }

  if (event.event === "payment.failed") {
    await markOrderFailed(orderId, payment?.error_description ?? "payment_failed");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: event.event ?? "unknown" });
}
