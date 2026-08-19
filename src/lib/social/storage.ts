import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";
import type { DraftRecord, GeneratedContent, PostFormat, PostStatus } from "./types";

const BUCKET = "social-media";

/**
 * Table access goes through the site's own client, which is scoped to the
 * `rtechx` schema. The version shipped with this package built its own client
 * with no schema set, which defaults to `public` — and `public` in this
 * database belongs to an unrelated Amazon reporting project.
 */
const db = supabaseAdmin;

/**
 * Storage is separate: buckets are not schema-scoped, and the storage client
 * is happiest on a plain client. Same credentials, different surface.
 */
function storageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Renders the stat card and stores the PNG in public Supabase storage.
 *
 * Meta's servers fetch media by URL and will not follow redirects or parse
 * HTML wrappers — they need a URL that returns raw image bytes. Supabase
 * public object URLs do exactly that. (Passing a share/shortlink here is what
 * caused the 19 Aug publish failure.)
 */
export async function renderAndStoreStill(
  content: GeneratedContent,
  slug: string
): Promise<string> {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_SITE_URL is not set");

  const qs = new URLSearchParams({
    eyebrow: content.eyebrow ?? "",
    headline: content.headline ?? "",
    takeaway: content.takeaway ?? "",
    highlight: content.takeaway_highlight ?? "",
    source: content.source_line ?? "",
    a_value: content.stat_primary?.value ?? "",
    a_label: content.stat_primary?.label ?? "",
    a_sub: content.stat_primary?.sub ?? "",
    b_value: content.stat_secondary?.value ?? "",
    b_label: content.stat_secondary?.label ?? "",
    b_sub: content.stat_secondary?.sub ?? "",
  });

  const res = await fetch(`${base}/api/og/stat-card?${qs}`);
  if (!res.ok) throw new Error(`Card render failed: ${res.status}`);
  const bytes = await res.arrayBuffer();

  const path = `${slug}.png`;
  const supabase = storageClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: "image/png", upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function saveDraft(input: {
  scheduled_for: string;
  format: PostFormat;
  status: PostStatus;
  content: GeneratedContent;
  media_url: string | null;
}): Promise<DraftRecord> {
  const { data, error } = await db()
    .from("social_posts")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(`Draft insert failed: ${error.message}`);
  return data as DraftRecord;
}

export async function getDraft(id: string): Promise<DraftRecord | null> {
  const { data, error } = await db()
    .from("social_posts")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Draft fetch failed: ${error.message}`);
  return (data as DraftRecord) ?? null;
}

export async function updateDraft(id: string, patch: Partial<DraftRecord>): Promise<void> {
  const { error } = await db().from("social_posts").update(patch).eq("id", id);
  if (error) throw new Error(`Draft update failed: ${error.message}`);
}

/** Guards against double-posting if a cron run is retried. */
export async function alreadyRanToday(dateIso: string): Promise<boolean> {
  const { data, error } = await db()
    .from("social_posts")
    .select("id")
    .eq("scheduled_for", dateIso)
    .limit(1);
  if (error) throw new Error(`Dedupe check failed: ${error.message}`);
  return (data?.length ?? 0) > 0;
}
