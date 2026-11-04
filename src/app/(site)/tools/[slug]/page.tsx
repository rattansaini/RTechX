import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AccountBar } from "@/components/tools/account-bar";
import { BuildYourOwn, HowIBuilt, TrialEnded } from "@/components/tools/blocks";
import { RateCalculator } from "@/components/tools/rate-calculator";
import { ToolsSignIn } from "@/components/tools/sign-in";
import { ToolRunner } from "@/components/tools/tool-runner";
import { Container } from "@/components/ui/container";
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
    <Container className="py-10 sm:py-14">
      <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">
        <ArrowLeft className="size-4" aria-hidden="true" /> All tools
      </Link>

      <header className="mt-6 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">
          Tool {tool.number} of {tools.length} · Built by Rattan
        </p>
        <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.1] sm:text-[2.75rem]">{tool.name}</h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-400">{tool.intro}</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          {access.state === "active" && (
            <>
              <AccountBar email={access.user.email} daysLeft={access.daysLeft} endsAt={access.endsAt} />
              {!tool.usesAI ? (
                <RateCalculator />
              ) : aiReady ? (
                <ToolRunner slug={tool.slug} usedToday={access.usedToday} dailyLimit={access.dailyLimit} />
              ) : (
                <p className="rounded-card border border-line bg-white p-6 leading-relaxed text-ink">
                  The AI tools are being switched on. Please check back shortly — the Rate &amp; CTC Calculator works
                  already.
                </p>
              )}
            </>
          )}
          {access.state === "expired" && <TrialEnded />}
          {access.state === "signed-out" && (
            <div className="max-w-xl">
              <ToolsSignIn />
              <p className="mt-3 text-sm text-ink-400">
                One sign-in opens all {tools.length} tools for {TOOLS_TRIAL_DAYS} days.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <HowIBuilt tool={tool} />
          {next && (
            <Link
              href={`/tools/${next.slug}`}
              className="block rounded-card border border-line bg-white p-5 transition-colors hover:border-blue-200"
            >
              <p className="font-mono text-xs text-cyan-ink">Next tool</p>
              <p className="mt-1 font-bold text-ink">{next.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-400">{next.short}</p>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-12">
        <BuildYourOwn />
      </div>
    </Container>
  );
}
