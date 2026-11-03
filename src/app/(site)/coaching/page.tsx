import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { BookingForm } from "@/components/coaching/booking-form";
import { FaqSection } from "@/components/marketing/faq";
import { InstructorTeaser } from "@/components/marketing/instructor-teaser";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section, SectionHeading } from "@/components/ui/section";
import { coaching } from "@/content/coaching";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: coaching.meta.title },
  description: coaching.meta.description,
  alternates: { canonical: "/coaching" },
};

export default function CoachingPage() {
  const c = coaching;

  return (
    <>
      {/* 2.1 Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-field" aria-hidden="true" />
        <Container className="relative py-12 sm:py-20 lg:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">
            {c.hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-[2.125rem] font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
            {c.hero.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-400 sm:text-lg">
            {c.hero.sub}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <a href="#book">{c.hero.primary}</a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#how-it-works">{c.hero.secondary}</a>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-ink-400">
            {c.hero.trust.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="size-4 text-green-ink" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 2.2 Who it's for */}
      <Section tone="white">
        <SectionHeading eyebrow="Who it's for" title="Four people this is built for" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {c.whoFor.map((t) => (
            <Reveal as="li" key={t} className="h-full">
              <div className="h-full rounded-card border border-line bg-paper p-6 text-[1.0625rem] font-semibold leading-snug text-ink">
                {t}
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* 2.3 Tracks */}
      <Section>
        <SectionHeading eyebrow="Tracks" title={c.tracksHeading} />
        <ol className="mt-10 grid gap-5 lg:grid-cols-3">
          {c.tracks.map((t, i) => (
            <Reveal as="li" key={t.title} className="h-full">
              <article className="h-full rounded-card border border-line bg-white p-6">
                <p className="font-mono text-xs text-cyan-ink">Track {i + 1}</p>
                <h3 className="mt-2 text-xl font-bold leading-snug text-ink">{t.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-400">{t.body}</p>
              </article>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* 2.4 How it works */}
      <Section id="how-it-works" tone="white">
        <SectionHeading eyebrow="How it works" title="From one call to a plan built around you" />
        <ol className="mt-10 grid max-w-3xl gap-4">
          {c.steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-card border border-line bg-paper p-5">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-ink font-display text-base font-bold text-white"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-bold leading-snug text-ink">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-400">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* 2.5 What a plan includes + 2.6 Pricing */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Your plan" title="What a custom plan includes" />
            <ul className="mt-8 space-y-3">
              {c.includes.map((t) => (
                <li key={t} className="flex gap-2.5 text-[1.0625rem] text-ink">
                  <Check className="mt-1 size-4 shrink-0 text-green-ink" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Pricing" title="Two prices, both clear" />
            <ul className="mt-8 space-y-4">
              {c.pricing.map((t) => (
                <li
                  key={t}
                  className="rounded-card border border-line bg-white p-5 text-[1.0625rem] leading-relaxed text-ink"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 2.7 Your coach — existing block, as-is */}
      <InstructorTeaser />

      {/* 2.8 Booking */}
      <Section id="book">
        <div className="mx-auto max-w-2xl">
          <SectionHeading title="Book your 20-minute call" />
          <div className="relative mt-8">
            <BookingForm
              paymentsEnabled={isRazorpayConfigured()}
              supportEmail={site.supportEmail}
            />
          </div>
        </div>
      </Section>

      {/* 2.9 FAQ */}
      <FaqSection faqs={c.faqs} title="Questions before you book" />

      {/* 2.10 Final CTA */}
      <section className="on-navy relative overflow-hidden bg-ink">
        <div className="pointer-events-none absolute inset-0 grid-field-navy" aria-hidden="true" />
        <Container className="relative py-16 text-center sm:py-20">
          <h2 className="mx-auto max-w-2xl text-[1.875rem] font-extrabold leading-[1.12] text-white sm:text-4xl">
            {c.finalCta.heading}
          </h2>
          <div className="mt-8">
            <Button asChild size="lg" variant="onNavy">
              <a href="#book">{c.finalCta.button}</a>
            </Button>
          </div>
          <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-ink-300">
            {site.disclaimer}{" "}
            <Link href="/legal/refund-policy" className="underline underline-offset-4">
              Refund policy
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
