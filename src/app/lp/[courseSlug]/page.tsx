import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Award, BookOpen, Check, Radio, ShieldCheck } from "lucide-react";
import { TrackView } from "@/components/analytics/track-view";
import { AttributionCapture } from "@/components/marketing/attribution-capture";
import { BooleanBuilder } from "@/components/marketing/boolean-builder";
import { StickyCta } from "@/components/marketing/sticky-cta";
import { UrgencyBar } from "@/components/marketing/urgency-bar";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { courseSlugs, getCourse, nextBatch, tierById } from "@/content/courses";
import { instructor, nav, site } from "@/lib/site";
import { formatBatchDate, formatINR } from "@/lib/utils";

export function generateStaticParams() {
  return courseSlugs().map((courseSlug) => ({ courseSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) return {};
  return {
    title: course.seo.title,
    description: course.seo.description,
    // Ad landing pages must not compete with the real course page in search.
    robots: { index: false, follow: false },
  };
}

/**
 * Single-purpose ad landing page.
 *
 * No header, no nav, no internal links except the CTA and the legal pages Meta
 * requires. Every element is either proof or the button. The route group split
 * in src/app is what lets this render without the site chrome.
 */
export default async function LandingPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) notFound();

  const core = tierById(course, "core");
  const batch = nextBatch(course);
  if (!core) notFound();

  const checkoutHref = `/checkout/${course.slug}?tier=core`;

  const proofs = [
    { icon: Radio, label: "Live, not recorded" },
    { icon: BookOpen, label: "Recordings + 40-page handbook" },
    { icon: Award, label: "Certificate on completion" },
  ];

  return (
    <>
      <AttributionCapture />
      <TrackView event={{ name: "view_course", courseSlug: course.slug }} />

      <main id="main" className="flex-1">
        {/* Bare brand bar — deliberately not a link. There is no way out but the CTA. */}
        <div className="border-b border-line bg-paper">
          <Container className="flex h-14 items-center gap-2.5">
            <LogoMark priority className="h-7 w-auto" />
            <span className="font-display text-lg font-extrabold tracking-tight text-ink">
              RTech<span className="text-blue">X</span>
            </span>
          </Container>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 grid-field" aria-hidden="true" />
          <Container className="relative py-10 sm:py-14">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <p className="inline-flex items-center gap-2.5 rounded-pill border border-line bg-white px-3.5 py-1.5 text-[0.8125rem] font-medium text-ink-400">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-green opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-green" />
                  </span>
                  Live online
                  {batch && ` · starts ${formatBatchDate(batch.startDate)}`}
                </p>

                <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.08] sm:text-5xl">
                  Become an IT recruiter in{" "}
                  <span className="mark-underline">3 live evenings</span>.
                </h1>

                <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-400 sm:text-lg">
                  You don&rsquo;t need to code. You need to read a tech JD, build the
                  search, and know whether the candidate is real. Taught live by a
                  recruiter who still hires every week &mdash; for{" "}
                  <strong className="text-ink">{formatINR(core.priceINR)}</strong>.
                </p>

                <div className="mt-7">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={checkoutHref}>
                      Book my seat — {formatINR(core.priceINR)}
                    </Link>
                  </Button>
                </div>

                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                  {proofs.map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="flex items-center gap-2 text-[0.9375rem] font-medium text-ink-400"
                    >
                      <Icon className="size-[1.125rem] text-green-ink" aria-hidden="true" />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-5">
                <BooleanBuilder />
              </div>
            </div>
          </Container>
        </section>

        {batch && (
          <UrgencyBar
            startDate={batch.startDate}
            timeIST={batch.timeIST}
            seats={batch.seats}
            seatsLeft={batch.seatsLeft}
            showCountdown={course.urgency.countdownTo === "batch-start"}
            showSeatsLeft={course.urgency.showSeatsLeft}
          />
        )}

        {/* Pain */}
        <section className="on-navy relative overflow-hidden bg-ink text-ink-300">
          <div className="pointer-events-none absolute inset-0 grid-field-navy" aria-hidden="true" />
          <Container className="relative py-12 sm:py-16">
            <h2 className="text-[1.75rem] font-extrabold text-white sm:text-3xl">
              Sound familiar?
            </h2>
            <ul className="mt-8 space-y-2.5">
              {course.painPoints.map((p) => (
                <li
                  key={p.line}
                  className="flex items-start gap-3.5 rounded-card border border-line-navy bg-ink-800/60 px-4 py-3.5"
                >
                  <span className="text-xl" aria-hidden="true">{p.emoji}</span>
                  <span className="text-[1.0625rem] leading-snug text-white">{p.line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 font-display text-xl font-extrabold text-white sm:text-2xl">
              Different problems.{" "}
              <span className="text-gradient-brand">
                One missing skill: understanding the tech.
              </span>
            </p>
          </Container>
        </section>

        {/* Outcomes */}
        <Container className="py-12 sm:py-16">
          <h2 className="text-[1.75rem] font-extrabold sm:text-3xl">
            What you&rsquo;ll be able to do
          </h2>
          <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
            {course.outcomes.slice(0, 6).map((o) => (
              <li
                key={o}
                className="flex gap-3 rounded-card border border-line bg-white p-4 text-[1.0625rem] leading-snug text-ink"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-green-ink" aria-hidden="true" />
                <span>{o}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={checkoutHref}>Book my seat — {formatINR(core.priceINR)}</Link>
            </Button>
          </div>
        </Container>

        {/* Curriculum */}
        <section className="bg-white">
          <Container className="py-12 sm:py-16">
            <h2 className="text-[1.75rem] font-extrabold sm:text-3xl">
              Three evenings, three things you build
            </h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {course.days.slice(0, 3).map((d) => (
                <article
                  key={d.day}
                  className="rounded-card border border-line bg-paper p-5"
                >
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-blue-700">
                    Day {d.day}
                  </p>
                  <h3 className="mt-1.5 text-lg font-bold text-ink">{d.title}</h3>
                  <ul className="mt-3 space-y-1.5">
                    {d.bullets.slice(0, 4).map((b) => (
                      <li key={b} className="flex gap-2 text-[0.9375rem] leading-snug text-ink-400">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-blue-200" aria-hidden="true" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 rounded-field border border-green/25 bg-green/8 p-3 text-[0.875rem] leading-snug text-ink">
                    <strong className="font-semibold">You leave with:</strong>{" "}
                    {d.deliverable}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* Instructor */}
        <Container className="py-12 sm:py-16">
          <div className="flex flex-col gap-6 rounded-card border border-line bg-white p-6 sm:flex-row sm:items-center sm:p-8">
            <Image
              src={instructor.photo}
              alt={`${instructor.name}, ${instructor.role}`}
              width={1000}
              height={1250}
              sizes="160px"
              className="size-32 shrink-0 rounded-card object-cover object-top sm:size-40"
            />
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-cyan-ink">
                Taught by
              </p>
              <p className="mt-1.5 font-display text-xl font-extrabold text-ink">
                {instructor.name}
              </p>
              <p className="mt-0.5 text-[0.9375rem] text-ink-400">
                {instructor.role}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-400">
                {instructor.stats.map((s) => `${s.value} ${s.label}`).join(" · ")}. He
                runs live requirements every week &mdash; this is taught between real
                searches, not from a slide deck.
              </p>
            </div>
          </div>
        </Container>

        {/* Guarantee */}
        {course.guarantee && (
          <Container className="pb-12 sm:pb-16">
            <div className="flex gap-4 rounded-card border border-green/30 bg-green/8 p-6">
              <ShieldCheck className="size-6 shrink-0 text-green-ink" aria-hidden="true" />
              <p className="text-[1.0625rem] leading-relaxed text-ink">
                <strong className="font-semibold">{course.guarantee.label}</strong>{" "}
                {course.guarantee.body}
              </p>
            </div>
          </Container>
        )}

        {/* Objections */}
        <section className="bg-white">
          <Container className="py-12 sm:py-16">
            <h2 className="text-[1.75rem] font-extrabold sm:text-3xl">
              The questions everyone asks
            </h2>
            <div className="mt-8 max-w-2xl">
              <Accordion type="single" collapsible className="space-y-3">
                {course.faqs.slice(0, 5).map((f, i) => (
                  <AccordionItem key={f.q} value={`lp-faq-${i}`}>
                    <AccordionTrigger>{f.q}</AccordionTrigger>
                    <AccordionContent>{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Container>
        </section>

        {/* Close */}
        <section className="on-navy relative overflow-hidden bg-ink">
          <div className="pointer-events-none absolute inset-0 grid-field-navy" aria-hidden="true" />
          <Container className="relative py-14 text-center sm:py-20">
            <h2 className="mx-auto max-w-xl text-[1.875rem] font-extrabold leading-tight text-white sm:text-4xl">
              Three evenings from now, you could be running your own search.
            </h2>
            {batch && (
              <p className="mt-4 text-[1.0625rem] text-ink-300">
                Starts {formatBatchDate(batch.startDate)} · {batch.timeIST}
              </p>
            )}
            <Button asChild size="lg" variant="onNavy" className="mt-8 w-full sm:w-auto">
              <Link href={checkoutHref}>Book my seat — {formatINR(core.priceINR)}</Link>
            </Button>
            <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-ink-300">
              {site.disclaimer}
            </p>
          </Container>
        </section>

        {/* Minimal footer — Meta's ad policy requires a reachable privacy policy,
            and Razorpay requires terms and refund terms. Nothing else. */}
        <footer className="border-t border-line bg-paper">
          <Container className="flex flex-col items-center gap-3 py-8 text-center text-[0.8125rem] text-ink-400 sm:flex-row sm:justify-between sm:text-left">
            <p>
              © {new Date().getFullYear()} {site.legal.entity}
            </p>
            <ul className="flex flex-wrap justify-center gap-x-5">
              {nav.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-block py-1 underline underline-offset-4 hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={`mailto:${site.supportEmail}`} className="inline-block py-1 underline underline-offset-4 hover:text-ink">
                  Contact
                </a>
              </li>
            </ul>
          </Container>
        </footer>
      </main>

      <StickyCta courseSlug={course.slug} priceINR={core.priceINR} label="Book seat" />
    </>
  );
}
