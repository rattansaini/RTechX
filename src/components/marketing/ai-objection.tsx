import Link from "next/link";
import { SourceLine } from "@/components/marketing/stat-band";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { flagshipCourse, tierById } from "@/content/courses";
import { formatINR } from "@/lib/utils";

/**
 * The question every visitor is silently asking before they buy.
 *
 * Sits on its own tinted panel: the pain strip immediately above is navy, so
 * another dark surface here would read as one continuous block rather than a
 * distinct argument. The tint separates it from the navy above and the paper
 * below without introducing a third dark section.
 *
 * Both statistics carry their source directly beneath the sentence they
 * support, in the same component the stat tiles use.
 */
export function AiObjection() {
  const core = tierById(flagshipCourse, "core");

  return (
    <section className="bg-paper py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="rounded-card border border-blue-200 bg-blue-50/60 p-6 sm:p-10 lg:p-14">
            <div className="max-w-3xl">
              <h2 className="text-[1.75rem] font-extrabold leading-[1.15] text-ink sm:text-4xl">
                &ldquo;Won&rsquo;t AI just do this job?&rdquo;
              </h2>

              <p className="mt-5 font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
                It already does part of it.
              </p>

              <div className="mt-8 space-y-6 text-[1.0625rem] leading-relaxed text-ink-400">
                <p>
                  AI now screens resumes, ranks candidates, books interviews and writes
                  the first outreach message. Those were the tasks a fresher used to be
                  hired to do. If your plan was to get a recruiting job by forwarding
                  CVs, that plan is gone.
                </p>

                <div>
                  <p>
                    <strong className="font-semibold text-ink">
                      Here&rsquo;s what didn&rsquo;t change.
                    </strong>{" "}
                    84% of talent leaders plan to use AI in recruiting this year, and 52%
                    are adding autonomous AI agents to their teams &mdash; yet 73% still
                    rank critical thinking as the number one skill they want in a human
                    recruiter, ahead of AI proficiency.
                  </p>
                  <SourceLine
                    source="Korn Ferry, 12th Annual Talent Acquisition Trends, 1,670+ talent leaders"
                    asOf="2026"
                    className="mt-2"
                  />
                </div>

                <p>
                  And this is not just preference. Under the EU AI Act, recruitment tools
                  are classified high-risk and human oversight is a legal requirement.
                  New York City requires bias audits and candidate notice for automated
                  hiring tools. Someone qualified has to review the machine&rsquo;s
                  output. That someone is the job.
                </p>

                <div>
                  <p>
                    <strong className="font-semibold text-ink">
                      There&rsquo;s one more number worth sitting with.
                    </strong>{" "}
                    93% of recruiters plan to increase their AI use in 2026. Only 34% say
                    most of their team can actually use it well.
                  </p>
                  <SourceLine
                    source="LinkedIn research, 19,000 respondents"
                    asOf="2026"
                    className="mt-2"
                  />
                </div>

                <p>
                  That gap between intention and skill is the opening. It is not closed
                  by learning a tool &mdash; the tools change every quarter. It is closed
                  by understanding the technology you hire for well enough to know when
                  the machine is wrong.
                </p>
              </div>

              <p className="mt-8 font-display text-xl font-extrabold leading-snug text-ink sm:text-2xl">
                That is the whole course.
              </p>

              {core && (
                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link href={`/checkout/${flagshipCourse.slug}?tier=core`}>
                      Join the 3-day batch — {formatINR(core.priceINR)}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
