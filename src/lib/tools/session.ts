import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { TOOLS_DAILY_LIMIT } from "@/content/tools";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

/**
 * Toolkit sign-in: a signed, httpOnly cookie holding the user id.
 *
 * The signing key is TOOLS_SESSION_SECRET when set, otherwise derived from the
 * Supabase service-role key (server-only, never sent to the browser), so the
 * toolkit works without a new secret being added by hand. Setting
 * TOOLS_SESSION_SECRET later signs everyone out once, which is harmless.
 */

export const SESSION_COOKIE = "rtx_tools";
const SESSION_DAYS = 30;

function secret(): string | null {
  const own = process.env.TOOLS_SESSION_SECRET;
  if (own && own.length >= 32) return own;
  const base = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base) return null;
  return crypto.createHash("sha256").update(`rtechx-tools-session:${base}`).digest("hex");
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");

export function signSession(userId: string, now = Date.now(), key = secret()): string | null {
  if (!key) return null;
  const payload = b64(JSON.stringify({ u: userId, e: now + SESSION_DAYS * 864e5 }));
  const sig = crypto.createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined, now = Date.now(), key = secret()): string | null {
  if (!token || !key) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", key).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(unb64(payload)) as { u?: unknown; e?: unknown };
    if (typeof data.u !== "string" || typeof data.e !== "number" || data.e < now) return null;
    return data.u;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

export type ToolUser = {
  id: string;
  email: string;
  trialEndsAt: string;
  accessUntil: string | null;
};

export type ToolAccess =
  | { state: "signed-out" }
  | { state: "expired"; user: ToolUser; endedAt: string }
  | { state: "active"; user: ToolUser; endsAt: string; daysLeft: number; usedToday: number; dailyLimit: number };

/** Start of today in India, as an ISO timestamp. */
export function startOfTodayIST(now = Date.now()): string {
  const ist = new Date(now + 5.5 * 3600e3);
  const midnightIstUtc = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - 5.5 * 3600e3;
  return new Date(midnightIstUtc).toISOString();
}

export function accessEnd(user: { trialEndsAt: string; accessUntil: string | null }): string {
  if (user.accessUntil && Date.parse(user.accessUntil) > Date.parse(user.trialEndsAt)) return user.accessUntil;
  return user.trialEndsAt;
}

export async function usedToday(userId: string): Promise<number> {
  const { data } = await supabaseAdmin()
    .from("tool_usage")
    .select("units")
    .eq("user_id", userId)
    .gte("created_at", startOfTodayIST());
  return (data ?? []).reduce((sum, r: { units: number }) => sum + (r.units ?? 0), 0);
}

export async function getUserById(id: string): Promise<ToolUser | null> {
  const { data } = await supabaseAdmin()
    .from("tool_users")
    .select("id, email, trial_ends_at, access_until")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    email: data.email,
    trialEndsAt: data.trial_ends_at,
    accessUntil: data.access_until,
  };
}

export async function accessFor(userId: string | null): Promise<ToolAccess> {
  if (!userId || !isSupabaseConfigured()) return { state: "signed-out" };
  const user = await getUserById(userId);
  if (!user) return { state: "signed-out" };
  const end = accessEnd(user);
  const msLeft = Date.parse(end) - Date.now();
  if (msLeft <= 0) return { state: "expired", user, endedAt: end };
  return {
    state: "active",
    user,
    endsAt: end,
    daysLeft: Math.max(1, Math.ceil(msLeft / 864e5)),
    usedToday: await usedToday(user.id),
    dailyLimit: TOOLS_DAILY_LIMIT,
  };
}

/** For server components: reads the cookie of the current request. */
export async function currentAccess(): Promise<ToolAccess> {
  const store = await cookies();
  return accessFor(verifySession(store.get(SESSION_COOKIE)?.value));
}

/** For route handlers: reads the cookie off the raw request. */
export function userIdFromRequest(req: Request): string | null {
  const header = req.headers.get("cookie") ?? "";
  const match = header.split(/;\s*/).find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return verifySession(match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : undefined);
}
