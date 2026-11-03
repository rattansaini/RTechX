import { NextResponse } from "next/server";
import { z } from "zod";
import { fulfilCoachingPayment } from "@/lib/coaching-fulfilment";
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

/** Browser callback. Nothing is written until the HMAC verifies. */
export async function POST(req: Request) {
  const limit = rateLimit(`coaching-verify:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
  if (!limit.ok) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });

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

  if (
    !verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })
  ) {
    console.error("[coaching verify] SIGNATURE MISMATCH for order", razorpay_order_id);
    return NextResponse.json(
      { error: "We couldn't verify that payment. Nothing has been charged to you." },
      { status: 400 }
    );
  }

  const result = await fulfilCoachingPayment({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    via: "callback",
  });
  if (!result.ok) {
    const status = result.reason === "not-found" ? 404 : 500;
    return NextResponse.json({ error: "Could not record the payment." }, { status });
  }

  return NextResponse.json({ ok: true, ref: result.id, alreadyProcessed: result.alreadyProcessed });
}
