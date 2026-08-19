import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDraft, updateDraft } from "@/lib/social/storage";
import { publishBoth } from "@/lib/social/publish";
import { sendPublishResult, sendAlert } from "@/lib/social/telegram";

export const runtime = "nodejs";
export const maxDuration = 300; // reel containers can take a few minutes

export async function POST(req: NextRequest) {
  // Telegram echoes this header back from setWebhook. Without it, anyone who
  // learns the URL can trigger a publish.
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const update = await req.json();
  const cb = update.callback_query;
  if (!cb) return NextResponse.json({ ok: true }); // ignore non-button updates

  // The header above proves the request came from Telegram. It does not prove
  // it came from Rattan — anyone who can reach the bot and sees an approval
  // message could otherwise tap Approve and publish to the brand's accounts.
  // The button is the only thing standing between a draft and the public feed,
  // so it must answer to exactly one chat.
  const allowedChat = process.env.TELEGRAM_CHAT_ID;
  const fromChat = String(cb.message?.chat?.id ?? cb.from?.id ?? "");
  if (!allowedChat || fromChat !== String(allowedChat)) {
    console.error(`[telegram] approval attempt from unexpected chat ${fromChat}`);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [action, draftId] = String(cb.data ?? "").split(":");
  await answerCallback(cb.id, action === "approve" ? "Publishing…" : "Rejected");

  const draft = await getDraft(draftId);
  if (!draft) {
    await sendAlert(`❌ Draft <code>${draftId}</code> not found.`);
    return NextResponse.json({ ok: true });
  }

  if (draft.status === "published") {
    await sendAlert(`⚠️ That draft is already published — ignoring the second tap.`);
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    await updateDraft(draftId, { status: "rejected" });
    await sendAlert(`🚫 Rejected. Nothing published for ${draft.scheduled_for}.`);
    return NextResponse.json({ ok: true });
  }

  if (action !== "approve") return NextResponse.json({ ok: true });

  if (!draft.media_url) {
    await sendAlert(
      `⚠️ No media attached to this draft, so there is nothing to publish.\n` +
        `Reel scripts need a rendered video first.`
    );
    return NextResponse.json({ ok: true });
  }

  // Mark approved before publishing so a timeout can't be re-approved into a
  // duplicate post.
  await updateDraft(draftId, { status: "approved" });

  const result = await publishBoth(draft.content, draft.media_url);
  const anyOk = result.instagram.ok || result.facebook.ok;

  await updateDraft(draftId, {
    status: anyOk ? "published" : "failed",
    ig_post_id: result.instagram.id ?? null,
    fb_post_id: result.facebook.id ?? null,
    error: [result.instagram.error, result.facebook.error].filter(Boolean).join(" | ") || null,
  });

  await sendPublishResult(draft, result);
  return NextResponse.json({ ok: true });
}

async function answerCallback(id: string, text: string) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ callback_query_id: id, text }),
  }).catch(() => undefined);
}
