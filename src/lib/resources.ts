/**
 * Downloadable lead magnets.
 *
 * A resource is "ready" only when its URL is configured. Until then the page
 * copy and the email both say it's coming rather than promising a file that
 * doesn't exist — the same rule the rest of the site follows for empty proof
 * slots.
 *
 * To make the cheat-sheet live: drop the PDF at
 * `public/resources/rtechx-boolean-cheatsheet.pdf` and set
 * NEXT_PUBLIC_BOOLEAN_CHEATSHEET_URL="/resources/rtechx-boolean-cheatsheet.pdf"
 * (or an absolute URL if you host it elsewhere).
 */

export type ResourceKey = "boolean-cheatsheet";

export type Resource = {
  key: ResourceKey;
  /** Matches the `source` sent by the capture form. */
  source: string;
  name: string;
  /** null until the file exists. */
  url: string | null;
};

export const resources: Record<ResourceKey, Resource> = {
  "boolean-cheatsheet": {
    key: "boolean-cheatsheet",
    source: "boolean-cheatsheet",
    name: "The 1-page Boolean cheat-sheet",
    url: process.env.NEXT_PUBLIC_BOOLEAN_CHEATSHEET_URL || null,
  },
};

export function resourceForSource(source: string): Resource | null {
  return (
    Object.values(resources).find((r) => r.source === source) ?? null
  );
}

export function isResourceReady(key: ResourceKey) {
  return Boolean(resources[key].url);
}
