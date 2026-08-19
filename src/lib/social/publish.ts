import type { GeneratedContent, PublishResult } from "./types";

const GRAPH = "https://graph.facebook.com/v21.0";

const IG_USER_ID = process.env.IG_USER_ID!; // 28025727383715073
const FB_PAGE_ID = process.env.FB_PAGE_ID!; // 113968248289422

function token(): string {
  const t = process.env.META_PAGE_ACCESS_TOKEN;
  if (!t) throw new Error("META_PAGE_ACCESS_TOKEN is not set");
  return t;
}

async function graph(
  path: string,
  params: Record<string, string>,
  method: "GET" | "POST" = "POST"
): Promise<Record<string, unknown>> {
  const body = new URLSearchParams({ ...params, access_token: token() });
  const url = method === "GET" ? `${GRAPH}${path}?${body}` : `${GRAPH}${path}`;

  const res = await fetch(url, {
    method,
    ...(method === "POST" ? { body } : {}),
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    const e = json.error ?? {};
    throw new Error(`Graph ${path} failed: ${e.message ?? res.status} (code ${e.code ?? "?"})`);
  }
  return json;
}

/** Full caption = body + blank line + hashtags. Hashtags stay separate, never inline. */
function buildCaption(body: string, hashtags: string): string {
  return `${body.trim()}\n\n${hashtags.trim()}`;
}

/* ------------------------------------------------------------------ */
/* Instagram — always create a container first, then publish it.        */
/* The container is private until published, which is what makes the    */
/* approval gate safe: nothing is public until the publish step runs.    */
/* ------------------------------------------------------------------ */

export async function createIgStillContainer(
  content: GeneratedContent,
  imageUrl: string
): Promise<string> {
  const res = await graph(`/${IG_USER_ID}/media`, {
    image_url: imageUrl,
    caption: buildCaption(content.caption_instagram, content.hashtags),
    alt_text: content.alt_text ?? "",
  });
  return String(res.id);
}

export async function createIgReelContainer(
  content: GeneratedContent,
  videoUrl: string,
  coverUrl?: string
): Promise<string> {
  const res = await graph(`/${IG_USER_ID}/media`, {
    media_type: "REELS",
    video_url: videoUrl,
    caption: buildCaption(content.caption_instagram, content.hashtags),
    share_to_feed: "true",
    ...(coverUrl ? { cover_url: coverUrl } : {}),
  });
  return String(res.id);
}

/**
 * Video containers process asynchronously. Publishing before the container
 * reports FINISHED throws a confusing Graph error, so poll first.
 */
export async function waitForContainer(
  creationId: string,
  timeoutMs = 180_000
): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const res = await graph(`/${creationId}`, { fields: "status_code,status" }, "GET");
    const status = String(res.status_code ?? "");

    if (status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED") {
      throw new Error(`Container ${creationId} ended in state ${status}: ${res.status ?? ""}`);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`Container ${creationId} did not finish within ${timeoutMs / 1000}s`);
}

export async function publishIgContainer(creationId: string): Promise<string> {
  const res = await graph(`/${IG_USER_ID}/media_publish`, { creation_id: creationId });
  return String(res.id);
}

/* ------------------------------------------------------------------ */
/* Facebook Page                                                        */
/* ------------------------------------------------------------------ */

export async function postFbPhoto(content: GeneratedContent, imageUrl: string): Promise<string> {
  const res = await graph(`/${FB_PAGE_ID}/photos`, {
    url: imageUrl,
    caption: buildCaption(content.caption_facebook, content.hashtags),
    published: "true",
  });
  return String(res.post_id ?? res.id);
}

export async function postFbVideo(content: GeneratedContent, videoUrl: string): Promise<string> {
  const res = await graph(`/${FB_PAGE_ID}/videos`, {
    file_url: videoUrl,
    description: buildCaption(content.caption_facebook, content.hashtags),
  });
  return String(res.id);
}

/* ------------------------------------------------------------------ */
/* Orchestration                                                        */
/* ------------------------------------------------------------------ */

/**
 * Publishes to both platforms. Each is reported independently — a partial
 * success must never be summarised as "published", because knowing which
 * half went live is the difference between a quick fix and a duplicate post.
 */
export async function publishBoth(
  content: GeneratedContent,
  mediaUrl: string,
  coverUrl?: string
): Promise<PublishResult> {
  const result: PublishResult = {
    instagram: { ok: false },
    facebook: { ok: false },
  };

  try {
    const creationId =
      content.format === "reel"
        ? await createIgReelContainer(content, mediaUrl, coverUrl)
        : await createIgStillContainer(content, mediaUrl);

    if (content.format === "reel") await waitForContainer(creationId);

    result.instagram = { ok: true, id: await publishIgContainer(creationId) };
  } catch (err) {
    result.instagram = { ok: false, error: (err as Error).message };
  }

  try {
    const id =
      content.format === "reel"
        ? await postFbVideo(content, mediaUrl)
        : await postFbPhoto(content, mediaUrl);
    result.facebook = { ok: true, id };
  } catch (err) {
    result.facebook = { ok: false, error: (err as Error).message };
  }

  return result;
}
