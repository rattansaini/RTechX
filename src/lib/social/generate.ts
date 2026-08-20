import type { GeneratedContent, PostFormat } from "./types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
// `claude-sonnet-4-6` shipped in this package and is not a real model id —
// every run would have failed with a 404 from the API.
const MODEL = "claude-sonnet-5";

const APPROVED_CTAS = [
  "Explore the curriculum",
  "Reserve your seat",
  "Download the free guide",
  "Learn how the course works",
];

const BANNED_PHRASES = [
  "unlock",
  "supercharge",
  "game-changer",
  "game changer",
  "revolutionary",
  "fast-paced world",
  "secret nobody",
  "guaranteed placement",
  "guaranteed job",
  "seats left",
  "last chance",
  "hurry",
  "limited time",
  "become an expert overnight",
];

const SYSTEM_PROMPT = `You write social content for RTechX, an IT recruitment training brand run by Rattan Saini, a working Talent Acquisition lead based in Gurugram.
Tagline: "Understand Tech. Find Talent. Build Careers." Website: www.rtechx.com

VOICE
- Indian English, sentence case, active voice, short paragraphs.
- Mentor, not salesperson. Practical over motivational.
- Emojis: none on data posts, at most one elsewhere.
- Open with a real observation or problem, teach one idea, close honestly.

HARD RULES — breaking any of these makes the post unusable
1. Every statistic must trace to a named source with a date. If you cannot
   attribute a number to a real, dated, named source, do NOT invent one.
   Describe the trend qualitatively instead and set has_verified_source to false.
2. Never invent testimonials, student counts, placement outcomes or success stories.
3. Never guarantee jobs, salaries or outcomes. No "expert in 30 days".
4. Never manufacture urgency. No seat counts, countdowns or "last chance".
5. The caption CTA must be exactly one of:
   ${APPROVED_CTAS.map((c) => `"${c}"`).join(", ")}
6. Never use: unlock, supercharge, game-changer, revolutionary,
   "in today's fast-paced world", "the secret nobody tells you".

HONESTY OVER POLISH
If the strongest hook would need a statistic you cannot verify, write the weaker
honest version and set has_verified_source to false. A flagged draft is a good
outcome. A fabricated statistic is a brand failure.

OUTPUT
Return raw JSON only. No preamble, no markdown fences, no commentary.

{
  "format": "still" | "reel",
  "angle": "short internal label",
  "eyebrow": "max 24 chars, e.g. 'India IT · FY26'",
  "headline": "max 60 chars, goes on the graphic, 2-3 short lines of meaning",
  "stat_primary": { "value": "+6.1%", "label": "Industry revenue", "sub": "Crossing $315 billion" },
  "stat_secondary": { "value": "+2.3%", "label": "Headcount", "sub": "~1.35 lakh net new jobs" },
  "takeaway": "max 90 chars, the punchline on the graphic",
  "takeaway_highlight": "one word from takeaway to colour in cyan, or null",
  "source_line": "Source: NASSCOM Annual Strategic Review 2026",
  "has_verified_source": true,
  "caption_instagram": "full caption. CTA line ends with 'link in bio'",
  "caption_facebook": "same substance, CTA line uses 'Explore the curriculum: www.rtechx.com'",
  "hashtags": "6-9 tags separated by spaces",
  "alt_text": "plain description of the graphic for screen readers",
  "reel_beats": [ { "t": "0-3s", "text": "on-screen text", "vo": "voiceover line" } ]
}

For "still": reel_beats must be [].
For "reel": provide 5-7 beats totalling 20-30 seconds.
If the post has no meaningful statistics, set stat_primary and stat_secondary to null.`;

export interface GenerateInput {
  format: PostFormat;
  topic: string;
  /** Optional current research pasted in so the model works from fresh material. */
  researchNotes?: string;
}

export async function generateContent(input: GenerateInput): Promise<GeneratedContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const userPrompt = [
    `Format: ${input.format}`,
    `Topic: ${input.topic}`,
    input.researchNotes
      ? `\nCurrent research to work from (use these figures and sources, do not invent others):\n${input.researchNotes}`
      : `\nNo fresh research supplied. If you cannot cite a real, dated source from your own knowledge, write the post qualitatively and set has_verified_source to false.`,
  ].join("\n");

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      // 2000 truncated the JSON mid-object on a long caption, which surfaced as
      // "model did not return valid JSON" — a confusing error for a request that
      // was simply cut off. Output is billed on what is produced, not on the
      // ceiling, so a generous limit costs nothing and removes the failure.
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();

  // Say plainly what happened. A truncated response is not malformed JSON, and
  // debugging it as if it were wastes the time of whoever reads the log next.
  if (data.stop_reason === "max_tokens") {
    throw new Error(
      "The model hit the output limit before finishing the JSON. Raise max_tokens."
    );
  }

  const text = (data.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("")
    .trim();

  const parsed = parseJson(text);
  return applyGuardrails(parsed, input.format);
}

function parseJson(text: string): GeneratedContent {
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as GeneratedContent;
  } catch {
    throw new Error(`Model did not return valid JSON. Got: ${cleaned.slice(0, 300)}`);
  }
}

/**
 * Deterministic second pass. The prompt asks for these rules; this enforces them.
 * Anything questionable flips has_verified_source to false, which routes the
 * draft to manual review rather than publishing.
 */
export function applyGuardrails(c: GeneratedContent, expectedFormat: PostFormat): GeneratedContent {
  const issues: string[] = [];

  if (c.format !== expectedFormat) c.format = expectedFormat;

  const haystack = `${c.headline} ${c.takeaway} ${c.caption_instagram} ${c.caption_facebook}`.toLowerCase();

  for (const phrase of BANNED_PHRASES) {
    if (haystack.includes(phrase)) issues.push(`banned phrase: "${phrase}"`);
  }

  const hasCta = APPROVED_CTAS.some(
    (cta) =>
      c.caption_instagram.toLowerCase().includes(cta.toLowerCase()) ||
      c.caption_facebook.toLowerCase().includes(cta.toLowerCase())
  );
  if (!hasCta) issues.push("no approved CTA found");

  // A numeric claim with no source is the exact failure mode we care about.
  //
  // This used to test for the literal string "source:", which is a check on
  // formatting, not on substance — it flagged "foundit Insights Tracker, July
  // 2026" as unsourced because the model had not typed the prefix, and it would
  // equally have passed a line reading "Source: trust me". Two good posts were
  // thrown away that way before it was noticed.
  //
  // What the brand actually requires is a named publisher *and* a date, so that
  // is what gets checked. Stricter where it counts, indifferent to wording.
  const hasNumbers = /\d+(\.\d+)?\s?(%|percent|crore|lakh|billion|million)/i.test(haystack);
  const source = (c.source_line ?? "").trim();
  const namesPublisher = source.replace(/^source:\s*/i, "").trim().length >= 8;
  const namesDate = /\b(19|20)\d{2}\b|\bFY\s?\d{2}/i.test(source);
  if (hasNumbers && !(namesPublisher && namesDate)) {
    issues.push(
      !source
        ? "numeric claim with no source line at all"
        : !namesDate
          ? `source line names no date: "${source}"`
          : `source line names no publisher: "${source}"`
    );
  }

  // Normalise the prefix once the line has passed, so every graphic reads the
  // same regardless of how the model phrased it.
  // Matches "Sources:" as well as "Source:". Checking only the singular
  // produced "Source: Sources: foundit Insights Tracker…" on a finished
  // graphic — the tidy-up making the thing it was tidying worse.
  if (source && !/^sources?\s*:/i.test(source)) c.source_line = `Source: ${source}`;

  if (c.format === "reel" && (!c.reel_beats || c.reel_beats.length < 4)) {
    issues.push("reel has fewer than 4 beats");
  }

  if (issues.length > 0) {
    c.has_verified_source = false;
    c.angle = `${c.angle} [FLAGGED: ${issues.join("; ")}]`;
  }

  return c;
}
