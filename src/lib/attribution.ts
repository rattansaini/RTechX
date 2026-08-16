/**
 * Ad attribution capture.
 *
 * Instagram/Meta traffic arrives with UTM and click params on the first URL
 * only — they're gone by the time someone actually converts a few pages later.
 * So we stash them in sessionStorage on first sight and attach them to every
 * lead and order.
 *
 * Deliberately session-scoped, not a persistent cookie: it's attribution for
 * this visit, not cross-session tracking, so it needs no consent banner.
 */

const KEY = "rtx_attribution";

const FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ad_id",
  "campaign_id",
  "adgroup_id",
  "fbclid",
  "gclid",
] as const;

export type Attribution = Partial<Record<(typeof FIELDS)[number], string>> & {
  landing_path?: string;
  referrer?: string;
};

/** Meta leaves its macros unreplaced ("{{campaign.name}}") when misconfigured. */
function isUnresolvedMacro(value: string) {
  return value.includes("{{") || value.includes("}}");
}

export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  const existing = readAttribution();
  const params = new URLSearchParams(window.location.search);

  const fresh: Attribution = {};
  for (const f of FIELDS) {
    const v = params.get(f);
    if (v && !isUnresolvedMacro(v)) fresh[f] = v.slice(0, 200);
  }

  // Only overwrite when this visit actually carries campaign params, so an
  // internal navigation can't wipe the original source.
  if (Object.keys(fresh).length === 0) return existing;

  const record: Attribution = {
    ...fresh,
    landing_path: window.location.pathname,
    referrer: document.referrer ? document.referrer.slice(0, 300) : undefined,
  };

  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    // Private mode or storage disabled — attribution is nice to have, never required.
  }
  return record;
}

export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
