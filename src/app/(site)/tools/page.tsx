import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { TrialEnded } from "@/components/tools/blocks";
import { BuildStack } from "@/components/tools/build-stack";
import { ToolsSignIn } from "@/components/tools/sign-in";
import { ToolJourney } from "@/components/tools/tool-journey";
import { ToolkitHero } from "@/components/tools/toolkit-hero";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { TOOLS_DAILY_LIMIT, TOOLS_TRIAL_DAYS, tools } from "@/content/tools";
import { currentAccess } from "@/lib/tools/session";

export const metadata: Metadata = {
  title: { absolute: "Free Recruiter Toolkit — RTechX" },
  description:
    "Seven recruiter tools built by Rattan Saini: JD Decoder, Boolean Builder for LinkedIn, Naukri and X-ray, Rate & CTC Calculator, Resume Evidence Scorecard and more. Free for 7 days.",
  alternates: { canonical: "/tools" },
};

export const dynamic = "force-dynamic";

const PROMISES = [
  `All ${tools.length} tools, free for ${TOOLS_TRIAL_DAYS} days from your first sign-in`,
  `Up to ${TOOLS_DAILY_LIMIT} AI runs a day`,
  "No password — we email you a 6-digit code",
  "What you paste is never stored",
  "Delete your account yourself, any time",
];

export default async function ToolsPage() {
  const access = await currentAccess();

  return (
    <>
      <ToolkitHero>
        {access.state === "active" ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" variant="onNavy">
              <Link href="/tools/dashboard">
                Open your dashboard <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <p className="text-sm text-ink-300">
              {access.daysLeft} {access.daysLeft === 1 ? "day" : "days"} of free access left
            </p>
          </div>
        ) : access.state === "expired" ? (
          <p className="text-[0.9375rem] text-white">
            Your 7 free days have ended.{" "}
            <Link href="/coaching" className="font-semibold text-cyan underline underline-offset-4">
              Keep going with 1:1 Coaching
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" variant="onNavy">
              <a href="#sign-in">
                Get all {tools.length} tools free <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <a href="#journey" className="px-2 text-[0.9375rem] font-semibold text-white underline-offset-4 hover:underline">
              See what each tool does
            </a>
          </div>
        )}
      </ToolkitHero>

      {/* The seven tools, in the order a requirement actually moves. */}
      <section id="journey" className="scroll-mt-20 bg-paper">
        <Container className="py-14 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-[1.75rem] font-extrabold leading-[1.15] text-ink sm:text-4xl">
              One requirement, start to finish.
            </h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-400">
              The tools follow a real hiring day: read the JD, find people, check the money, screen, call, reach out.
              Then an AI agent that strings the steps together.
            </p>
          </div>
          <div className="mt-12">
            <ToolJourney />
          </div>
        </Container>
      </section>

      {/* Sign in */}
      <section id="sign-in" className="scroll-mt-20 border-y border-line bg-white">
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-[1.75rem] font-extrabold leading-[1.15] text-ink sm:text-4xl">
              {access.state === "active" ? "You're in." : "Seven days, on the house."}
            </h2>
            <ul className="mt-6 space-y-3">
              {PROMISES.map((p) => (
                <li key={p} className="flex gap-3 text-[1.0625rem] leading-relaxed text-ink">
                  <Check className="mt-1 size-5 shrink-0 text-green-ink" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="max-w-xl">
            {access.state === "active" && (
              <div className="rounded-card border border-line bg-paper p-6 sm:p-8">
                <p className="text-lg font-bold text-ink">Your workspace is ready.</p>
                <p className="mt-2 leading-relaxed text-ink-400">
                  {access.daysLeft} {access.daysLeft === 1 ? "day" : "days"} left · {access.dailyLimit - access.usedToday}{" "}
                  of {access.dailyLimit} runs left today.
                </p>
                <Button asChild size="lg" className="mt-5">
                  <Link href="/tools/dashboard">Open your dashboard</Link>
                </Button>
              </div>
            )}
            {access.state === "expired" && <TrialEnded />}
            {access.state === "signed-out" && <ToolsSignIn redirectTo="/tools/dashboard" />}
          </div>
        </Container>
      </section>

      {/* How they were built — and the offer to teach it */}
      <section className="relative overflow-hidden bg-paper">
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <h2 className="font-display text-[1.75rem] font-extrabold leading-[1.15] text-ink sm:text-4xl">
              Designed by a recruiter. Built with AI.
            </h2>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-400">
              Rattan isn&rsquo;t a software engineer. He took the method he teaches in the Masterclass, wrote it down
              as rules, and built each tool with Claude. Every tool page shows exactly how.
            </p>
            <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-ink">
              You can build one for your own desk too. That&rsquo;s Track 3 of 1:1 Coaching: pick one problem from your
              work, and build the tool for it with Rattan, session by session.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/coaching">
                  Build yours in 1:1 Coaching <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/courses/it-recruitment-masterclass">Learn the method first</Link>
              </Button>
            </div>
          </div>
          <BuildStack />
        </Container>
      </section>
    </>
  );
}
