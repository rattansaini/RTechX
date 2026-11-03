import "server-only";
import crypto from "node:crypto";

/**
 * Cal.com signs the raw body with HMAC-SHA256 using the webhook secret and
 * sends the hex digest in `x-cal-signature-256`.
 */
export function verifyCalSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature ?? "", "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
