/**
 * Single source of truth for brand-level facts.
 *
 * Everything here was supplied by the client. Nothing in this file may be
 * invented — if a value is unknown it stays `null` and the components that
 * consume it render nothing rather than guessing.
 */

export const site = {
  name: "RTechX",
  tagline: "Understand Tech. Find Talent. Build Careers.",
  url: "https://www.rtechx.com",
  supportEmail: "hello@rtechx.com",

  /** E.164 for wa.me links, plus the display form. */
  whatsapp: {
    e164: "919971433312",
    display: "+91 99714 33312",
  },

  /** Not yet published — the footer skips any social whose href is null. */
  socials: {
    linkedin: null as string | null,
    instagram: null as string | null,
    youtube: null as string | null,
  },

  legal: {
    entity: "Vedaant Enterprises",
    /** TODO_PROOF: registered address required on the T&C / refund pages. */
    address: null as string | null,
    gstRegistered: true,
    /** TODO_PROOF: GSTIN — needed on invoices. */
    gstin: null as string | null,
  },

  /**
   * Shown in the footer and on every course page. The visa / employment-model
   * material in the course is awareness training, not advice, and must say so.
   */
  disclaimer:
    "RTechX training is educational. It is not immigration, legal or employment-law advice.",
} as const;

/**
 * Interim home for batch data so the hero has something real to render.
 * Step 2 moves this into the course content collection and deletes it here.
 */
export const nextBatch = {
  startDate: "2026-09-01",
  timeIST: "8:00–10:00 PM IST",
  seats: 20,
} as const;

export const instructor = {
  name: "Rattan Saini",
  role: "Talent Acquisition Specialist & Coach",
  location: "Gurugram, India",
  linkedin: "https://www.linkedin.com/in/rattansaini/",
  photo: "/instructor/rattan.jpg",
  stats: [
    { value: "10+", label: "years in recruitment" },
    { value: "1000+", label: "tech roles closed" },
    { value: "MBA", label: "qualified" },
  ],
} as const;

export const nav = {
  primary: [
    { href: "/courses", label: "Courses" },
    { href: "/free-resources", label: "Free resources" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/legal/terms", label: "Terms" },
    { href: "/legal/privacy", label: "Privacy" },
    { href: "/legal/refund-policy", label: "Refund policy" },
  ],
} as const;
