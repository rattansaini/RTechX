import { NextResponse } from "next/server";
import { toolBySlug, validateToolInput } from "@/content/tools";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";
import { AiError, isAiConfigured, type ToolResult } from "@/lib/tools/ai";
import { isSingleTool, runCopilot, runSingleTool } from "@/lib/tools/prompts";
import { accessFor, userIdFromRequest } from "@/lib/tools/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Runs one AI tool for a signed-in user inside their 7 days.
 *
 * The answer is streamed: a space every few seconds keeps the connection
 * alive while Claude works (Netlify allows streamed responses up to 60 s,
 * plain ones far less), then the JSON result is written and the stream
 * closed. The client trims and parses the whole body.
 *
 * Nothing the user pastes is stored. Only {user, tool, units} is logged, for
 * the daily limit.
 */
export async function POST(req: Request) {
  const burst = rateLimit(`tools-run:${clientIp(req)}`, { limit: 12, windowMs: 60_000 });
  if (!burst.ok) return NextResponse.json({ error: "Slow down a little — try again in a minute." }, { status: 429 });

  let body: { tool?: unknown; input?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const tool = typeof body.tool === "string" ? toolBySlug(body.tool) : undefined;
  if (!tool || !tool.usesAI) return NextResponse.json({ error: "Unknown tool." }, { status: 400 });

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "The AI tools are being switched on. Please check back shortly." },
      { status: 503 }
    );
  }

  const access = await accessFor(userIdFromRequest(req));
  if (access.state === "signed-out") {
    return NextResponse.json({ error: "Please sign in to use the toolkit.", code: "signed-out" }, { status: 401 });
  }
  if (access.state === "expired") {
    return NextResponse.json({ error: "Your 7 free days have ended.", code: "expired" }, { status: 403 });
  }
  if (access.usedToday + tool.cost > access.dailyLimit) {
    return NextResponse.json(
      {
        error: `You've used today's ${access.dailyLimit} runs. They reset at midnight (India time).`,
        code: "limit",
      },
      { status: 429 }
    );
  }

  const checked = validateToolInput(tool, body.input);
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });

  const userId = access.user.id;
  const usedBefore = access.usedToday;
  const input = checked.input;
  const slug = tool.slug;
  const cost = tool.cost;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const keepAlive = setInterval(() => controller.enqueue(encoder.encode(" ")), 3000);
      let payload: { result?: ToolResult; error?: string; usedToday?: number };
      try {
        const result =
          slug === "recruiter-copilot"
            ? await runCopilot(input)
            : isSingleTool(slug)
              ? await runSingleTool(slug, input)
              : null;
        if (!result) throw new AiError("Unknown tool.");
        await supabaseAdmin().from("tool_usage").insert({ user_id: userId, tool: slug, units: cost });
        payload = { result, usedToday: usedBefore + cost };
      } catch (err) {
        if (!(err instanceof AiError)) console.error("[tools run] failed:", err);
        payload = { error: err instanceof AiError ? err.message : "Something went wrong. Please try again." };
      } finally {
        clearInterval(keepAlive);
      }
      controller.enqueue(encoder.encode(JSON.stringify(payload)));
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
