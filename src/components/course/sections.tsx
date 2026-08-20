import Link from "next/link";
import { ArrowRight, Check, Package, ShieldCheck, Target, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import {
  activePriceRise,
  type Course,
  resolvedIncludes,
  type Tier,
  tierById,
} from "@/content/courses";
import { testimonials } from "@/content/testimonials";
import { LogoMark } from "@/components/brand/logo";
import { instructor } from "@/lib/site";
import { formatBatchDate, formatINR } from "@/lib/utils";
import Image from "next/image";

/* ------------------------------------------------------------------ 4 */

export function Outcomes({ course }: { course: Course }) {
  return (
    <Section id="outcomes">
      <SectionHeading
        eyebrow="Outcomes"
        title="What you'll be able to do"
        lead="Not topics covered — things you can do on Monday morning."
      />
      <ul className="mt-10 grid gap-4 lg:grid-cols-2">
        {course.outcomes.map((o) => (
          <Reveal as="li" key={o}>
            <div className="flex h-full gap-3.5 rounded-card border border-line bg-white p-5">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-green/12 text-green-ink">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-[1.0625rem] leading-snug text-ink">{o}</span>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ 5 */

export function Curriculum({ course }: { course: Course }) {
  const coreDays = course.days.filter((d) => d.day <= 3);

  return (
    <Section id="curriculum" tone="white">
      <SectionHeading
        eyebrow="Curriculum"
        title="Three evenings, three deliverables"
        lead="Every day ends with something you built, not something you watched."
      />

      <div className="mt-10 max-w-4xl">
        <Accordion type="single" collapsible defaultValue="day-1" className="space-y-3">
          {coreDays.map((d) => (
            <AccordionItem key={d.day} value={`day-${d.day}`}>
              <AccordionTrigger>
                <span className="flex flex-col gap-1 text-left sm:flex-row sm:items-baseline sm:gap-3">
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-blue-700">
                    Day {d.day}
                  </span>
                  <span>{d.title}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {d.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-200"
                        aria-hidden="true"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 flex gap-2.5 rounded-field border border-green/25 bg-green/8 p-4 text-[0.9375rem] text-ink">
                  <Package className="mt-0.5 size-4 shrink-0 text-green-ink" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold">You&rsquo;ll walk out with:</strong>{" "}
                    {d.deliverable}
                  </span>
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ 6 */

export function UpgradeBlock({ course }: { course: Course }) {
  const specialisationDays = course.days.filter((d) => d.day > 3);
  if (specialisationDays.length === 0) return null;

  return (
    // text-ink-300 is required, not decorative: without it the list bullets
    // inherit --color-ink and render navy-on-navy.
    <section
      id="upgrade"
      className="on-navy relative overflow-hidden bg-ink text-ink-300"
    >
      <div className="pointer-events-none absolute inset-0 grid-field-navy" aria-hidden="true" />
      <Container className="relative py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="The upgrade"
          title="Theory is day 1–3. Days 4 & 5 are the job."
          lead={
            <>
              Two extra live days, screen-shared, focused on the only two markets
              that pay Indian recruiters: <strong className="text-white">India and US</strong>.
            </>
          }
          tone="white"
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {specialisationDays.map((d) => (
            <Reveal key={d.day}>
              <article className="h-full rounded-card border border-line-navy bg-ink-800 p-6 sm:p-7">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-cyan">
                  Day {d.day}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">{d.title}</h3>
                <ul className="mt-5 space-y-2.5">
                  {d.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-[0.9375rem] leading-snug">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan"
                        aria-hidden="true"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-10 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          You watch it happen, then you{" "}
          <span className="text-gradient-brand">do it while we watch.</span>
        </p>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ 7 */

function tierRows(course: Course) {
  const all: string[] = [];
  for (const t of course.tiers)
    for (const i of resolvedIncludes(course, t)) if (!all.includes(i)) all.push(i);
  return all;
}

export function Pricing({ course }: { course: Course }) {
  const rise = activePriceRise(course);

  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        title="Two ways in"
        lead={course.marketAnchorNote}
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {course.tiers.map((t) => (
          <Reveal key={t.id} className="h-full">
            <TierCard course={course} tier={t} />
          </Reveal>
        ))}
      </div>

      {/* Row-by-row tick matrix */}
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="sr-only">
            What each tier includes, compared row by row
          </caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-3 pr-4 text-[0.9375rem] font-semibold text-ink">
                What&rsquo;s included
              </th>
              {course.tiers.map((t) => (
                <th
                  key={t.id}
                  scope="col"
                  className="w-32 py-3 text-center text-[0.9375rem] font-semibold text-ink"
                >
                  {formatINR(t.priceINR)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tierRows(course).map((row) => (
              <tr key={row} className="border-b border-line/70">
                <th
                  scope="row"
                  className="py-3 pr-4 text-[0.9375rem] font-normal text-ink-400"
                >
                  {row}
                </th>
                {course.tiers.map((t) => {
                  const has = resolvedIncludes(course, t).includes(row);
                  return (
                    <td key={t.id} className="py-3 text-center">
                      {has ? (
                        <>
                          <Check
                            className="mx-auto size-4 text-green-ink"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Included</span>
                        </>
                      ) : (
                        <>
                          <X className="mx-auto size-4 text-line" aria-hidden="true" />
                          <span className="sr-only">Not included</span>
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 space-y-3">
        <p className="text-[0.9375rem] text-ink-400">
          Already joined the 3-day batch?{" "}
          <Link
            href={`/checkout/${course.slug}?tier=full&upgrade=true`}
            className="font-semibold text-blue-700 underline underline-offset-4 hover:text-blue"
          >
            Upgrade later for the difference.
          </Link>
        </p>
        {rise && (
          <p className="text-[0.9375rem] font-medium text-ink">
            {formatINR(
              course.tiers.find((t) => t.id === rise.appliesToTierId)?.priceINR ?? 0
            )}{" "}
            applies until {formatBatchDate(rise.effectiveFrom)}, then{" "}
            {formatINR(rise.newPriceINR)}.
          </p>
        )}
      </div>
    </Section>
  );
}

function TierCard({ course, tier }: { course: Course; tier: Tier }) {
  const parent = tier.inheritsFrom ? tierById(course, tier.inheritsFrom) : undefined;
  const parentName = parent?.durationLabel.startsWith("3 days")
    ? "3-day masterclass"
    : parent?.name;

  return (
    <article
      className={cnTier(tier.highlight)}
      aria-labelledby={`tier-${tier.id}-name`}
    >
      {tier.highlight && (
        <span className="absolute -top-3 left-6 rounded-pill bg-blue px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-white">
          Most popular
        </span>
      )}

      <h3 id={`tier-${tier.id}-name`} className="text-lg font-bold text-ink">
        {tier.name}
      </h3>
      <p className="mt-1 font-mono text-[0.6875rem] text-ink-400">{tier.durationLabel}</p>

      <p className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-4xl font-extrabold text-ink">
          {formatINR(tier.priceINR)}
        </span>
        {tier.compareAtINR && (
          <span className="text-lg text-ink-400 line-through">
            {formatINR(tier.compareAtINR)}
          </span>
        )}
      </p>

      <ul className="mt-6 flex-1 space-y-2.5">
        {parentName && (
          <li className="flex gap-2.5 text-[0.9375rem] leading-snug font-semibold text-ink">
            <Check className="mt-0.5 size-4 shrink-0 text-green-ink" aria-hidden="true" />
            <span>Everything in the {parentName}</span>
          </li>
        )}
        {tier.includes.map((i) => (
          <li key={i} className="flex gap-2.5 text-[0.9375rem] leading-snug text-ink-400">
            <Check className="mt-0.5 size-4 shrink-0 text-green-ink" aria-hidden="true" />
            <span>{i}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        size="lg"
        full
        variant={tier.highlight ? "primary" : "secondary"}
        className="mt-7"
      >
        <Link href={`/checkout/${course.slug}?tier=${tier.id}`}>
          Join for {formatINR(tier.priceINR)}
        </Link>
      </Button>
    </article>
  );
}

function cnTier(highlight?: boolean) {
  return [
    "relative flex h-full flex-col rounded-card border bg-white p-6 sm:p-7",
    highlight
      ? "border-blue shadow-[0_20px_50px_-24px_rgba(0,96,240,0.5)]"
      : "border-line",
  ].join(" ");
}

/* ------------------------------------------------------------------ 8 */

export function WhatYouGet({ course }: { course: Course }) {
  return (
    <Section id="whats-included" tone="white">
      <SectionHeading
        eyebrow="What you get"
        title="Everything included"
        lead="No upsells, no locked bonus tiers. This is the whole list."
      />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {course.inclusions.map((inc) => (
          <Reveal as="li" key={inc.title}>
            <div className="h-full rounded-card border border-line bg-paper p-5">
              <h3 className="text-[1.0625rem] font-bold text-ink">{inc.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-400">
                {inc.detail}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>

      {course.guarantee && (
        <div className="mt-8 flex gap-4 rounded-card border border-green/30 bg-green/8 p-6">
          <ShieldCheck className="size-6 shrink-0 text-green-ink" aria-hidden="true" />
          <div>
            <h3 className="text-[1.0625rem] font-bold text-ink">
              {course.guarantee.label}
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-400">
              {course.guarantee.body}
            </p>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ 9 */

export function Audience({ course }: { course: Course }) {
  return (
    <Section id="who-its-for">
      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal className="h-full">
          <div className="h-full rounded-card border border-line bg-white p-6 sm:p-7">
            <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink">
              <Target className="size-5 text-green-ink" aria-hidden="true" />
              Who this is for
            </h2>
            <ul className="mt-5 space-y-3">
              {course.forWhom.map((f) => (
                <li key={f} className="flex gap-2.5 text-[1.0625rem] leading-snug text-ink">
                  <Check
                    className="mt-1 size-4 shrink-0 text-green-ink"
                    aria-hidden="true"
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal className="h-full">
          <div className="h-full rounded-card border border-line bg-paper p-6 sm:p-7">
            <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink">
              <X className="size-5 text-ink-400" aria-hidden="true" />
              Who it&rsquo;s not for
            </h2>
            <ul className="mt-5 space-y-3">
              {course.notForWhom.map((f) => (
                <li
                  key={f}
                  className="flex gap-2.5 text-[1.0625rem] leading-snug text-ink-400"
                >
                  <X className="mt-1 size-4 shrink-0 text-ink-400" aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ 10 */

export function InstructorBlock() {
  return (
    <Section id="instructor" tone="white">
      <div className="grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="overflow-hidden rounded-card border border-line bg-paper">
            <Image
              src={instructor.photo}
              alt={`${instructor.name}, ${instructor.role}`}
              width={1000}
              height={1250}
              sizes="(min-width: 1024px) 340px, 90vw"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-8">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">
            Who&rsquo;s teaching
          </p>
          <h2 className="mt-3 text-[1.75rem] font-extrabold sm:text-4xl">
            {instructor.name}
          </h2>
          <p className="mt-2 text-[1.0625rem] text-ink-400">
            {instructor.role}
          </p>

          <dl className="mt-7 grid grid-cols-3 gap-3">
            {instructor.stats.map((s) => (
              <div key={s.label} className="rounded-card border border-line bg-paper px-4 py-4">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-2xl font-extrabold text-ink">
                    {s.value}
                  </span>
                  <span className="mt-1 block text-[0.8125rem] leading-snug text-ink-400">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-7 text-[1.0625rem] leading-relaxed text-ink-400">
            Rattan runs live tech requirements every week from Gurugram — the same
            JDs, the same hiring managers, the same rejections you&rsquo;ll learn to
            avoid. He built this course out of what he kept having to explain to
            new recruiters on his own team, which is why it starts at the JD and
            ends at a submission rather than at a definition of &ldquo;sourcing&rdquo;.
          </p>

          <a
            href={instructor.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 py-1 text-[0.9375rem] font-semibold text-blue-700 hover:text-blue"
          >
            Verify on LinkedIn
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ 11 */

/**
 * Renders nothing while `testimonials` is empty. No placeholder cards, no
 * sample quotes — an empty proof slot shows no section at all.
 */
export function Reviews() {
  if (testimonials.length === 0) return null;

  return (
    <Section id="reviews">
      <SectionHeading eyebrow="Reviews" title="What people said afterwards" />
      <ul className="mt-10 grid gap-5 lg:grid-cols-3">
        {testimonials.map((t) => (
          <Reveal as="li" key={`${t.name}-${t.role}`}>
            <figure className="h-full rounded-card border border-line bg-white p-6">
              <blockquote className="text-[1.0625rem] leading-relaxed text-ink">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-5">
                {t.photo && (
                  <Image
                    src={t.photo}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                )}
                <span>
                  <span className="block text-[0.9375rem] font-semibold text-ink">
                    {t.name}
                  </span>
                  <span className="block text-[0.8125rem] text-ink-400">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ 12 */

export function CertificatePreview({ course }: { course: Course }) {
  return (
    <Section id="certificate">
      <SectionHeading
        eyebrow="Certificate"
        title="Issued on completion"
        lead="Attend every live day of the option you booked — 3 days, or 5 on the ₹999 option — and your certificate is issued in your name. A recording counts as attending."
      />

      <Reveal className="mt-10">
        <div className="mx-auto max-w-2xl rounded-card border border-line bg-white p-6 shadow-[0_20px_50px_-28px_rgba(10,31,68,0.35)] sm:p-10">
          <div className="rounded-field border-2 border-blue-200 p-6 text-center sm:p-10">
            <LogoMark className="mx-auto h-9 w-auto" />
            <p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink-400">
              Certificate of completion
            </p>
            <p className="mt-6 text-[0.9375rem] text-ink-400">This is to certify that</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              [Your Name]
            </p>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-400">
              has completed the{" "}
              <span className="font-semibold text-ink">{course.title}</span>, a live
              online programme covering JD decoding, Boolean sourcing, evidence-based
              screening and candidate submission.
            </p>
            <div className="mt-8 flex items-end justify-between gap-6 border-t border-line pt-5 text-left">
              <span>
                <span className="block font-display text-base font-bold text-ink">
                  {instructor.name}
                </span>
                <span className="block font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-400">
                  Instructor
                </span>
              </span>
              <span className="text-right">
                <span className="block font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-400">
                  RTechX Academy
                </span>
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
