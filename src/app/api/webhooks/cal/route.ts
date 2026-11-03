import { NextResponse } from "next/server";
import { verifyCalSignature } from "@/lib/cal";
import { isSecondBooking } from "@/lib/coaching";
import {
  sendCoachingBookedNotice,
  sendSecondBookingWarning,
  sendUnpaidBookingWarning,
} from "@/lib/coaching-email";
import type { CoachingRow } from "@/lib/coaching-fulfilment";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cal.com webhook. Subscribe to BOOKING_CREATED, BOOKING_RESCHEDULED and
 * BOOKING_CANCELLED, URL https://www.rtechx.com/api/webhooks/cal, and put the
 * same secret in CAL_WEBHOOK_SECRET.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type CalPayload = {
  triggerEvent?: string;
  payload?: {
    uid?: string;
    rescheduleUid?: string;
    startTime?: string;
    metadata?: Record<string, unknown> | null;
    attendees?: { name?: string; email?: string }[];
  };
};

export async function POST(req: Request) {
  if (!process.env.CAL_WEBHOOK_SECRET) {
    console.error("[cal-webhook] CAL_WEBHOOK_SECRET unset — rejecting");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-cal-signature-256") ?? "";
  if (!verifyCalSignature(rawBody, signature)) {
    console.error("[cal-webhook] SIGNATURE MISMATCH — ignoring");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: CalPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const trigger = event.triggerEvent;
  const p = event.payload;
  if (
    !p?.uid ||
    !trigger ||
    !["BOOKING_CREATED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED"].includes(trigger)
  ) {
    return NextResponse.json({ ok: true, ignored: trigger ?? "unknown" });
  }

  const db = supabaseAdmin();
  const attendee = p.attendees?.[0];
  const attendeeEmail = attendee?.email?.trim().toLowerCase() ?? "";
  const ref = typeof p.metadata?.ref === "string" ? p.metadata.ref : "";

  // 1. metadata.ref   2. an earlier booking uid (reschedule/cancel)
  // 3. fallback: attendee email + latest paid row.
  let row: CoachingRow | null = null;
  if (UUID.test(ref)) {
    const { data } = await db.from("coaching_calls").select("*").eq("id", ref).maybeSingle();
    row = data as CoachingRow | null;
  }
  if (!row) {
    const uids = [p.uid, p.rescheduleUid].filter((u): u is string => !!u);
    const { data } = await db
      .from("coaching_calls")
      .select("*")
      .in("cal_booking_uid", uids)
      .order("created_at", { ascending: false })
      .limit(1);
    row = (data?.[0] as CoachingRow | undefined) ?? null;
  }
  if (!row && attendeeEmail) {
    const { data } = await db
      .from("coaching_calls")
      .select("*")
      .ilike("email", attendeeEmail)
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false })
      .limit(1);
    row = (data?.[0] as CoachingRow | undefined) ?? null;
  }

  const isCancel = trigger === "BOOKING_CANCELLED";

  if (!row || row.payment_status !== "paid") {
    // Cancelling something we never had is not worth an alert.
    if (!isCancel) {
      await sendUnpaidBookingWarning({
        attendeeName: attendee?.name ?? "(unknown)",
        attendeeEmail: attendeeEmail || "(unknown)",
        startTime: p.startTime ?? null,
        bookingUid: p.uid,
        detail: row
          ? "The matching row is not marked paid."
          : "No coaching row matched this booking.",
      });
    }
    return NextResponse.json({ ok: true, matched: false });
  }

  if (isCancel) {
    // A reschedule replaces the uid; a late cancel of the OLD uid must not
    // wipe the new booking.
    if (row.cal_booking_uid && row.cal_booking_uid !== p.uid) {
      return NextResponse.json({ ok: true, ignored: "stale-cancel" });
    }
    await db.from("coaching_calls").update({ call_status: "cancelled" }).eq("id", row.id);
    return NextResponse.json({ ok: true });
  }

  // Idempotent: a retry of the same event writes the same values and sends no second email.
  if (row.cal_booking_uid === p.uid && row.call_status === "booked") {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  // One payment, one call: a separate new booking must not overwrite the
  // booking already on this row. Keep the first and tell Rattan.
  if (isSecondBooking(row, trigger, p.uid)) {
    await sendSecondBookingWarning({
      name: row.full_name,
      email: row.email,
      firstStart: row.call_start_at,
      secondStart: p.startTime ?? null,
      firstUid: row.cal_booking_uid ?? "",
      secondUid: p.uid,
    });
    return NextResponse.json({ ok: true, ignored: "second-booking" });
  }

  const { error } = await db
    .from("coaching_calls")
    .update({
      cal_booking_uid: p.uid,
      call_start_at: p.startTime ?? null,
      call_status: "booked",
    })
    .eq("id", row.id);
  if (error) {
    console.error("[cal-webhook] update failed", error);
    // 500 so Cal.com retries.
    return NextResponse.json({ error: "Could not record booking." }, { status: 500 });
  }

  if (p.startTime) {
    await sendCoachingBookedNotice({
      row,
      startTime: p.startTime,
      rescheduled: trigger === "BOOKING_RESCHEDULED",
    });
  }
  return NextResponse.json({ ok: true });
}
