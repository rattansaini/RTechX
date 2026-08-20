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

export type ResourceKey = "boolean-cheatsheet" | "resume-playbook" | "field-kit";

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
    name: "The Boolean cheat-sheet",
    // The PDF is committed at this path, so the default is the file itself
    // rather than null. The env var stays as an override for the day this
    // moves to a CDN — but the site no longer depends on someone remembering
    // to set a variable in the Netlify dashboard before the promise on
    // /free-resources becomes true.
    url:
      process.env.NEXT_PUBLIC_BOOLEAN_CHEATSHEET_URL ||
      "/resources/rtechx-boolean-cheat-sheet.pdf",
  },

  /**
   * These two were student-only bonuses until Rattan decided on 20 Aug 2026 to
   * give them away. That decision is not reversible in practice: once a PDF is
   * on a public URL it is copied, forwarded and re-hosted, so pulling the file
   * later removes the link, not the file.
   *
   * The trade is deliberate — they are the strongest proof of the teaching
   * quality this brand has, and a recruiter who runs one of these strings and
   * gets a good shortlist is a warmer lead than any ad. The 63-page handbook
   * stays paid; that is where the course value now sits.
   */
  "resume-playbook": {
    key: "resume-playbook",
    source: "resume-playbook",
    name: "The Resume Playbook",
    url: "/resources/rtechx-resume-playbook.pdf",
  },

  "field-kit": {
    key: "field-kit",
    source: "field-kit",
    name: "The Boolean & Intake Field Kit",
    url: "/resources/rtechx-boolean-intake-field-kit.pdf",
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
