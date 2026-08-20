import type { Metadata } from "next";
import { Check, FileText } from "lucide-react";
import { EmailCaptureForm } from "@/components/marketing/lead-capture";
import { BooleanBuilder } from "@/components/marketing/boolean-builder";
import { FinalCtaBand } from "@/components/marketing/cta-band";
import { Container } from "@/components/ui/container";
import { isResourceReady } from "@/lib/resources";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";

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

const moreFree = [
  {
    title: "The Boolean & Intake Field Kit",
    pages: "20 pages",
    href: "/resources/rtechx-boolean-intake-field-kit.pdf",
    body: "The working document, not a summary — the strings and templates themselves, ready to run tonight.",
    points: [
      "35 ready-to-run search strings across every major IT role family",
      "The operator rules that differ platform to platform",
      "The intake, screening and submission templates used in the sessions",
    ],
  },
  {
    title: "The Resume Playbook",
    pages: "16 pages",
    href: "/resources/rtechx-resume-playbook.pdf",
    body: "Written by a working TA lead, so it debunks as much as it teaches — including the 75% ATS auto-rejection figure everybody repeats and nobody sources.",
    points: [
      "Three complete worked recruiter resumes — including one for people with no recruiting experience yet",
      "What eleven role families must prove, and the tell when a resume doesn\u2019t",
      "A twenty-point check to run before you send, and a fifteen-minute tailoring routine",
    ],
  },
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

      {/* The other two, now free as well. They sit below the cheat-sheet rather
          than beside it because the cheat-sheet is the one built to be read in
          four pages on a phone — it converts, and these two reward the reader
          who is already interested. */}
      <Section id="more-free" tone="paper">
        <SectionHeading
          eyebrow="Also free"
          title="Two more, and they are not samples"
          lead="These were student-only until August. They are the full documents, not extracts, and nothing is held back for a paid version."
        />

        <ul className="mt-10 grid gap-5 lg:grid-cols-2">
          {moreFree.map((r) => (
            <Reveal as="li" key={r.href} className="h-full">
              <article className="flex h-full flex-col rounded-card border border-line bg-white p-6">
                <span className="inline-flex w-fit items-center gap-2 rounded-pill border border-line bg-paper px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-400">
                  <FileText className="size-3.5" aria-hidden="true" />
                  {r.pages}
                </span>
                <h3 className="mt-5 font-display text-xl font-extrabold leading-snug text-ink">
                  {r.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-400">{r.body}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {r.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-[0.9375rem] leading-snug text-ink">
                      <Check className="mt-0.5 size-4 shrink-0 text-green-ink" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button asChild variant="secondary" size="md">
                    <a href={r.href} download>
                      Download the PDF
                    </a>
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        <p className="mt-8 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-400">
          No email needed for these two &mdash; the link is the file. The 63-page
          handbook is the one thing that stays with the course, because it is the
          course written down.
        </p>
      </Section>

      <FinalCtaBand />
    </>
  );
}
