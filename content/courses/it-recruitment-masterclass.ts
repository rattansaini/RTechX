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

  hookLine: "Most recruiters can’t read the JD they’re hiring for.",
  subHook:
    "That’s the gap. Three live evenings to close it — ₹499, or ₹999 with two live days on India and US hiring.",
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
        "Boolean strings built live, role family by role family",
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
        // Kept in step with `batches[].platform`. Naming Zoom specifically here
        // while the workshop grid said "Zoom or Google Meet" meant two answers
        // to the same question on one page.
        "Days 1–3, live online",
        "Session recordings, shared within 7 days",
        "60+ page handbook (PDF)",
        "Intake templates and Boolean library",
        "100-point screening scorecard",
        "65-question interview prep bank",
        "Certificate on completion",
        "One 1-to-1 doubt-clearing session",
      ],
    },
    {
      id: "full",
      name: "Masterclass + Geo Specialisation",
      priceINR: 999,
      durationLabel: "5 days · 2 hrs/day · Live",
      highlight: true,
      // Only the extras — core's items are resolved via `inheritsFrom`, which
      // keeps the comparison matrix honest without repeating eight lines.
      inheritsFrom: "core",
      includes: [
        "Day 4 — India hiring, sourced live on screen",
        "Day 5 — US hiring, sourced live on screen",
        "Real rate maths: markup vs gross margin",
        "Visa awareness for US requirements",
        "You do a live search while we watch",
      ],
      razorpayNotes: "Upgrade from core is charged as the ₹500 difference.",
    },
  ],

  // Only `available: true` bonuses render — flipping the flag is the whole
  // mechanism, nothing else needs changing.
  // The Field Kit and the Resume Playbook used to sit here. Both are now free
  // public downloads on /free-resources, so presenting them as buyer-only
  // extras would be a straightforward lie — anyone can have them without
  // paying. What remains is the one thing a buyer genuinely gets that a
  // visitor cannot: a second seat.
  //
  // The rest moved into `inclusions`, which is the honest home for it: things
  // the course comes with, not a bonus stack inflating the offer.
  bonuses: [
    {
      id: "bring-a-friend",
      title: "1+1 — bring a friend",
      body: "One paid seat admits two people. Reply to your confirmation email with your friend’s name and email, and we’ll add them to the batch.",
      points: [
        "Your friend attends every live day with you",
        "They get the recordings and the materials too",
        "Easier to practise sourcing when someone else is doing it alongside you",
      ],
      available: true,
    },
  ],

  inclusions: [
    { title: "60+ page handbook", detail: "The full course in PDF — yours to keep." },
    { title: "Boolean library", detail: "35 ready-to-run search strings you can run the same evening — the Field Kit, free to anyone." },
    { title: "Intake templates", detail: "The requirement intake sheet and must-have matrix used on Day 1." },
    { title: "Screening scorecards", detail: "The 100-point evidence-based resume scorecard from Day 2." },
    { title: "Submission template", detail: "The format hiring managers actually read to the end." },
    { title: "65-question interview bank", detail: "What entry-level IT-recruiter interviews really ask." },
    { title: "Session recordings", detail: "Every live session, shared within 7 days of that session." },
    { title: "Certificate", detail: "Issued on attending every live day of your option — 3 days, or 5 on the ₹999 option." },
    { title: "1-to-1 doubt session", detail: "One personal session with Rattan after the batch, to work through what didn’t land." },
  ],

  resources: [
    "60+ page handbook (PDF)",
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
      platform: "Zoom or Google Meet",
      seats: 20,
      // null = derive from confirmed enrolments once checkout is live.
      seatsLeft: null,
    },
  ],

  urgency: {
    countdownTo: "batch-start",
    showSeatsLeft: true,
  },

  // Approved by Rattan on 2026-08-16. This is a binding financial commitment
  // shown on the course page and echoed on /legal/refund-policy — changing the
  // wording here changes both. The cut-off is deliberate: the refund window
  // closes when Day 2 begins, so someone cannot take all three days and then
  // ask for their money back.
  guarantee: {
    label: "Attend Day 1. Still not for you? Full refund.",
    body: "Sit through the first live session. If it isn’t what you expected, email us before Day 2 begins and we refund the full amount — no form, no argument.",
  },

  // Left unset on purpose: a price-rise notice needs a real new price and a
  // real date. Supply both and it renders itself, then expires on its own.
  // priceRise: { newPriceINR: 0, effectiveFrom: "YYYY-MM-DD", appliesToTierId: "core" },

  // Every figure quoted here is attributed in the section that renders it.
  // Re-verify when the ISF publishes next quarter — see content/stats.ts.
  careerScope: {
    intro: [
      "IT recruitment is one of the few technology-adjacent careers you can enter without a technical degree, from any graduate background, and be earning within months rather than years.",
      "The market is real, and it is specific. India’s IT staffing segment grew 16.1% year-on-year while general staffing grew 4%. Global Capability Centres — now around 2,120 of them across Bengaluru, Hyderabad, Pune, Chennai and NCR — are on track to hire over five lakh people in 2026.",
      "Read that contrast carefully, because it’s the honest picture: the broad job market is soft. Specialised technical hiring is the part that is still growing. Generalists are having a hard year. That is precisely the argument for specialising.",
    ],
    introSource:
      "Indian Staffing Federation, Flexi Staffing Employment Trends, Q3 FY2025-26 · foundit Insights Tracker, July 2026",
    ladder: [
      {
        stage: "0–6 months",
        role: "Sourcing associate, recruitment coordinator",
        earnings: "₹15,000–₹25,000/month",
      },
      {
        stage: "6 months – 2 yrs",
        role: "IT recruiter, US IT recruiter",
        earnings: "₹3–5 LPA, plus incentives and night-shift allowance",
      },
      {
        stage: "2–5 yrs",
        role: "Technical recruiter, account-facing recruiter",
        earnings: "Commission per placement becomes the larger share",
      },
      {
        stage: "5 yrs +",
        role: "Niche specialist, team lead, TA partner",
        earnings: "Cloud, cybersecurity and SAP niches pay the most",
      },
    ],
    ladderNote:
      "Ranges are indicative, drawn from PayScale, Glassdoor and Indeed India, mid-2026. Your actual offer depends on city, employer, shift and how well you interview.",
    verifyPrompt:
      'Want to check this yourself? Open Naukri and search "US IT Recruiter". Count how many say freshers welcome or 0–1 years. We\'d rather you verified the market than took our word for it.',
  },

  // Rattan confirmed the ₹3,000 floor. Must stay consistent with the price
  // honesty band that renders directly above the pricing table — the two sat
  // on the same screen quoting different floors.
  marketAnchorNote:
    "Comparable live programmes are typically priced ₹3,000–₹25,000.",

  faqs: [
    {
      q: "Is it live or recorded?",
      a: "Live. Every session is taught in real time, and the recording follows within 7 days so you can go back over anything. The joining link goes out before Day 1.",
    },
    {
      q: "What if I miss a day?",
      a: "You get the recording for that session within 7 days, plus the same handbook and templates as everyone else. Bring your questions to the next live day — nothing is gated behind attendance.",
    },
    {
      q: "Do I need a technical or IT background?",
      a: "No. You are not going to write code. You are going to learn to read a tech JD, tell which skills actually matter, and recognise real evidence in a resume. We start from zero on the technology.",
    },
    {
      q: "What language is it taught in?",
      a: "English, with Hindi used freely wherever it makes a concept land faster. Every written resource — handbook, templates, Boolean library — is in English.",
    },
    {
      q: "Do I get a certificate?",
      a: "Yes — issued once you have attended every live day of the option you booked: all 3 days on the ₹499 option, or all 5 on the ₹999 one. Watching a recording counts as attending that day.",
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
    {
      q: "Will I get a job? Do you provide placement?",
      a: "No, and we won’t pretend otherwise. There is no placement guarantee and no hiring partner list — and you should be careful with any course that offers one. What we can tell you is what the course gives you and what the market looks like.\n\nYou leave with the artifacts a hiring manager asks about in an interview — completed intake sheets, Boolean strings you wrote, scored resumes, a candidate submission and a recorded practice screening call — plus preparation for the 65 questions that come up in entry-level IT recruiter interviews. You will be able to answer “how would you source a Java developer?” with a demonstration instead of a definition.\n\nOn the market: India’s IT staffing segment grew 16.1% year-on-year, and GCCs are projected to hire over five lakh people in 2026. The opportunity is real. Whether you convert it depends on how you interview and how much you practise after the sessions end.",
      source:
        "Indian Staffing Federation, Flexi Staffing Employment Trends, Q3 FY2025-26 · foundit Insights Tracker, July 2026",
    },
    {
      q: "Is IT recruitment a safe career with AI coming?",
      a: "Safer than most, and for a specific reason: recruitment is one of the few functions where human review isn’t just preferred, it’s regulated. The EU AI Act classifies recruitment tools as high-risk and requires human oversight; New York City requires bias audits and candidate notice for automated hiring tools. Someone qualified has to review what the machine produces.\n\nThe realistic version is this: AI has absorbed the admin — screening, scheduling, ranking, first-draft outreach. What it can’t do is judge whether a candidate’s “5 years of Kubernetes” is real, decide when a hiring manager’s requirement is unreasonable, or persuade a senior engineer to take the call. Those are the skills that now separate a recruiter who gets hired from one who doesn’t, and they’re what this course is about.",
      source: "EU AI Act, Annex III · New York City Local Law 144",
    },
    {
      q: "I’m from a non-technical background. Is that a problem?",
      a: "No — and it’s the most common background among people who do this well. You are not learning to code. You are learning to recognise what a technology does, which skills genuinely belong together, and what evidence in a resume proves someone actually did the work. Day 1 starts from zero and assumes no prior technical knowledge.",
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
