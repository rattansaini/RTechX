export type PostFormat = "still" | "reel";

export type PostStatus =
  | "pending_approval"
  | "flagged_unsourced"
  | "approved"
  | "published"
  | "rejected"
  | "failed";

export interface Stat {
  value: string;
  label: string;
  sub?: string;
}

export interface ReelBeat {
  t: string;
  text: string;
  vo: string;
}

/** Shape Claude must return. Validated before anything renders or publishes. */
export interface GeneratedContent {
  format: PostFormat;
  angle: string;
  eyebrow: string;
  headline: string;
  stat_primary: Stat | null;
  stat_secondary: Stat | null;
  takeaway: string;
  takeaway_highlight: string | null;
  source_line: string;
  has_verified_source: boolean;
  caption_instagram: string;
  caption_facebook: string;
  hashtags: string;
  alt_text: string;
  reel_beats: ReelBeat[];
}

export interface DraftRecord {
  id: string;
  created_at: string;
  scheduled_for: string;
  format: PostFormat;
  status: PostStatus;
  content: GeneratedContent;
  media_url: string | null;
  ig_creation_id: string | null;
  ig_post_id: string | null;
  fb_post_id: string | null;
  error: string | null;
}

export interface PublishResult {
  instagram: { ok: boolean; id?: string; error?: string };
  facebook: { ok: boolean; id?: string; error?: string };
}
