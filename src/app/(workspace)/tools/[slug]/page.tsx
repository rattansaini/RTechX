import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Hammer } from "lucide-react";
import { TrialEnded } from "@/components/tools/blocks";
import { RateCalculator } from "@/components/tools/rate-calculator";
import { ToolsSignIn } from "@/components/tools/sign-in";
import { ToolIcon } from "@/components/tools/tool-icons";
import { ToolRunner } from "@/components/tools/tool-runner";
import { TOOLS_TRIAL_DAYS, toolBySlug, tools } from "@/content/tools";
import { isAiConfigured } from "@/lib/tools/ai";
import { currentAccess } from "@/lib/tools/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool) return {};
  return {
    title: { absolute: `${tool.name} — free recruiter tool · RTechX` },
    description: tool.short,
    alternates: { canonical: `/tools/${tool.slug}` },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool) notFound();

  const access = await currentAccess();
  const aiReady = isAiConfigured();
  const next = tools.find((t) => t.number === tool.number + 1);

  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Tool header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-ink text-cyan shadow-[0_8px_20px_-10px_rgba(10,31,68,0.6)]">
          <ToolIcon slug={tool.slug} className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold leading-tight text-ink sm:text-[1.75rem]">{tool.name}</h1>
            <span className="rounded-pill bg-white px-2.5 py-0.5 text-xs font-semibold text-ink-400 ring-1 ring-line">
              Tool {tool.number} of {tools.length}
            </span>
            <span
              className={
                tool.usesAI
                  ? "rounded-pill bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700"
                  : "rounded-pill bg-white px-2.5 py-0.5 text-xs font-semibold text-ink-400 ring-1 ring-line"
              }
            >
              {tool.usesAI ? (tool.cost > 1 ? `AI agent · ${tool.cost} runs` : "AI") : "No AI · runs in your browser"}
            </span>
          </div>
          <p className="mt-1.5 max-w-3xl text-[0.9375rem] leading-relaxed text-ink-400">{tool.intro}</p>
        </div>
      </div>

      {/* Workspace */}
      <div className="mt-6">
        {access.state === "active" &&
          (!tool.usesAI ? (
            <RateCalculator />
          ) : aiReady ? (
            <ToolRunner slug={tool.slug} usedToday={access.usedToday} dailyLimit={access.dailyLimit} />
          ) : (
            <p className="rounded-[16px] border border-line bg-white p-6 leading-relaxed text-ink">
              The AI tools are being switched on. Please check back shortly — the Rate &amp; CTC Calculator works already.
            </p>
          ))}
        {access.state === "expired" && <TrialEnded />}
        {access.state === "signed-out" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <ToolsSignIn />
            <div className="flex flex-col justify-center rounded-[16px] border border-dashed border-line bg-white/60 p-8 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-[16px] bg-blue-50 text-blue-700">
                <ToolIcon slug={tool.slug} className="size-6" />
              </span>
              <p className="mt-4 font-semibold text-ink">One sign-in opens all {tools.length} tools</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-400">
                Free for {TOOLS_TRIAL_DAYS} days. No password — we email you a 6-digit code.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer strip: how it was built, next tool, build your own */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <details className="group rounded-[16px] border border-line bg-white p-5 lg:col-span-2">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-ink">
            <Hammer className="size-4 text-cyan-ink" aria-hidden="true" />
            How I built this
            <span className="ml-auto text-xs font-normal text-ink-400 group-open:hidden">Show</span>
            <span className="ml-auto hidden text-xs font-normal text-ink-400 group-open:inline">Hide</span>
          </summary>
          <ul className="mt-4 space-y-2">
            {tool.howIBuilt.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink">
                <span className="mt-2 size-1.5 shrink-0 rounded-pill bg-blue" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-400">Mirrors: {tool.teaches}</p>
        </details>

        <div className="flex flex-col gap-3">
          {next && (
            <Link href={`/tools/${next.slug}`} className="group flex items-center gap-3 rounded-[16px] border border-line bg-white p-4 hover:border-blue-200">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-paper text-ink">
                <ToolIcon slug={next.slug} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-ink-400">Next tool</span>
                <span className="block truncate text-sm font-semibold text-ink">{next.name}</span>
              </span>
              <ArrowRight className="size-4 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          )}
          <Link href="/coaching" className="group rounded-[16px] bg-ink p-4 text-ink-300 hover:bg-ink-800">
            <span className="block text-xs text-cyan">1:1 Coaching · Track 3</span>
            <span className="mt-0.5 block text-sm font-semibold text-white">Build a tool like this for your own desk</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
