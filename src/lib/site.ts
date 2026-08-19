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
    /** Shown on the terms, privacy, refund and contact pages. Razorpay checks for it. */
    address: "Ward No 18, Street of Moti Luhar, Barwala, Hisar, Haryana 125121",
    /**
     * The same address in parts, for structured data.
     *
     * It lives here rather than being typed again in the JSON-LD because it
     * already drifted once: the JSON-LD hard-coded Gurugram, so the page told a
     * reader the registered office was in Hisar while telling Google it was in
     * Gurugram. Gurugram is where Rattan works and where the terms put
     * jurisdiction — it is not the registered address of the entity.
     */
    postalAddress: {
      streetAddress: "Ward No 18, Street of Moti Luhar, Barwala",
      addressLocality: "Hisar",
      addressRegion: "Haryana",
      postalCode: "125121",
      addressCountry: "IN",
    },
    gstRegistered: true,
    gstin: "06FIQPD3056Q2ZM",
  },

  /**
   * Shown in the footer and on every course page. The visa / employment-model
   * material in the course is awareness training, not advice, and must say so.
   */
  disclaimer:
    "RTechX training is educational. It is not immigration, legal or employment-law advice.",
} as const;

export const instructor = {
  name: "Rattan Saini",
  role: "Founder, RTechX | Recruitment Strategist, Trainer & Mentor",
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
