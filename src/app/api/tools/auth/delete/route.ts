import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { SESSION_COOKIE, sessionCookieOptions, userIdFromRequest } from "@/lib/tools/session";

export const runtime = "nodejs";

/** Deletes the signed-in user's account, usage log and any login codes. */
export async function POST(req: Request) {
  const userId = userIdFromRequest(req);
  if (!userId || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "You're not signed in." }, { status: 401 });
  }
  const db = supabaseAdmin();
  const { data: user } = await db.from("tool_users").select("email").eq("id", userId).maybeSingle();
  if (user?.email) await db.from("tool_login_codes").delete().eq("email", user.email);
  // tool_usage rows go with the user (on delete cascade).
  const { error } = await db.from("tool_users").delete().eq("id", userId);
  if (error) {
    console.error("[tools delete] failed:", error);
    return NextResponse.json({ error: "Couldn't delete your account. Email hello@rtechx.com." }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
