import "server-only";
import crypto from "node:crypto";

/**
 * Razorpay helpers.
 *
 * Uses the REST API directly rather than the SDK — order creation is one POST
 * and signature verification is one HMAC, and this keeps the trust boundary
 * visible in the code you're reading.
 */

const API = "https://api.razorpay.com/v1";

export function isRazorpayConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
}

export function razorpayMode(): "test" | "live" | "unset" {
  const id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  if (id.startsWith("rzp_test_")) return "test";
  if (id.startsWith("rzp_live_")) return "live";
  return "unset";
}

function authHeader() {
  const id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new Error("Razorpay is not configured.");
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
};

/** `amountPaise` is in paise. Razorpay rejects anything below 100 (₹1). */
export async function createRazorpayOrder(input: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { authorization: authHeader(), "content-type": "application/json" },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt.slice(0, 40), // Razorpay caps receipt length
      notes: input.notes ?? {},
    }),
    cache: "no-store",
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(
      `Razorpay order creation failed: ${body?.error?.description ?? res.status}`
    );
  }
  return body as RazorpayOrder;
}

/**
 * The single most important function in the checkout.
 *
 * Razorpay's browser callback is attacker-controllable — anyone can POST a
 * fabricated payment id to our verify endpoint. The only thing that proves a
 * payment is real is this HMAC, computed with the key secret that never leaves
 * the server. Compared with `timingSafeEqual` so the check can't be narrowed
 * by measuring response times.
 */
export function verifyPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(input.signature ?? "", "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Same construction, different payload — used by the Razorpay webhook. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature ?? "", "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
