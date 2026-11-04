/**
 * RTechX Recruiter Toolkit — the single source of truth for every tool.
 *
 * Shared by the pages (server), the tool forms (client) and /api/tools/run
 * (server), so the form fields, their limits and the server's validation can
 * never drift apart. No server-only imports here.
 *
 * Honesty rule (brand-voice.md §11): "How I built this" lists real facts only.
 * Nothing about build time, user counts or results is stated, because none of
 * it is known yet.
 */

export const TOOLS_TRIAL_DAYS = 7;
/** AI runs per user per calendar day (IST). The Copilot costs 3. */
export const TOOLS_DAILY_LIMIT = 20;

export type ToolField = {
  name: string;
  label: string;
  type: "textarea" | "text" | "select";
  required?: boolean;
  maxLength: number;
  rows?: number;
  placeholder?: string;
  help?: string;
  options?: readonly string[];
};

export type Tool = {
  slug: string;
  number: number;
  name: string;
  phase: 1 | 2 | 3;
  /** One line for cards. */
  short: string;
  /** Two or three sentences for the tool page. */
  intro: string;
  usesAI: boolean;
  /** Runs counted against the daily limit per use. */
  cost: number;
  fields: readonly ToolField[];
  submitLabel: string;
  /** Shown above the form when the tool takes candidate data. */
  privacyNote?: string;
  /** Which Masterclass day / coaching track it mirrors. */
  teaches: string;
  howIBuilt: readonly string[];
};

const JD_FIELD: ToolField = {
  name: "jd",
  label: "Job description",
  type: "textarea",
  required: true,
  maxLength: 8000,
  rows: 10,
  placeholder: "Paste the full JD here, or describe the role in a few lines.",
};

export const tools: readonly Tool[] = [
  {
    slug: "jd-decoder",
    number: 1,
    name: "JD Decoder",
    phase: 1,
    short: "Paste a tech JD. See the must-haves, the wish-list and what every technology actually means.",
    intro:
      "Most tech JDs mix four real requirements with a dozen nice-to-haves. The JD Decoder separates them, explains each technology in plain English, and tells you what evidence to look for on a resume.",
    usesAI: true,
    cost: 1,
    fields: [JD_FIELD],
    submitLabel: "Decode this JD",
    teaches: "Masterclass Day 1 — reading a tech JD",
    howIBuilt: [
      "Designed by Rattan from the JD-reading method taught on Day 1 of the Masterclass.",
      "Built with Claude (Anthropic's AI) on the same Next.js website you are using now.",
      "The AI is given a fixed structure — must-haves, wish-list, plain-English glossary, evidence to look for — so every answer follows the method, not a guess.",
      "Your JD is sent to the AI, used once and not stored.",
    ],
  },
  {
    slug: "boolean-builder",
    number: 2,
    name: "Boolean Builder & Fixer",
    phase: 1,
    short: "Strings for LinkedIn, Naukri and Google X-ray — with every block explained. Or paste a broken one to fix.",
    intro:
      "Build a search string from a JD or a short role description, ready for LinkedIn, Naukri Resdex and Google X-ray. Every block is explained, so you learn the logic instead of copying it. Paste a string that isn't working and it tells you why and fixes it.",
    usesAI: true,
    cost: 1,
    fields: [
      {
        ...JD_FIELD,
        required: false,
        rows: 7,
        label: "JD or role description",
        placeholder: "e.g. Java backend developer, Spring Boot, microservices, AWS, 4–7 years, Pune",
      },
      {
        name: "existing",
        label: "A string that isn't working (optional)",
        type: "textarea",
        maxLength: 2000,
        rows: 4,
        placeholder: '("Java Developer" OR Java) AND Spring AND AWS',
        help: "Leave empty to build from scratch. Fill it in to get it checked and fixed.",
      },
      {
        name: "location",
        label: "Location (optional)",
        type: "text",
        maxLength: 120,
        placeholder: "e.g. Pune, Bengaluru, Remote India, Dallas TX",
      },
    ],
    submitLabel: "Build my strings",
    teaches: "Masterclass Day 2 — Boolean search",
    howIBuilt: [
      "Designed by Rattan from the Boolean method taught on Day 2 of the Masterclass.",
      "Built with Claude on the RTechX website; the AI is told each platform's rules (Naukri, LinkedIn, Google) so strings are written for where you will paste them.",
      "Every string comes with a block-by-block explanation, because a string you understand is a string you can fix.",
      "Nothing you paste is stored.",
    ],
  },
  {
    slug: "rate-calculator",
    number: 3,
    name: "Rate & CTC Calculator",
    phase: 1,
    short: "US bill rate, pay rate, markup and margin. India hike %, monthly CTC and joining date.",
    intro:
      "The maths every staffing recruiter is asked about: US bill and pay rates, markup versus gross margin, W2 versus C2C, and on the India side, hike percentage, monthly CTC and the joining date after a notice period.",
    usesAI: false,
    cost: 0,
    fields: [],
    submitLabel: "",
    teaches: "Masterclass Day 5 — rate maths",
    howIBuilt: [
      "Designed by Rattan from the rate-maths session on Day 5 of the Masterclass.",
      "Plain formulas, no AI — the numbers are worked out in your browser and never leave it.",
      "Built with Claude on the RTechX website.",
    ],
  },
  {
    slug: "resume-scorecard",
    number: 4,
    name: "Resume Evidence Scorecard",
    phase: 2,
    short: "Score a resume against the JD on recency, depth, scale and ownership — with the evidence quoted.",
    intro:
      "Keyword matching rejects good people and passes weak ones. This scorecard reads a resume against the JD the way Rattan teaches: recency, depth, scale and ownership, quoting the lines it relies on. It advises — you decide.",
    usesAI: true,
    cost: 1,
    privacyNote:
      "Remove the candidate's name, phone, email and address before pasting. Nothing is stored, but you should still only share what the task needs.",
    fields: [
      { ...JD_FIELD, rows: 7 },
      {
        name: "resume",
        label: "Resume text (personal details removed)",
        type: "textarea",
        required: true,
        maxLength: 12000,
        rows: 10,
        placeholder: "Paste the experience and skills sections of the resume.",
      },
    ],
    submitLabel: "Score this resume",
    teaches: "Masterclass Day 2 — screening on evidence",
    howIBuilt: [
      "Designed by Rattan from the 100-point evidence scorecard used in the Masterclass.",
      "Built with Claude; the AI must quote the resume line behind every score, so you can check it.",
      "It never says reject. Screening tools are treated as high-risk under the EU AI Act, and a person must make the decision.",
      "Resume text is used once and not stored.",
    ],
  },
  {
    slug: "screening-kit",
    number: 5,
    name: "Screening Call Kit",
    phase: 2,
    short: "A 20-minute screening script, role-specific questions, what a good answer sounds like, and a scorecard.",
    intro:
      "Walk into the screening call prepared. Get a timed 20-minute structure, questions for each must-have, what a strong and a weak answer sound like, and a simple scorecard to fill in.",
    usesAI: true,
    cost: 1,
    fields: [
      { ...JD_FIELD, rows: 8 },
      {
        name: "candidate",
        label: "What you know about the candidate (optional)",
        type: "textarea",
        maxLength: 2000,
        rows: 4,
        placeholder: "e.g. 5 yrs Java, last 2 yrs on AWS, currently serving notice",
        help: "No names or contact details needed.",
      },
    ],
    submitLabel: "Build my call kit",
    teaches: "Masterclass Day 3 — the 20-minute screening call",
    howIBuilt: [
      "Designed by Rattan from the screening-call structure taught in the Masterclass.",
      "Built with Claude; the AI writes questions only for the must-haves it finds, not a generic list.",
      "Nothing you paste is stored.",
    ],
  },
  {
    slug: "outreach-writer",
    number: 6,
    name: "Outreach & Submission Writer",
    phase: 2,
    short: "Candidate messages for LinkedIn, WhatsApp or email — and the submission note for the hiring manager.",
    intro:
      "Write a first message a candidate will actually read, a polite follow-up, and the submission note a hiring manager reads to the end. Short, specific and honest — no hype.",
    usesAI: true,
    cost: 1,
    fields: [
      { ...JD_FIELD, rows: 6, label: "JD or role summary" },
      {
        name: "highlights",
        label: "Candidate highlights",
        type: "textarea",
        required: true,
        maxLength: 2000,
        rows: 5,
        placeholder: "e.g. 6 yrs Java; led migration to microservices; AWS certified; 30-day notice",
        help: "No names or contact details needed — you add those when you send.",
      },
      {
        name: "channel",
        label: "Outreach channel",
        type: "select",
        required: true,
        maxLength: 40,
        options: ["LinkedIn InMail", "WhatsApp", "Email"],
      },
    ],
    submitLabel: "Write my messages",
    teaches: "Masterclass Day 3 — outreach and submission",
    howIBuilt: [
      "Designed by Rattan from the submission template used in the Masterclass.",
      "Built with Claude; the AI is told to stay short, specific and free of hype, and never to invent facts about the candidate.",
      "Nothing you paste is stored.",
    ],
  },
  {
    slug: "recruiter-copilot",
    number: 7,
    name: "Recruiter Copilot",
    phase: 3,
    short: "An AI agent: paste one JD and get the decode, the search strings and the screening kit in one go.",
    intro:
      "This is a small AI agent. It takes one JD and works through three steps on its own — decode the JD, write the search strings, build the screening kit — passing what it learns from each step to the next.",
    usesAI: true,
    cost: 3,
    fields: [
      JD_FIELD,
      {
        name: "location",
        label: "Location (optional)",
        type: "text",
        maxLength: 120,
        placeholder: "e.g. Bengaluru, Remote India",
      },
    ],
    submitLabel: "Run the Copilot",
    teaches: "1:1 Coaching Track 3 — build your own AI agent",
    howIBuilt: [
      "Designed by Rattan as a working example of what Track 3 of 1:1 Coaching teaches: an agent that chains steps.",
      "Built with Claude. Step 1's output (the must-haves) is fed into steps 2 and 3, which is what makes it an agent rather than three separate prompts.",
      "Uses 3 of your daily runs. Nothing you paste is stored.",
    ],
  },
];

export const toolBySlug = (slug: string) => tools.find((t) => t.slug === slug);

/** Validates a tool's input against its own field definitions. */
export function validateToolInput(
  tool: Tool,
  raw: unknown
): { ok: true; input: Record<string, string> } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Invalid request." };
  }
  const obj = raw as Record<string, unknown>;
  const allowed = new Set(tool.fields.map((f) => f.name));
  for (const key of Object.keys(obj)) {
    if (!allowed.has(key)) return { ok: false, error: "Invalid request." };
  }
  const input: Record<string, string> = {};
  for (const f of tool.fields) {
    const v = obj[f.name];
    const s = typeof v === "string" ? v.trim() : "";
    if (v !== undefined && typeof v !== "string") return { ok: false, error: "Invalid request." };
    if (f.required && !s) return { ok: false, error: `Please fill in: ${f.label}.` };
    if (s.length > f.maxLength) {
      return { ok: false, error: `${f.label} is too long (max ${f.maxLength.toLocaleString("en-IN")} characters).` };
    }
    if (f.type === "select" && s && f.options && !f.options.includes(s)) {
      return { ok: false, error: `Please choose a valid option for ${f.label}.` };
    }
    input[f.name] = s;
  }
  // Boolean builder needs at least one of the two text fields.
  if (tool.slug === "boolean-builder" && !input.jd && !input.existing) {
    return { ok: false, error: "Paste a JD or role description, or a string to fix." };
  }
  return { ok: true, input };
}
