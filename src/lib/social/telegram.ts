import type { DraftRecord, GeneratedContent, PublishResult } from "./types";

const API = "https://api.telegram.org";

function cfg() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) throw new Error("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set");
  return { botToken, chatId };
}

async function call(method: string, payload: Record<string, unknown>) {
  const { botToken } = cfg();
  const res = await fetch(`${API}/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram ${method} failed: ${JSON.stringify(json)}`);
  return json.result;
}

export async function sendAlert(text: string) {
  const { chatId } = cfg();
  return call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

/** Preview with Approve / Reject buttons. Nothing is public at this point. */
export async function sendApprovalRequest(draft: DraftRecord) {
  const { chatId } = cfg();
  const c = draft.content;

  const caption = [
    `<b>${escapeHtml(c.angle)}</b>`,
    `${draft.format === "reel" ? "🎬 Reel" : "🖼 Still"} · ${draft.scheduled_for}`,
    "",
    escapeHtml(truncate(c.caption_instagram, 600)),
    "",
    `<i>${escapeHtml(c.hashtags)}</i>`,
    "",
    `<code>${escapeHtml(c.source_line)}</code>`,
  ].join("\n");

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Approve & publish", callback_data: `approve:${draft.id}` },
        { text: "❌ Reject", callback_data: `reject:${draft.id}` },
      ],
      ...(draft.media_url ? [[{ text: "⬇️ Download media", url: draft.media_url }]] : []),
    ],
  };

  if (draft.media_url && draft.format === "still") {
    return call("sendPhoto", {
      chat_id: chatId,
      photo: draft.media_url,
      caption,
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  }

  if (draft.media_url && draft.format === "reel") {
    return call("sendVideo", {
      chat_id: chatId,
      video: draft.media_url,
      caption,
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  }

  return call("sendMessage", {
    chat_id: chatId,
    text: caption,
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

/** Unsourced or rule-breaking drafts land here instead of the approval queue. */
export async function sendFlagged(draft: DraftRecord, reason: string) {
  const c = draft.content;
  return sendAlert(
    [
      `⚠️ <b>Draft flagged — not queued for publishing</b>`,
      `${draft.scheduled_for} · ${draft.format}`,
      "",
      `<b>Reason:</b> ${escapeHtml(reason)}`,
      "",
      `<b>Angle:</b> ${escapeHtml(c.angle)}`,
      `<b>Headline:</b> ${escapeHtml(c.headline)}`,
      "",
      escapeHtml(truncate(c.caption_instagram, 700)),
      "",
      `Nothing was published. Edit manually or skip today.`,
    ].join("\n")
  );
}

/** Reports each platform separately. Partial success is stated, never glossed. */
export async function sendPublishResult(draft: DraftRecord, result: PublishResult) {
  const ig = result.instagram.ok
    ? `✅ Instagram — live (id ${result.instagram.id})`
    : `❌ Instagram — failed: ${escapeHtml(result.instagram.error ?? "unknown")}`;

  const fb = result.facebook.ok
    ? `✅ Facebook — live (id ${result.facebook.id})`
    : `❌ Facebook — failed: ${escapeHtml(result.facebook.error ?? "unknown")}`;

  const both = result.instagram.ok && result.facebook.ok;
  const neither = !result.instagram.ok && !result.facebook.ok;

  const header = both
    ? "✅ <b>Published to both accounts</b>"
    : neither
    ? "❌ <b>Publishing failed on both accounts</b>"
    : "⚠️ <b>Partially published — one platform is live, one is not</b>";

  const label = `${escapeHtml(draft.content.angle)} · ${draft.scheduled_for} · ${draft.format}`;
  return sendAlert([header, label, "", ig, fb].join("\n"));
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
