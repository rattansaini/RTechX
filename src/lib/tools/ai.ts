import "server-only";
import { z } from "zod";

/**
 * Calls Claude through the Messages API with plain fetch (no SDK, so no new
 * dependency). Every tool asks for the same JSON shape, which the page renders
 * with one component.
 */

export const DEFAULT_MODEL = "claude-haiku-5-5";

export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const codeSchema = z.object({ label: z.string().max(120), value: z.string().max(4000) });
const tableSchema = z.object({
  headers: z.array(z.string().max(120)).min(1).max(8),
  rows: z.array(z.array(z.string().max(1200)).max(8)).max(30),
});

export const sectionSchema = z.object({
  heading: z.string().max(160),
  text: z.string().max(3000).optional(),
  bullets: z.array(z.string().max(1200)).max(25).optional(),
  code: z.array(codeSchema).max(8).optional(),
  table: tableSchema.optional(),
});

export const resultSchema = z.object({
  title: z.string().max(200),
  summary: z.string().max(1500).optional(),
  sections: z.array(sectionSchema).min(1).max(14),
  note: z.string().max(800).optional(),
});

export type ToolResult = z.infer<typeof resultSchema>;

export const OUTPUT_RULES = `
Reply with ONE JSON object and nothing else — no markdown fences, no text before or after it.
Shape:
{"title": string, "summary": string (2–3 sentences), "sections": [{"heading": string, "text"?: string, "bullets"?: string[], "code"?: [{"label": string, "value": string}], "table"?: {"headers": string[], "rows": string[][]}}], "note"?: string}
Use "code" only for search strings or text the user will copy. Keep tables to 6 columns or fewer.
House rules (RTechX):
- Indian English, short sentences, plain words. Explain jargon the first time.
- Never invent facts about a candidate, company, salary or market. If something is not in the input, say it is not stated.
- Never promise outcomes (jobs, placements, salaries).
- Never suggest judging anyone on age, gender, religion, caste, marital status, nationality, disability or photo.
- You advise; the recruiter decides.`.trim();

export class AiError extends Error {}

export async function callClaude(opts: { system: string; user: string; maxTokens?: number }): Promise<ToolResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new AiError("The AI tools aren't switched on yet.");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 2200,
      system: `${opts.system}\n\n${OUTPUT_RULES}`,
      messages: [{ role: "user", content: opts.user }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[tools ai] Claude API error", res.status, detail.slice(0, 500));
    if (res.status === 429 || res.status === 529) throw new AiError("The AI is busy right now. Please try again in a minute.");
    throw new AiError("The AI couldn't answer just now. Please try again.");
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  return parseResult(text);
}

/** Pulls the JSON object out of the reply and validates it. */
export function parseResult(text: string): ToolResult {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new AiError("The AI's answer came back incomplete. Please try again.");
  let json: unknown;
  try {
    json = JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new AiError("The AI's answer came back incomplete. Please try again.");
  }
  const parsed = resultSchema.safeParse(json);
  if (!parsed.success) {
    console.error("[tools ai] result failed schema:", parsed.error.issues.slice(0, 3));
    throw new AiError("The AI's answer came back in the wrong shape. Please try again.");
  }
  return parsed.data;
}

/** Wraps user-supplied text so instructions inside it are treated as data. */
export function block(label: string, value: string) {
  return `<${label}>\n${value || "(not provided)"}\n</${label}>`;
}
