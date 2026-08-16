import type { ComingSoonCourse } from "./types";

/**
 * The planned catalogue. These render as locked cards with a "Notify me"
 * capture — no dates, no prices, nothing implied that isn't decided.
 *
 * To launch one: write a full course file like
 * `it-recruitment-masterclass.ts`, register it in `index.ts`, and delete its
 * entry from this list.
 */
export const comingSoonCourses: ComingSoonCourse[] = [
  {
    slug: "us-staffing-deep-dive",
    status: "coming-soon",
    title: "US Staffing Deep Dive",
    shortTitle: "US Staffing",
    cardSummary:
      "Rate maths, visa awareness, prime vendors and MSP/VMS — the US contract market end to end.",
  },
  {
    slug: "bench-sales",
    status: "coming-soon",
    title: "Bench Sales",
    shortTitle: "Bench Sales",
    cardSummary:
      "Marketing consultants on the bench: hotlists, vendor relationships, and closing a placement.",
  },
  {
    slug: "non-it-recruitment",
    status: "coming-soon",
    title: "Non-IT Recruitment",
    shortTitle: "Non-IT Recruitment",
    cardSummary:
      "The same discipline applied outside tech — sales, finance, operations and manufacturing hiring.",
  },
  {
    slug: "ai-for-recruiters",
    status: "coming-soon",
    title: "AI for Recruiters",
    shortTitle: "AI for Recruiters",
    cardSummary:
      "Where AI genuinely speeds up sourcing and screening — and where trusting it will cost you a placement.",
  },
];
