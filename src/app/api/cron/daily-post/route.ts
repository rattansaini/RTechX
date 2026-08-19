import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTodaysSlot } from "@/lib/social/schedule";
import { generateContent } from "@/lib/social/generate";
import { renderAndStoreStill, saveDraft, alreadyRanToday } from "@/lib/social/storage";
import { sendApprovalRequest, sendFlagged, sendAlert } from "@/lib/social/telegram";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // The scheduler sends this header. Without the check, the route is a public
  // trigger anyone could hammer.
  //
  // The missing-secret case is handled separately and first. As shipped, an
  // unset CRON_SECRET made the comparison `auth !== "Bearer undefined"`, so a
  // request literally sending `Authorization: Bearer undefined` would have been
  // let through. An unconfigured trigger must refuse to run, not fall open.
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) {
    console.error("[cron] CRON_SECRET is unset or too short — refusing to run");
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const slot = getTodaysSlot();
  if (!slot) {
    return NextResponse.json({ skipped: true, reason: "no post scheduled today" });
  }

  if (await alreadyRanToday(slot.dateIso)) {
    return NextResponse.json({ skipped: true, reason: "already ran for this date" });
  }

  try {
    const content = await generateContent({
      format: slot.format,
      topic: slot.topic,
      researchNotes: process.env.RESEARCH_NOTES || undefined,
    });

    // The sourcing gate. An unverified statistic never reaches a render or a
    // queue — it goes straight to manual review.
    if (!content.has_verified_source) {
      const draft = await saveDraft({
        scheduled_for: slot.dateIso,
        format: slot.format,
        status: "flagged_unsourced",
        content,
        media_url: null,
      });
      await sendFlagged(draft, "Unverified claim, missing CTA, or banned phrasing");
      return NextResponse.json({ flagged: true, draftId: draft.id });
    }

    // Reels need a video renderer (see lib/social/video.ts). Until that is
    // wired up, reel days produce the script and hand it over for manual work
    // rather than silently posting a still in a Reel slot.
    if (slot.format === "reel") {
      const draft = await saveDraft({
        scheduled_for: slot.dateIso,
        format: "reel",
        status: "pending_approval",
        content,
        media_url: null,
      });
      await sendApprovalRequest(draft);
      return NextResponse.json({ ok: true, draftId: draft.id, note: "reel script only" });
    }

    const slug = `${slot.dateIso}-${slot.theme}`;
    const mediaUrl = await renderAndStoreStill(content, slug);

    const draft = await saveDraft({
      scheduled_for: slot.dateIso,
      format: "still",
      status: "pending_approval",
      content,
      media_url: mediaUrl,
    });

    await sendApprovalRequest(draft);
    return NextResponse.json({ ok: true, draftId: draft.id, mediaUrl });
  } catch (err) {
    const message = (err as Error).message;
    // Fail loudly. A silent cron failure means a missing post nobody notices.
    await sendAlert(`❌ <b>Daily pipeline failed</b>\n${slot.dateIso}\n\n${message}`).catch(
      () => undefined
    );
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
