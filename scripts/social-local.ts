/**
 * Run the whole social pipeline from this machine, with no deployment.
 *
 * Why this exists
 * ---------------
 * The approval step needs Telegram to reach us. In production that is a
 * webhook, which needs a public URL, which needs a deploy — and deploying an
 * unproven posting pipeline to a live site just to find out whether it works
 * is the wrong order. Telegram's other mode, long polling, has us ask Telegram
 * for updates instead of Telegram calling us, and that works from a laptop
 * behind any router with nothing exposed.
 *
 * So the same pipeline runs here end to end: write the post, render the card,
 * upload it, ask for approval, wait for the tap, publish. If it works from
 * here it will work deployed, and we deploy once rather than five times.
 *
 * Polling is a testing device, not the production design. Nothing here runs on
 * a schedule and nothing here should end up on the server — a script that only
 * works while a laptop is awake is not an automation.
 *
 *   npm run dev                    (separate terminal — renders the card)
 *   npx tsx scripts/social-local.ts
 *
 * Flags:
 *   --dry        stop after the Telegram preview; never publish
 *   --format=still|reel
 *   --topic="..."  override today's rotation
 */

import fs from "node:fs";
import path from "node:path";

/* ---------------------------------------------------------------- env --- */

// A standalone script gets none of Next's environment loading, and a missing
// value here fails much later and much less clearly, so read it up front.
function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) throw new Error(".env.local not found — run this from the project root");
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (value && !process.env[key]) process.env[key] = value;
  }
}
loadEnv();

const CARD_HOST = process.env.LOCAL_CARD_HOST || "http://localhost:3210";
// The card is rendered locally, but Meta fetches the finished image over the
// internet — so the *stored* URL must be the public Supabase one, never
// localhost. Overriding this is what makes the local render possible without
// also breaking publication.
process.env.NEXT_PUBLIC_SITE_URL = CARD_HOST;

const args = process.argv.slice(2);
const has = (f: string) => args.includes(f);
const arg = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");

const DRY = has("--dry");

/* ------------------------------------------------------------ helpers --- */

const TG = (method: string) =>
  `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

async function telegram(method: string, body: unknown) {
  const res = await fetch(TG(method), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram ${method}: ${json.description}`);
  return json.result;
}

function log(step: string, detail = "") {
  console.log(`  ${step.padEnd(26)}${detail}`);
}

/* --------------------------------------------------------------- main --- */

async function main() {
  console.log("\nRTechX social pipeline — local run\n");

  const { getTodaysSlot } = await import("@/lib/social/schedule");
  const { generateContent } = await import("@/lib/social/generate");
  const { renderAndStoreStill, saveDraft, updateDraft } = await import("@/lib/social/storage");

  // 1 — what are we posting?
  const slot = getTodaysSlot();
  if (!slot && !arg("topic")) {
    console.log("  Nothing scheduled today (weekend). Pass --topic=\"...\" to force one.\n");
    return;
  }
  const format = (arg("format") as "still" | "reel") ?? slot?.format ?? "still";
  const topic = arg("topic") ?? slot!.topic;
  const dateIso = slot?.dateIso ?? new Date().toISOString().slice(0, 10);
  log("slot", `${dateIso} · ${format} · ${topic}`);

  // 2 — write it
  log("writing…");
  const content = await generateContent({
    format,
    topic,
    researchNotes: process.env.RESEARCH_NOTES || undefined,
  });
  log("headline", content.headline);
  log("sourced", String(content.has_verified_source));

  // The gate. An unsourced claim never reaches a render, let alone a feed.
  if (!content.has_verified_source) {
    console.log(`\n  FLAGGED — not publishable: ${content.angle}\n`);
    console.log("  This is the system working. Nothing was rendered or queued.\n");
    return;
  }

  if (format === "reel") {
    console.log("\n  Reel script produced. Reels are not automated — nothing to publish.\n");
    console.log(JSON.stringify(content.reel_beats, null, 2));
    return;
  }

  // 3 — render and store
  log("rendering card…", `via ${CARD_HOST}`);
  const mediaUrl = await renderAndStoreStill(content, `${dateIso}-local-${Date.now()}`);
  log("stored", mediaUrl);

  const draft = await saveDraft({
    scheduled_for: dateIso,
    format: "still",
    status: "pending_approval",
    content,
    media_url: mediaUrl,
  });
  log("draft", draft.id);

  // 4 — ask
  const caption = content.caption_instagram.slice(0, 500);
  await telegram("sendPhoto", {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    photo: mediaUrl,
    caption:
      `<b>${escapeHtml(content.headline)}</b>\n\n` +
      `${escapeHtml(caption)}\n\n` +
      `<i>${escapeHtml(content.source_line ?? "")}</i>\n\n` +
      (DRY ? "— dry run, publishing is disabled —" : "Tap to decide."),
    parse_mode: "HTML",
    reply_markup: DRY
      ? undefined
      : {
          inline_keyboard: [
            [
              { text: "✅ Approve & post", callback_data: `approve:${draft.id}` },
              { text: "🚫 Reject", callback_data: `reject:${draft.id}` },
            ],
          ],
        },
  });
  log("sent to telegram", "check your phone");

  if (DRY) {
    console.log("\n  Dry run — stopping here. Nothing will be published.\n");
    return;
  }

  // 5 — wait for the tap, by asking Telegram rather than being called
  console.log("\n  Waiting for your tap (Ctrl-C to abandon)…\n");
  const decision = await waitForDecision(draft.id);

  if (decision === "reject") {
    await updateDraft(draft.id, { status: "rejected" });
    await telegram("sendMessage", {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: "🚫 Rejected. Nothing was published.",
    });
    console.log("  Rejected. Nothing published.\n");
    return;
  }

  // 6 — publish
  if (!process.env.META_PAGE_ACCESS_TOKEN) {
    await updateDraft(draft.id, { status: "approved" });
    await telegram("sendMessage", {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text:
        "✅ Approved — but no Meta token is configured yet, so nothing was posted.\n\n" +
        "Everything up to publication works. Add META_PAGE_ACCESS_TOKEN and run again.",
    });
    console.log("\n  Approved. No Meta token, so nothing was posted — that is the safe stop.\n");
    return;
  }

  await updateDraft(draft.id, { status: "approved" });
  log("publishing…");
  const { publishBoth } = await import("@/lib/social/publish");
  const result = await publishBoth(content, mediaUrl);

  const ok = result.instagram.ok || result.facebook.ok;
  await updateDraft(draft.id, {
    status: ok ? "published" : "failed",
    ig_post_id: result.instagram.id ?? null,
    fb_post_id: result.facebook.id ?? null,
    error: [result.instagram.error, result.facebook.error].filter(Boolean).join(" | ") || null,
  });

  // Reported separately on purpose: knowing which half went live is the
  // difference between a quick fix and a duplicate post.
  log("instagram", result.instagram.ok ? `posted ${result.instagram.id}` : `FAILED ${result.instagram.error}`);
  log("facebook", result.facebook.ok ? `posted ${result.facebook.id}` : `FAILED ${result.facebook.error}`);

  await telegram("sendMessage", {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text:
      `${ok ? "✅ Published" : "❌ Publish failed"}\n\n` +
      `Instagram: ${result.instagram.ok ? "posted" : result.instagram.error}\n` +
      `Facebook: ${result.facebook.ok ? "posted" : result.facebook.error}`,
  });
  console.log("");
}

/** Long polling: we ask Telegram, so Telegram never has to reach us. */
async function waitForDecision(draftId: string): Promise<"approve" | "reject"> {
  let offset = 0;
  const deadline = Date.now() + 15 * 60 * 1000;

  while (Date.now() < deadline) {
    const res = await fetch(`${TG("getUpdates")}?timeout=30&offset=${offset}`);
    const json = await res.json();
    if (!json.ok) throw new Error(`getUpdates: ${json.description}`);

    for (const update of json.result) {
      offset = update.update_id + 1;
      const cb = update.callback_query;
      if (!cb) continue;

      const [action, id] = String(cb.data ?? "").split(":");
      if (id !== draftId) continue;

      // Same check the deployed webhook makes: the tap has to come from the
      // one chat that is allowed to approve, not merely from Telegram.
      const from = String(cb.message?.chat?.id ?? cb.from?.id ?? "");
      if (from !== String(process.env.TELEGRAM_CHAT_ID)) {
        console.log(`  ignored a tap from an unexpected chat (${from})`);
        continue;
      }

      await fetch(TG("answerCallbackQuery"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          callback_query_id: cb.id,
          text: action === "approve" ? "Publishing…" : "Rejected",
        }),
      });

      if (action === "approve" || action === "reject") return action;
    }
  }
  throw new Error("No decision within 15 minutes — nothing was published.");
}

function escapeHtml(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

main().catch((err) => {
  console.error(`\n  FAILED: ${err.message}\n`);
  process.exit(1);
});
