/**
 * Custom 1:1 Coaching — copy and pricing constants.
 *
 * Money is integer paise throughout. The call is ₹299 + 18% GST:
 * 29900 + 5382 = 35282 paise (₹352.82). The server derives the charge from
 * these constants; the browser never sends an amount.
 */

export const COACHING_BASE_PAISE = 29_900;
export const COACHING_GST_PERCENT = 18;
export const COACHING_GST_PAISE = Math.round(
  (COACHING_BASE_PAISE * COACHING_GST_PERCENT) / 100
);
export const COACHING_TOTAL_PAISE = COACHING_BASE_PAISE + COACHING_GST_PAISE; // 35282

/** ₹352.82 — two decimals, Indian grouping. formatINR() in utils drops decimals. */
export function formatRupees2(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export const TOTAL_LABEL = formatRupees2(COACHING_TOTAL_PAISE); // ₹352.82

export const OCCUPATIONS = [
  "Fresher / career switcher",
  "Recruiter",
  "Team lead or agency owner",
  "Other",
] as const;

export const TRACK_OPTIONS = [
  "Full recruitment cycle",
  "AI and automation",
  "Build a tool or AI agent",
] as const;

export const GOAL_MAX = 500;

export const REFUND_RULE =
  "Full refund if you cancel 24+ hours before the call or if Rattan cancels. No refund for a no-show.";

export const coaching = {
  meta: {
    title: "Custom 1:1 Coaching — RTechX",
    description:
      "A recruitment programme designed around you: the full hiring cycle, AI in recruiting, or building your own AI agent. Start with a 20-minute call with Rattan.",
  },
  hero: {
    eyebrow: "Custom 1:1 Coaching · Built around you",
    h1: "A recruitment programme designed for one person: you.",
    sub: "Tell Rattan where you're stuck in a 20-minute call. He designs the sessions, the order and the price around your goal — then you decide.",
    primary: "Book your 20-min call · ₹299 + GST",
    secondary: "See how it works",
    trust: [
      "20 minutes, one-to-one with Rattan",
      "Pay by UPI or card",
      "No obligation to buy the programme",
    ],
  },
  whoFor: [
    "New to recruitment and want the full cycle, not YouTube fragments",
    "Working recruiter who wants AI to save real hours, safely",
    "Team lead or agency owner who wants to automate the boring parts",
    "Recruiter with an idea for a tool or AI agent and no idea where to start",
  ],
  tracksHeading: "Three tracks. Mix what you need.",
  tracks: [
    {
      title: "The complete recruitment cycle",
      body: "Hiring-manager intake, decoding tech JDs, sourcing and Boolean, screening on evidence, submissions, interview coordination, offer to joining, and the numbers that matter.",
    },
    {
      title: "AI and automation in daily recruiting",
      body: "Prompts for JDs and outreach, AI-assisted screening with a human check, Excel and ATS automations, using ChatGPT, Claude or Copilot well, and spotting when the machine is wrong.",
    },
    {
      title: "Build your own recruitment tool or AI agent",
      body: "Pick one real problem, choose no-code or an AI agent, build it together session by session, test it, and keep candidate data safe. You leave owning a working tool.",
    },
  ],
  steps: [
    {
      title: "Pay ₹299 + GST and book your call",
      body: "Share your name, email, mobile and what you want to achieve.",
    },
    {
      title: "20-minute call with Rattan",
      body: "Your goal, your level, and which tracks fit.",
    },
    {
      title: "Your custom plan and price",
      body: "Emailed within 48 hours: sessions, schedule and fee.",
    },
    {
      title: "You decide",
      body: "Join, and the ₹299 is deducted from your programme fee. Or don't — nothing more to pay.",
    },
    {
      title: "1:1 sessions begin",
      body: "Live on Google Meet, as set in your plan.",
    },
  ],
  includes: [
    "A written roadmap",
    "A set number of live 1:1 sessions on Google Meet",
    "Session recordings",
    "Templates and checklists",
    "WhatsApp questions between sessions",
  ],
  pricing: [
    "The call: ₹299 + 18% GST (₹352.82). Deducted from your programme fee if you join.",
    "The programme: priced after your call — it depends on the number of sessions, the tracks you choose and how complex your build is.",
  ],
  faqs: [
    {
      q: "Why is the call ₹299 and not free?",
      a: "So Rattan's time goes to people who are serious. You get 20 focused minutes and a written plan with a price afterwards.",
    },
    {
      q: "Is the ₹299 adjusted if I join the programme?",
      a: "Yes. The ₹299 is deducted from your programme fee.",
    },
    {
      q: "Do I have to buy after the call?",
      a: "No. You get a written plan and price; take it or leave it.",
    },
    {
      q: "Why do you need my mobile number?",
      a: "To confirm your slot and reach you if the call link fails. We don't share it.",
    },
    {
      q: "Can I get the ₹299 back?",
      a: "Yes, if you cancel 24+ hours before the call or if Rattan cancels. Not for a no-show.",
    },
    {
      q: "Do I need coding skills for the build track?",
      a: "No. We start with no-code tools and go further only if you want to.",
    },
    {
      q: "Will you build the tool for me?",
      a: "We build it together. You do the work with guidance, so you can maintain it.",
    },
    {
      q: "What language are sessions in?",
      a: "Your choice. Recruitment roles need English, so we build that, and Rattan explains in Hindi whenever it helps.",
    },
    {
      q: "Can my company pay?",
      a: "Yes. We are GST registered and can invoice.",
    },
    {
      q: "What if I miss a session?",
      a: "Reschedule with 24 hours' notice; otherwise the session counts as used.",
    },
  ],
  finalCta: {
    heading: "Twenty minutes. One honest plan.",
    button: "Book your 20-min call · ₹299 + GST",
  },
} as const;
