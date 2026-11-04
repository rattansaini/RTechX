import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { EMAIL_RE } from "@/lib/coaching";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { hashCode } from "@/lib/tools/codes";
import { sendToolsLoginCode } from "@/lib/tools/email";

export const runtime = "nodejs";

const bodySchema = z
  .object({
    email: z.string().trim().max(254).regex(EMAIL_RE, "Please enter a valid email address."),
    consent: z.literal(true, { message: "Please tick the box to continue." }),
    company: z.string().max(0).optional(), // honeypot
  })
  .strict();

export async function POST(req: Request) {
  const limit = rateLimit(`tools-code:${clientIp(req)}`, { limit: 6, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Sign-in isn't available right now." }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your email address." },
      { status: 400 }
    );
  }
  if (parsed.data.company) return NextResponse.json({ ok: true });

  const email = parsed.data.email.toLowerCase();
  const db = supabaseAdmin();

  // At most 5 codes per email per hour — stops the form being used to spam someone.
  const hourAgo = new Date(Date.now() - 3600e3).toISOString();
  const { count } = await db
    .from("tool_login_codes")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", hourAgo);
  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { error: "Too many codes sent to this email. Please try again in an hour." },
      { status: 429 }
    );
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const { error } = await db.from("tool_login_codes").insert({
    email,
    code_hash: hashCode(code, email),
    expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
  });
  if (error) {
    console.error("[tools request-code] insert failed:", error);
    return NextResponse.json({ error: "Couldn't send a code. Please try again." }, { status: 500 });
  }

  const sent = await sendToolsLoginCode(email, code);
  if (!sent.ok) {
    return NextResponse.json({ error: "Couldn't send the email. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
