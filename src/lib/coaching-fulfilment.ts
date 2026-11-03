import "server-only";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Turning a verified coaching payment into a 'paid' row.
 *
 * Shared by /api/coaching/verify (browser callback) and the Razorpay webhook,
 * both of which can fire for the same payment. The update is a single
 * conditional statement (`payment_status <> 'paid'`), so exactly one caller
 * "wins" and gets the row back; the other sees alreadyProcessed. Anything
 * that must happen once (emails) hangs off the winner.
 */

export type CoachingRow = {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  occupation: string;
  tracks: string[];
  goal: string;
  amount_paise: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_status: "created" | "paid" | "failed" | "refunded";
  cal_booking_uid: string | null;
  call_start_at: string | null;
  call_status: string | null;
};

export type CoachingFulfilResult =
  | { ok: true; alreadyProcessed: true; id: string }
  | { ok: true; alreadyProcessed: false; id: string; row: CoachingRow }
  | { ok: false; reason: "not-found" | "update-failed" };

export async function fulfilCoachingPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  via: "callback" | "webhook";
}): Promise<CoachingFulfilResult> {
  const db = supabaseAdmin();

  const { data: existing, error: fetchError } = await db
    .from("coaching_calls")
    .select("id, payment_status")
    .eq("razorpay_order_id", input.razorpayOrderId)
    .maybeSingle();

  if (fetchError || !existing) {
    console.error(`[coaching:${input.via}] row not found`, input.razorpayOrderId);
    return { ok: false, reason: "not-found" };
  }
  if (existing.payment_status === "paid") {
    return { ok: true, alreadyProcessed: true, id: existing.id };
  }

  const { data: won, error } = await db
    .from("coaching_calls")
    .update({ payment_status: "paid", razorpay_payment_id: input.razorpayPaymentId })
    .eq("razorpay_order_id", input.razorpayOrderId)
    .neq("payment_status", "paid")
    .select("*");

  if (error) {
    console.error(`[coaching:${input.via}] update failed`, error);
    return { ok: false, reason: "update-failed" };
  }
  if (!won || won.length === 0) {
    // The other path got there between our read and write.
    return { ok: true, alreadyProcessed: true, id: existing.id };
  }

  return { ok: true, alreadyProcessed: false, id: existing.id, row: won[0] as CoachingRow };
}

/** Records a failed payment without touching a row that already succeeded. */
export async function markCoachingFailed(razorpayOrderId: string) {
  await supabaseAdmin()
    .from("coaching_calls")
    .update({ payment_status: "failed" })
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("payment_status", "created");
}
