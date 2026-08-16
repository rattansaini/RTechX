/**
 * Analytics events, consent-gated.
 *
 * Nothing here loads or fires until the visitor has actively accepted. Before
 * that, `track()` is a no-op that returns silently — it is deliberately safe to
 * call from anywhere without checking consent first.
 */

export type AnalyticsEvent =
  | { name: "view_course"; courseSlug: string }
  | { name: "click_join"; courseSlug: string; tierId: string; placement: string }
  | { name: "begin_checkout"; courseSlug: string; tierId: string; valueINR: number }
  | {
      name: "purchase";
      courseSlug: string;
      tierId: string;
      valueINR: number;
      orderId: string;
    }
  | { name: "lead_submit"; source: string }
  | { name: "upgrade_click"; courseSlug: string };

export const CONSENT_KEY = "rtx_consent";
export type ConsentState = "granted" | "denied" | null;

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(state: Exclude<ConsentState, null>) {
  try {
    window.localStorage.setItem(CONSENT_KEY, state);
  } catch {
    /* storage blocked — consent simply won't persist across visits */
  }
  window.dispatchEvent(new CustomEvent("rtx:consent", { detail: state }));
}

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: Fbq;
    dataLayer?: unknown[];
  }
}

/** Meta expects its own vocabulary; everything else maps 1:1. */
const META_EVENT: Partial<Record<AnalyticsEvent["name"], string>> = {
  view_course: "ViewContent",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  lead_submit: "Lead",
};

export function track(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  if (readConsent() !== "granted") return;

  const { name, ...params } = event;

  window.gtag?.("event", name, {
    ...params,
    ...("valueINR" in event ? { value: event.valueINR, currency: "INR" } : {}),
  });

  const metaName = META_EVENT[name];
  if (metaName) {
    // Narrow on `event`, not on the rest object — destructuring strips the
    // discriminant, so `params` is an unnarrowable union.
    const payload: Record<string, unknown> = {};
    if ("valueINR" in event) {
      payload.value = event.valueINR;
      payload.currency = "INR";
    }
    if ("courseSlug" in event) payload.content_name = event.courseSlug;
    else if ("source" in event) payload.content_name = event.source;

    window.fbq?.("track", metaName, payload);
  } else {
    window.fbq?.("trackCustom", name, params);
  }
}
