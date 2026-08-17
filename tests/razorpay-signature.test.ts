import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";

/**
 * Payment signature verification.
 *
 * This is the single most security-sensitive function on the site: it is the
 * only thing standing between "Razorpay says this was paid" and someone POSTing
 * a made-up payment id to /api/checkout/verify and enrolling for free. It runs
 * on every purchase and is never exercised by hand, which is exactly the shape
 * of code that breaks quietly.
 */

const KEY_SECRET = "test_secret_do_not_use_anywhere_real";

function sign(payload: string, secret = KEY_SECRET) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

async function loadVerifier() {
  const mod = await import("@/lib/razorpay");
  return mod;
}

describe("verifyPaymentSignature", () => {
  beforeEach(() => {
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = "rzp_test_dummy";
  });

  it("accepts a signature Razorpay would actually have produced", async () => {
    const { verifyPaymentSignature } = await loadVerifier();
    const orderId = "order_ABC123";
    const paymentId = "pay_XYZ789";

    expect(
      verifyPaymentSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        signature: sign(`${orderId}|${paymentId}`),
      })
    ).toBe(true);
  });

  it("rejects a payment id swapped after signing", async () => {
    const { verifyPaymentSignature } = await loadVerifier();
    const orderId = "order_ABC123";
    const signature = sign(`${orderId}|pay_REAL`);

    expect(
      verifyPaymentSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: "pay_FORGED",
        signature: signature,
      })
    ).toBe(false);
  });

  it("rejects a signature made with a different secret", async () => {
    const { verifyPaymentSignature } = await loadVerifier();
    const orderId = "order_ABC123";
    const paymentId = "pay_XYZ789";

    expect(
      verifyPaymentSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        signature: sign(`${orderId}|${paymentId}`, "some_other_secret"),
      })
    ).toBe(false);
  });

  it("rejects junk without throwing", async () => {
    const { verifyPaymentSignature } = await loadVerifier();
    // timingSafeEqual throws on length mismatch if it is not guarded — a throw
    // here would surface as a 500 rather than a clean rejection.
    for (const bad of ["", "nonsense", "a".repeat(63), "z".repeat(64)]) {
      expect(() =>
        verifyPaymentSignature({
          razorpayOrderId: "order_ABC123",
          razorpayPaymentId: "pay_XYZ789",
          signature: bad,
        })
      ).not.toThrow();
      expect(
        verifyPaymentSignature({
          razorpayOrderId: "order_ABC123",
          razorpayPaymentId: "pay_XYZ789",
          signature: bad,
        })
      ).toBe(false);
    }
  });
});
