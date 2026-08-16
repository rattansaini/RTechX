/**
 * Content schema for the RTechX academy.
 *
 * One course = one file in this directory, registered in `index.ts`. Nothing
 * here imports from the app, so a CMS can later be dropped in behind the same
 * shapes without touching a single component.
 *
 * Editing guide for non-developers is in README.md → "Editing course content".
 */

export type Tier = {
  /** Stable id — used in checkout URLs (?tier=core). Never rename after launch. */
  id: "core" | "full";
  name: string;
  priceINR: number;
  /**
   * Strikethrough anchor. ONLY set this to a price this course was genuinely
   * offered at. Leave undefined to render no strikethrough — an invented
   * "was" price is a false discount claim under the Consumer Protection Act.
   */
  compareAtINR?: number;
  /** "3 days · 2 hrs/day · Live" */
  durationLabel: string;
  /**
   * What this tier adds. When `inheritsFrom` is set, list ONLY the extras —
   * the parent's items are resolved automatically so the comparison matrix
   * stays truthful without duplicating every line.
   */
  includes: string[];
  /** Tier whose includes this one also gets. */
  inheritsFrom?: Tier["id"];
  /** Renders the "Most popular" flag. Exactly one tier should set this. */
  highlight?: boolean;
  razorpayNotes?: string;
};

export type Batch = {
  /** ISO date, Asia/Kolkata. Drives the countdown and every "next batch" label. */
  startDate: string;
  timeIST: string;
  seats: number;
  /**
   * Leave `null` to derive from confirmed enrolments in Supabase.
   * Set a number to override manually. The seat bar hides entirely when the
   * resolved value is null — it never guesses.
   */
  seatsLeft: number | null;
};

export type Day = {
  day: number;
  title: string;
  bullets: string[];
  /** "You'll walk out with…" — every day must produce an artifact. */
  deliverable: string;
};

export type PainPoint = { emoji: string; line: string };

export type Faq = { q: string; a: string };

/** A single line in the "what you get" stack. No rupee valuations — see README. */
export type Inclusion = { title: string; detail: string };

export type Guarantee = {
  label: string;
  body: string;
};

/**
 * Honest price-rise notice. Renders only while `effectiveFrom` is in the
 * future, then disappears on its own rather than going stale and becoming a
 * standing lie.
 */
export type PriceRise = {
  newPriceINR: number;
  /** ISO date the new price takes effect. */
  effectiveFrom: string;
  appliesToTierId: Tier["id"];
};

export type Urgency = {
  /**
   * Countdown target. Set to "batch-start" to count down to the next batch's
   * real start date, or null for no timer. There is deliberately no option
   * for an arbitrary or repeating deadline.
   */
  countdownTo: "batch-start" | null;
  showSeatsLeft: boolean;
};

export type Course = {
  slug: string;
  status: "live" | "coming-soon";
  title: string;
  /** Short label for nav and cards. */
  shortTitle: string;
  /** Hero H1 on the sales page. */
  hookLine: string;
  subHook: string;
  /** Catalogue card blurb. */
  cardSummary: string;
  outcomes: string[];
  forWhom: string[];
  /** Builds trust by disqualifying people. Do not leave empty. */
  notForWhom: string[];
  painPoints: PainPoint[];
  days: Day[];
  tiers: Tier[];
  inclusions: Inclusion[];
  faqs: Faq[];
  resources: string[];
  trailerUrl?: string;
  batches: Batch[];
  urgency: Urgency;
  priceRise?: PriceRise;
  guarantee?: Guarantee;
  /** Market comparison shown near pricing. Must be defensible. */
  marketAnchorNote?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
};

/**
 * A course that isn't built yet. Renders as a locked catalogue card with a
 * "Notify me" capture, which is what keeps the catalogue looking alive while
 * only one product is actually live.
 */
export type ComingSoonCourse = {
  slug: string;
  status: "coming-soon";
  title: string;
  shortTitle: string;
  cardSummary: string;
};

export type CatalogueEntry = Course | ComingSoonCourse;

export function isLive(entry: CatalogueEntry): entry is Course {
  return entry.status === "live";
}

export type Testimonial = {
  name: string;
  role: string;
  /** Must describe a specific outcome, not "great course!". */
  quote: string;
  /** Optional headshot in /public/testimonials. */
  photo?: string;
};

/* ------------------------------------------------------------------ */
/* Derived helpers — used by components so the rules live in one place */
/* ------------------------------------------------------------------ */

/** The next batch that hasn't started yet, or null once they're all past. */
export function nextBatch(course: Course, now: Date = new Date()): Batch | null {
  return (
    course.batches
      .filter((b) => new Date(b.startDate).getTime() > now.getTime())
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null
  );
}

export function tierById(course: Course, id: Tier["id"]): Tier | undefined {
  return course.tiers.find((t) => t.id === id);
}

/**
 * Everything a tier actually includes, parent items first.
 *
 * The tier card shows the short incremental list ("everything in X, plus…"),
 * but the comparison matrix must use this — otherwise the upgrade tier reads
 * as though it omits the handbook, recordings and certificate.
 */
export function resolvedIncludes(course: Course, tier: Tier): string[] {
  const out: string[] = [];
  const seenTiers = new Set<string>();

  const walk = (t: Tier) => {
    if (seenTiers.has(t.id)) return; // guards against a mis-edited cycle
    seenTiers.add(t.id);
    if (t.inheritsFrom) {
      const parent = tierById(course, t.inheritsFrom);
      if (parent) walk(parent);
    }
    for (const i of t.includes) if (!out.includes(i)) out.push(i);
  };

  walk(tier);
  return out;
}

/** Price-rise notices expire on their own. */
export function activePriceRise(
  course: Course,
  now: Date = new Date()
): PriceRise | null {
  const pr = course.priceRise;
  if (!pr) return null;
  return new Date(pr.effectiveFrom).getTime() > now.getTime() ? pr : null;
}
