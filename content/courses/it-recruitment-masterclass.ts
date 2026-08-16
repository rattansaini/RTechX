import type { Course } from "./types";

/**
 * The IT Recruitment Masterclass — currently the only live product.
 *
 * SAFE TO EDIT WITHOUT A DEVELOPER: prices, batch dates, seats, FAQ answers,
 * bullet text. Do not rename `slug` or a tier `id` after launch — both appear
 * in live checkout URLs and in recorded orders.
 */
export const itRecruitmentMasterclass: Course = {
  slug: "it-recruitment-masterclass",
  status: "live",
  title: "IT Recruitment Masterclass",
  shortTitle: "IT Recruitment Masterclass",

  hookLine:
    "From “I don’t understand the JD” to submitting a candidate with confidence — in 3 live evenings.",
  subHook:
    "A working IT-recruitment masterclass covering JD decoding, Boolean search, LinkedIn sourcing, ATS, resume screening, recruiter calls, submissions and onboarding. Live on Zoom. Recordings included.",
  cardSummary:
    "Read a tech JD, build the Boolean, screen the candidate. Three live evenings, taught by a recruiter who still hires every day.",

  outcomes: [
    "Read a tech JD and separate the 4–6 things that actually matter from the wish list",
    "Write a Boolean string that returns relevant people, then fix it when it doesn’t",
    "Screen a resume on evidence — recency, depth, scale, ownership — instead of keyword matching",
    "Run a 20-minute recruiter screening call with a structure and a scorecard",
    "Write a submission a hiring manager actually reads",
    "Explain W2, C2C, 1099, markup vs margin, notice period and CTC without bluffing",
    "Answer the 65 questions that come up in entry-level IT-recruiter interviews",
  ],

  forWhom: [
    "Freshers and graduates entering recruitment",
    "HR and non-IT recruiters moving into tech hiring",
    "Recruiters with 0–2 years who were never actually trained",
    "Founders hiring their own tech team",
  ],

  notForWhom: [
    "Anyone expecting a guaranteed job placement — we prepare you, we don’t place you",
    "Senior TA leads with 5+ years — you already know this",
  ],

  painPoints: [
    { emoji: "😵", line: "The JD says “Kubernetes” and you just search “Kubernetes”" },
    { emoji: "😰", line: "The hiring manager asks a technical question and you go quiet" },
    { emoji: "📉", line: "You send 20 profiles, none get shortlisted" },
    {
      emoji: "🌀",
      line: "You’ve been “learning recruitment” from YouTube for 3 months and still can’t run one search",
    },
    {
      emoji: "🚪",
      line: "You applied for a recruiter job and got asked about W2, C2C and 1099",
    },
  ],

  days: [
    {
      day: 1,
      title: "Foundations & the requirement",
      bullets: [
        "IT recruitment vs other recruitment",
        "The tech stack layers — frontend, backend, data, cloud, DevOps, QA, security",
        "15 IT role families and what evidence to look for in each",
        "Seniority signals",
        "Requirement intake",
        "JD decomposition",
      ],
      deliverable: "A completed intake sheet, must-have matrix and candidate persona.",
    },
    {
      day: 2,
      title: "Finding and filtering people",
      bullets: [
        "Sourcing strategy",
        "Boolean operators and how to build a string step by step",
        "10 ready role-family search strings",
        "LinkedIn Basic vs Recruiter workflows",
        "Job portals",
        "ATS stages and note-writing standards",
        "Evidence-based resume screening with a 100-point scorecard",
        "Red flags that are questions, not rejections",
      ],
      deliverable: "Two Boolean strings and five scored resumes.",
    },
    {
      day: 3,
      title: "Closing the loop",
      bullets: [
        "Recruiter screening call structure",
        "Submissions and Right to Represent",
        "Client and hiring-manager handling",
        "Interview coordination",
        "Employment models",
        "Offer, preboarding, onboarding",
        "AI used responsibly",
        "Funnel metrics",
        "Interview preparation",
      ],
      deliverable:
        "One outreach message, one candidate submission, and a full end-to-end simulation.",
    },
    {
      day: 4,
      title: "India hiring, live",
      bullets: [
        "Live sourcing on Naukri + LinkedIn against a real JD",
        "CTC vs fixed vs variable vs take-home",
        "Notice period, buyout, relieving letters, BGV",
        "Third-party payroll vs client payroll",
        "Live screening calls and what to listen for",
        "India-specific red flags and offer-drop reasons",
      ],
      deliverable: "A live-sourced shortlist against a real India requirement.",
    },
    {
      day: 5,
      title: "US hiring, live",
      bullets: [
        "W2 vs C2C vs 1099 explained with real rate maths (markup vs gross margin)",
        "Visa awareness — H-1B, GC, EAD, OPT/STEM OPT, TN, E-3 — and the legally safe way to ask about work authorisation",
        "Dice, Monster and LinkedIn sourcing live",
        "Implementation partners, prime vendors, MSP/VMS",
        "The submission format US clients expect",
        "Night-shift reality and how US staffing teams actually measure you",
      ],
      deliverable: "A US-format submission built from a live-sourced candidate.",
    },
  ],

  tiers: [
    {
      id: "core",
      name: "IT Recruitment Masterclass",
      priceINR: 499,
      // No compareAtINR: this course has never been sold at a higher price, so
      // a strikethrough would be a false discount claim.
      durationLabel: "3 days · 2 hrs/day · Live",
      includes: [
        "Days 1–3, live on Zoom",
        "Session recordings",
        "40+ page handbook (PDF)",
        "Intake templates and Boolean library",
        "100-point screening scorecard",
        "65-question interview prep bank",
        "Certificate on completion",
        "Doubt-support window",
      ],
    },
    {
      id: "full",
      name: "Masterclass + Geo Specialisation",
      priceINR: 999,
      durationLabel: "5 days · 2 hrs/day · Live",
      highlight: true,
      includes: [
        "Everything in the 3-day masterclass",
        "Day 4 — India hiring, sourced live on screen",
        "Day 5 — US hiring, sourced live on screen",
        "Real rate maths: markup vs gross margin",
        "Visa awareness for US requirements",
        "You do a live search while we watch",
      ],
      razorpayNotes: "Upgrade from core is charged as the ₹500 difference.",
    },
  ],

  inclusions: [
    { title: "40+ page handbook", detail: "The full course in PDF — yours to keep." },
    { title: "Boolean library", detail: "10 ready role-family search strings you can run the same evening." },
    { title: "Intake templates", detail: "The requirement intake sheet and must-have matrix used on Day 1." },
    { title: "Screening scorecards", detail: "The 100-point evidence-based resume scorecard from Day 2." },
    { title: "Submission template", detail: "The format hiring managers actually read to the end." },
    { title: "65-question interview bank", detail: "What entry-level IT-recruiter interviews really ask." },
    { title: "Session recordings", detail: "Every live session, shared after each day." },
    { title: "Certificate", detail: "Issued on completion." },
    { title: "Doubt-support window", detail: "Ask questions after the batch ends." },
  ],

  resources: [
    "40+ page handbook (PDF)",
    "Requirement intake templates",
    "Boolean search library",
    "100-point screening scorecards",
    "Candidate submission template",
    "65-question interview prep bank",
  ],

  batches: [
    {
      startDate: "2026-09-01",
      timeIST: "8:00–10:00 PM IST",
      seats: 20,
      // null = derive from confirmed enrolments once checkout is live.
      seatsLeft: null,
    },
  ],

  urgency: {
    countdownTo: "batch-start",
    showSeatsLeft: true,
  },

  // CONFIRM BEFORE LAUNCH — Rattan must approve these exact terms, since this
  // is a financial commitment. Delete the whole block to remove the guarantee.
  guarantee: {
    label: "Attend Day 1. Still not for you? Full refund.",
    body: "Sit through the first live session. If it isn’t what you expected, email us before Day 2 begins and we refund the full amount — no form, no argument.",
  },

  // Left unset on purpose: a price-rise notice needs a real new price and a
  // real date. Supply both and it renders itself, then expires on its own.
  // priceRise: { newPriceINR: 0, effectiveFrom: "YYYY-MM-DD", appliesToTierId: "core" },

  // Uses the widest range Rattan's own market research cited (₹2,000 floor),
  // because claiming a ₹3,000 floor would contradict his own lower figure.
  marketAnchorNote:
    "Comparable live programmes are typically priced ₹2,000–₹25,000.",

  faqs: [
    {
      q: "Is it live or recorded?",
      a: "Live. Every session is taught in real time on Zoom, and the recording is shared after each day so you can go back over anything.",
    },
    {
      q: "What if I miss a day?",
      a: "You get the recording for that session, plus the same handbook and templates as everyone else. Bring your questions to the next live day — nothing is gated behind attendance.",
    },
    {
      q: "Do I need a technical or IT background?",
      a: "No. You are not going to write code. You are going to learn to read a tech JD, tell which skills actually matter, and recognise real evidence in a resume. We start from zero on the technology.",
    },
    {
      q: "Will I get a job? Do you provide placement?",
      a: "No, and we won’t pretend otherwise. There is no placement guarantee and no hiring partner list. What you get is the skill, the artifacts you built during the course, and a 65-question interview bank aimed at entry-level IT-recruiter interviews. The applying is yours.",
    },
    {
      q: "What language is it taught in?",
      a: "English, with Hindi used freely wherever it makes a concept land faster. Every written resource — handbook, templates, Boolean library — is in English.",
    },
    {
      q: "Do I get a certificate?",
      a: "Yes, issued on completion of the batch.",
    },
    {
      q: "What do I need — a laptop? A LinkedIn Recruiter licence?",
      a: "A laptop and a working internet connection. No paid tools required. We teach the LinkedIn Basic workflow precisely because most people starting out don’t have a Recruiter seat.",
    },
    {
      q: "How do I pay, and what’s the refund policy?",
      a: "Payment is through Razorpay — UPI, cards, netbanking, wallets and EMI. Attend Day 1, and if it isn’t what you expected, email us before Day 2 begins for a full refund. Full terms are on the refund policy page.",
    },
    {
      q: "Can I upgrade from ₹499 to ₹999 later?",
      a: "Yes. Join the 3-day batch first, and if you want Days 4 and 5 you pay only the ₹500 difference — not the full ₹999.",
    },
    {
      q: "Is this only for US recruitment?",
      a: "No. Days 1–3 are global-aware and apply anywhere. Days 4 and 5 are the India and US specialisation, because those are the two markets that actually pay Indian recruiters.",
    },
  ],

  seo: {
    title: "IT Recruitment Masterclass — live online, ₹499",
    description:
      "Learn IT recruitment live in 3 evenings: decode tech JDs, build Boolean searches, screen on evidence, and submit with confidence. Taught by a working talent acquisition specialist. ₹499.",
    keywords: [
      "IT recruitment course India",
      "US IT recruiter training online",
      "Boolean search training for recruiters",
      "how to become an IT recruiter",
    ],
  },
};
