import Link from "next/link";
import { Check, Gift } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { type Course, tierById } from "@/content/courses";
import { formatINR } from "@/lib/utils";

/**
 * Extras beyond the syllabus.
 *
 * Renders only bonuses flagged `available` — one that isn't written yet stays
 * in the content file and stays off the page. If none are available the whole
 * section disappears rather than showing an empty heading.
 *
 * No "total bonus value ₹X" line. Putting a rupee figure on something never
 * sold separately is an invented number, and this brand's position is that
 * every figure on the site is checkable.
 */
export function Bonuses({ course }: { course: Course }) {
  const bonuses = (course.bonuses ?? []).filter((b) => b.available);
  if (bonuses.length === 0) return null;

  const core = tierById(course, "core");

  return (
    <Section id="bonuses" tone="navy">
      <SectionHeading
        eyebrow="Included as well"
        title="What you get beyond the sessions"
        tone="white"
        lead="Not upsells and not teasers — these come with the course."
      />

      <ul className="mt-10 grid gap-5 lg:grid-cols-3">
        {bonuses.map((bonus, i) => (
          <Reveal as="li" key={bonus.id} className="h-full">
            <article className="flex h-full flex-col rounded-card border border-line-navy bg-ink-800/60 p-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-pill border border-line-navy bg-ink px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-cyan">
                <Gift className="size-3.5" aria-hidden="true" />
                Included {i + 1}
              </span>

              <h3 className="mt-5 font-display text-xl font-extrabold leading-snug text-white">
                {bonus.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-300">
                {bonus.body}
              </p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {bonus.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-[0.9375rem] leading-snug text-white">
                    <Check className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </ul>

      {core && (
        <div className="mt-10">
          <Button asChild size="lg" variant="onNavy">
            <Link href={`/checkout/${course.slug}?tier=core`}>
              Save your seat — {formatINR(core.priceINR)}
            </Link>
          </Button>
        </div>
      )}
    </Section>
  );
}
