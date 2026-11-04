import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Sparkles } from "lucide-react";
import { AccountBar } from "@/components/tools/account-bar";
import { BuildYourOwn, TrialEnded } from "@/components/tools/blocks";
import { ToolsSignIn } from "@/components/tools/sign-in";
import { Container } from "@/components/ui/container";
import { Section, SectionHeading } from "@/components/ui/section";
import { TOOLS_DAILY_LIMIT, TOOLS_TRIAL_DAYS, tools } from "@/content/tools";
import { currentAccess } from "@/lib/tools/session";

export const metadata: Metadata = {
  title: { absolute: "Free Recruiter Toolkit — RTechX" },
  description:
    "Seven recruiter tools built by Rattan Saini: JD Decoder, Boolean Builder for LinkedIn, Naukri and X-ray, Rate & CTC Calculator, Resume Evidence Scorecard and more. Free for 7 days.",
  alternates: { canonical: "/tools" },
};

export const dynamic = "force-dynamic";

const PHASES: Record<number, string> = {
  1: "Read the JD, find the people, do the maths",
  2: "Screen and submit",
  3: "The agent",
};

export default async function ToolsPage() {
  const access = await currentAccess();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-field" aria-hidden="true" />
        <Container className="relative py-12 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">
            Free Recruiter Toolkit · Built by Rattan
          </p>
          <h1 className="mt-4 max-w-3xl text-[2.125rem] font-extrabold leading-[1.08] sm:text-5xl">
            Seven recruiter tools. Each one teaches while it works.
          </h1>
          <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-400 sm:text-lg">
            Decode a tech JD, build Boolean for LinkedIn, Naukri and X-ray, work out rates and CTC, and score resumes on
            evidence. Free for {TOOLS_TRIAL_DAYS} days after you sign in — up to {TOOLS_DAILY_LIMIT} AI runs a day.
          </p>

          <div className="mt-8 max-w-3xl">
            {access.state === "active" && (
              <AccountBar email={access.user.email} daysLeft={access.daysLeft} endsAt={access.endsAt} />
            )}
            {access.state === "expired" && <TrialEnded />}
            {access.state === "signed-out" && (
              <div className="max-w-xl">
                <ToolsSignIn />
              </div>
            )}
          </div>
        </Container>
      </section>

      {[1, 2, 3].map((phase) => (
        <Section key={phase} tone={phase === 2 ? "white" : "paper"} containerClassName="py-12 sm:py-16">
          <SectionHeading eyebrow={`Part ${phase}`} title={PHASES[phase]} />
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tools
              .filter((t) => t.phase === phase)
              .map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/tools/${t.slug}`}
                    className="group flex h-full flex-col rounded-card border border-line bg-white p-6 transition-colors hover:border-blue-200"
                  >
                    <p className="flex items-center gap-2 font-mono text-xs text-cyan-ink">
                      {t.usesAI ? <Sparkles className="size-3.5" aria-hidden="true" /> : <Calculator className="size-3.5" aria-hidden="true" />}
                      Tool {t.number} · {t.usesAI ? "AI" : "No AI"}
                    </p>
                    <h3 className="mt-2 text-xl font-bold leading-snug text-ink">{t.name}</h3>
                    <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-400">{t.short}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-blue-700">
                      Open tool <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </Section>
      ))}

      <Section tone="white" containerClassName="py-12 sm:py-16">
        <BuildYourOwn />
      </Section>
    </>
  );
}
