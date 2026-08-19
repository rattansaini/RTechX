import type { PostFormat } from "./types";

/**
 * Weekly cadence. Five posts, Mon–Fri, alternating format.
 * Weekends are deliberately empty — recruiter audiences are least active,
 * and forcing seven-day output degrades quality faster than it builds reach.
 */
const WEEKLY_PLAN: Record<number, { format: PostFormat; theme: string } | null> = {
  0: null, // Sunday
  1: { format: "still", theme: "india_hiring_data" },
  2: { format: "reel", theme: "sourcing_technique" },
  3: { format: "still", theme: "recruiting_myth" },
  4: { format: "reel", theme: "us_market_data" },
  5: { format: "still", theme: "career_scope" },
  6: null, // Saturday
};

/** Themes rotate within each slot so consecutive weeks don't repeat angles. */
const THEME_POOL: Record<string, string[]> = {
  india_hiring_data: [
    "India IT services hiring cycles and headcount trends",
    "GCC (Global Capability Centre) hiring in India",
    "India fresher vs lateral hiring patterns in tech",
    "Salary and skill-premium trends in Indian IT",
  ],
  sourcing_technique: [
    "Boolean search operators recruiters underuse",
    "X-ray search across GitHub, Stack Overflow, or LinkedIn",
    "Writing an intake brief that actually narrows a search",
    "Screening for depth vs keyword matching",
  ],
  recruiting_myth: [
    "The ATS auto-rejection myth and what really happens",
    "Resume length and formatting myths",
    "The myth that certifications outweigh project evidence",
    "Job description keyword stuffing and why it backfires",
  ],
  us_market_data: [
    "US tech layoffs and hiring recovery data",
    "H-1B policy changes relevant to recruiters",
    "Remote vs onsite shifts in US tech hiring",
    "In-demand US tech skills by hiring volume",
  ],
  career_scope: [
    "What an IT recruiter actually does day to day",
    "Career paths from recruitment coordinator to TA lead",
    "How non-technical recruiters build technical fluency",
    "AI's effect on the recruiter role",
  ],
};

export interface TodaysSlot {
  format: PostFormat;
  theme: string;
  topic: string;
  dateIso: string;
}

/** Current date in IST, regardless of server timezone. */
export function nowIst(): Date {
  const utc = Date.now();
  return new Date(utc + 5.5 * 60 * 60 * 1000);
}

/**
 * Returns null on days with no scheduled post. The topic is chosen by
 * ISO week number so the pool rotates rather than repeating.
 */
export function getTodaysSlot(now: Date = nowIst()): TodaysSlot | null {
  const plan = WEEKLY_PLAN[now.getUTCDay()];
  if (!plan) return null;

  const pool = THEME_POOL[plan.theme] ?? [];
  const week = isoWeekNumber(now);
  const topic = pool[week % pool.length] ?? plan.theme;

  return {
    format: plan.format,
    theme: plan.theme,
    topic,
    dateIso: now.toISOString().slice(0, 10),
  };
}

function isoWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
