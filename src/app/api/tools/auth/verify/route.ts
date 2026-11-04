import { NextResponse } from "next/server";
import { z } from "zod";
import { TOOLS_TRIAL_DAYS } from "@/content/tools";
import { EMAIL_RE } from "@/lib/coaching";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { hashCode } from "@/lib/tools/codes";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/tools/session";

export const runtime = "nodejs";

const bodySchema = z
  .object({
    email: z.string().trim().max(254).regex(EMAIL_RE),
    code: z.string().trim().regex(/^\d{6}$/, "The code is 6 digits."),
  })
  .strict();

const WRONG = "That code didn't work. Check the latest email, or ask for a new code.";

export async function POST(req: Request) {
  const limit = rateLimit(`tools-verify:${clientIp(req)}`, { limit: 15, windowMs: 10 * 60_000 });
  if (!limit.ok) return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Sign-in isn't available right now." }, { status: 503 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? WRONG }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const db = supabaseAdmin();

  // Only the newest unused code for this email counts.
  const { data: row } = await db
    .from("tool_login_codes")
    .select("id, code_hash, expires_at, attempts, used_at")
    .eq("email", email)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row || Date.parse(row.expires_at) < Date.now() || row.attempts >= 5) {
    return NextResponse.json({ error: "This code has expired. Please ask for a new one." }, { status: 400 });
  }
  if (row.code_hash !== hashCode(parsed.data.code, email)) {
    await db.from("tool_login_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
    return NextResponse.json({ error: WRONG }, { status: 400 });
  }
  await db.from("tool_login_codes").update({ used_at: new Date().toISOString() }).eq("id", row.id);

  // First sign-in starts the 7 days; later sign-ins keep the original dates.
  const now = new Date();
  const { data: existing } = await db.from("tool_users").select("id").eq("email", email).maybeSingle();
  let userId: string | undefined = existing?.id;
  if (!userId) {
    const { data: created, error } = await db
      .from("tool_users")
      .insert({
        email,
        consent_at: now.toISOString(),
        trial_started_at: now.toISOString(),
        trial_ends_at: new Date(now.getTime() + TOOLS_TRIAL_DAYS * 864e5).toISOString(),
        last_seen_at: now.toISOString(),
      })
      .select("id")
      .single();
    if (error || !created) {
      console.error("[tools verify] user insert failed:", error);
      return NextResponse.json({ error: "Couldn't sign you in. Please try again." }, { status: 500 });
    }
    userId = created.id as string;
  } else {
    await db.from("tool_users").update({ last_seen_at: now.toISOString() }).eq("id", userId);
  }

  const token = signSession(userId as string);
  if (!token) return NextResponse.json({ error: "Sign-in isn't available right now." }, { status: 503 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
