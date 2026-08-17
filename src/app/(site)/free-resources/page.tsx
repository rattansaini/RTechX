import type { Metadata } from "next";
import { Check } from "lucide-react";
import { EmailCaptureForm } from "@/components/marketing/lead-capture";
import { BooleanBuilder } from "@/components/marketing/boolean-builder";
import { FinalCtaBand } from "@/components/marketing/cta-band";
import { Container } from "@/components/ui/container";
import { isResourceReady } from "@/lib/resources";

export const metadata: Metadata = {
  title: "Free Boolean cheat-sheet",
  description:
    "A four-page Boolean search cheat-sheet for recruiters: the six operators, a six-step method, and ten role-family strings you can paste into LinkedIn tonight. Free, no course required.",
  alternates: { canonical: "/free-resources" },
  keywords: ["Boolean search training for recruiters", "boolean cheat sheet recruiters"],
};

const inside = [
  "Every operator that actually matters — AND, OR, NOT, quotes, parentheses — and when each one breaks",
  "The order of operations, which is where most strings silently go wrong",
  "Ten ready strings, including Java backend, frontend React, data engineer, DevOps/cloud and QA automation",
  "How to widen a search that returns nobody, and tighten one that returns everybody",
  "The three mistakes that make LinkedIn quietly ignore half your query",
];

export default function FreeResourcesPage() {
  // Don't promise an instant download until the file actually exists.
  const ready = isResourceReady("boolean-cheatsheet");

  return (
    <>
      <Container className="py-12 sm:py-16">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">
              Free · no course required
            </p>
            <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.12] sm:text-[2.75rem]">
              The Boolean cheat-sheet
            </h1>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-400 sm:text-lg">
              Most recruiters type the job title into LinkedIn and hope. This is the
              one page that fixes that — the operators, the syntax, and five strings
              you can paste in tonight and get better people back.
            </p>

            <ul className="mt-8 space-y-3">
              {inside.map((item) => (
                <li key={item} className="flex gap-3 text-[1.0625rem] leading-snug text-ink">
                  <Check className="mt-1 size-4 shrink-0 text-green-ink" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-9 max-w-lg rounded-card border border-line bg-white p-6">
              <h2 className="text-[1.0625rem] font-bold text-ink">
                Where should we send it?
              </h2>
              <p className="mt-1.5 text-[0.9375rem] text-ink-400">
                {ready
                  ? "One email with the PDF. No drip sequence, unsubscribe any time."
                  : "We're finishing it off — you'll get it the moment it's ready. No drip sequence, unsubscribe any time."}
              </p>
              <EmailCaptureForm
                source="boolean-cheatsheet"
                cta={ready ? "Send the cheat-sheet" : "Email it to me when it's ready"}
                successMessage={
                  ready
                    ? "On its way — check your inbox in a minute."
                    : "You're on the list — we'll email it the moment it's ready."
                }
                className="mt-5"
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <BooleanBuilder />
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-400">
              This is the skill the cheat-sheet teaches, and Day 2 of the masterclass
              is two hours of doing it live against real requirements.
            </p>
          </div>
        </div>
      </Container>

      <FinalCtaBand />
    </>
  );
}
