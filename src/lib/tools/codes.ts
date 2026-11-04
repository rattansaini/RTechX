import "server-only";
import crypto from "node:crypto";

/** sha256(code:email). The code itself is never stored. */
export function hashCode(code: string, email: string) {
  return crypto.createHash("sha256").update(`${code}:${email}`).digest("hex");
}
