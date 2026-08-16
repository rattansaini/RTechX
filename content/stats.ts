// Re-verify quarterly. ISF publishes quarterly, Naukri JobSpeak monthly, SIA twice yearly.

/**
 * Market statistics shown on the site.
 *
 * `source` and `asOf` are deliberately NOT optional. Every number this brand
 * puts in front of a reader carries its publisher and its date, visibly, and
 * the type system is what enforces that — not a style guide someone can
 * forget. A stat without attribution will not compile.
 *
 * If you cannot name where a figure came from and when, it does not go on the
 * site.
 */
export type Stat = {
  id: string;
  value: string; // "16.1%"  |  "5.1 lakh"  |  "93% / 34%"
  label: string; // the one-line explanation
  source: string; // REQUIRED — publisher name
  asOf: string; // REQUIRED — "Q3 FY2025-26" | "July 2026"
  emphasis?: boolean;
};

export const stats: Stat[] = [
  {
    id: "it-staffing-growth",
    value: "16.1%",
    label:
      "Year-on-year growth in India's IT staffing segment — against 4% for general staffing",
    source: "Indian Staffing Federation, Flexi Staffing Employment Trends",
    asOf: "Q3 FY2025-26",
  },
  {
    id: "gcc-jobs",
    value: "5.1 lakh",
    label:
      "Jobs projected from India's Global Capability Centres in 2026, across ~2,120 centres",
    source: "foundit Insights Tracker",
    asOf: "July 2026",
  },
  {
    id: "critical-thinking",
    value: "73%",
    label:
      "Of talent leaders rank critical thinking as the top skill for human recruiters — above AI proficiency",
    source: "Korn Ferry, 12th Annual Talent Acquisition Trends",
    asOf: "2026",
  },
  {
    id: "ai-intent-gap",
    value: "93% / 34%",
    label:
      "Recruiters who plan to use more AI this year, versus those who say their team can actually use it well",
    source: "LinkedIn research, 19,000 respondents",
    asOf: "2026",
    emphasis: true,
  },
];
