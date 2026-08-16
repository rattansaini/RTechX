import "server-only";

/**
 * Fire-and-forget automation hook.
 *
 * Every lead and every successful enrolment is POSTed to N8N_WEBHOOK_URL for
 * WhatsApp/CRM follow-up. This must NEVER block or fail a checkout: a broken
 * webhook is an inconvenience, a lost payment is not. All errors are swallowed
 * and logged, and the call is bounded by a timeout so a hanging endpoint can't
 * hold a route handler open.
 */
export async function notifyN8n(
  event: "lead.created" | "enrolment.created" | "order.failed",
  payload: Record<string, unknown>
): Promise<void> {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, sentAt: new Date().toISOString(), data: payload }),
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
  } catch (err) {
    console.error(`[n8n] ${event} webhook failed (ignored):`, err);
  }
}
