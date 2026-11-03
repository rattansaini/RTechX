import { NextResponse } from "next/server";
import { COACHING_TOTAL_PAISE } from "@/content/coaching";
import { coachingBookingSchema, normaliseMobile } from "@/lib/coaching";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limit = rateLimit(`coaching-order:${clientIp(req)}`, { limit: 8, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } }
    );
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Payments aren't switched on yet. Please email us and we'll arrange your call." },
      { status: 503 }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = coachingBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the details you entered." },
      { status: 400 }
    );
  }
  const input = parsed.data;
  if (input.company) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const db = supabaseAdmin();
  const email = input.email.toLowerCase();
  const mobile = normaliseMobile(input.mobile);

  // Row first: without it a later payment could not be reconciled.
  const { data: row, error: insertError } = await db
    .from("coaching_calls")
    .insert({
      full_name: input.fullName,
      email,
      mobile,
      occupation: input.occupation,
      tracks: input.tracks,
      goal: input.goal,
      consent_at: new Date().toISOString(),
      amount_paise: COACHING_TOTAL_PAISE, // never from the client
      payment_status: "created",
    })
    .select("id")
    .single();

  if (insertError || !row) {
    console.error("[coaching create-order] insert failed:", insertError);
    return NextResponse.json({ error: "Couldn't start the payment. Please try again." }, { status: 500 });
  }

  let order;
  try {
    order = await createRazorpayOrder({
      amountPaise: COACHING_TOTAL_PAISE,
      receipt: `coach_${row.id.slice(0, 8)}_${Date.now().toString(36)}`,
      notes: { product: "coaching", ref: row.id, email },
    });
  } catch (err) {
    console.error("[coaching create-order] razorpay failed:", err);
    await db.from("coaching_calls").delete().eq("id", row.id);
    return NextResponse.json({ error: "Couldn't start the payment. Please try again." }, { status: 502 });
  }

  const { error: updateError } = await db
    .from("coaching_calls")
    .update({ razorpay_order_id: order.id })
    .eq("id", row.id);
  if (updateError) {
    // Unreconcilable if we proceed; stop before the customer is charged.
    console.error("[coaching create-order] order id store failed:", updateError);
    await db.from("coaching_calls").delete().eq("id", row.id);
    return NextResponse.json({ error: "Couldn't start the payment. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    ref: row.id,
    razorpayOrderId: order.id,
    amountPaise: COACHING_TOTAL_PAISE,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    prefill: { name: input.fullName, email, contact: mobile },
  });
}
