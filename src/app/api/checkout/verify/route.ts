import { NextResponse } from "next/server";
import { z } from "zod";
import { fulfilOrder, markOrderFailed } from "@/lib/fulfilment";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyPaymentSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

const bodySchema = z
  .object({
    razorpay_order_id: z.string().min(4).max(64),
    razorpay_payment_id: z.string().min(4).max(64),
    razorpay_signature: z.string().min(16).max(256),
  })
  .strict();

/**
 * The trust boundary of the checkout.
 *
 * Razorpay's browser callback can be forged by anyone with the network tab
 * open — the payment id it carries proves nothing on its own. What proves a
 * payment is the HMAC signature, which can only be produced with the key
 * secret. Nothing is written and no email sent until it verifies.
 *
 * Fulfilment itself lives in lib/fulfilment so this and the webhook can never
 * drift apart.
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

  const signatureValid = verifyPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!signatureValid) {
    console.error("[verify] SIGNATURE MISMATCH for order", razorpay_order_id);
    await markOrderFailed(razorpay_order_id, "signature_mismatch");
    return NextResponse.json(
      { error: "We couldn't verify that payment. Nothing has been charged to you." },
      { status: 400 }
    );
  }

  const result = await fulfilOrder({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    via: "callback",
  });

  if (!result.ok) {
    if (result.reason === "order-not-found") {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (result.reason === "content-missing") {
      // Payment is captured and recorded — don't show the buyer an error.
      return NextResponse.json({ ok: true, needsManualEnrolment: true });
    }
    return NextResponse.json({ error: "Could not record the payment." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    alreadyProcessed: result.alreadyProcessed,
    ...(result.alreadyProcessed ? {} : { emailSent: result.emailSent }),
  });
}
