import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bonuses } from "@/components/course/bonuses";
import { CareerScope } from "@/components/course/career-scope";
import { CourseHero } from "@/components/course/hero";
import { PriceHonesty } from "@/components/course/price-honesty";
import { WorkshopDetails } from "@/components/course/workshop-details";
import {
  Audience,
  CertificatePreview,
  Curriculum,
  InstructorBlock,
  Outcomes,
  Pricing,
  Reviews,
  UpgradeBlock,
  WhatYouGet,
} from "@/components/course/sections";
import { FinalCtaBand } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/faq";
import { PainStrip } from "@/components/marketing/pain-strip";
import { StatBand } from "@/components/marketing/stat-band";
import { StickyCta } from "@/components/marketing/sticky-cta";
import { UrgencyBar } from "@/components/marketing/urgency-bar";
import { CourseJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { TrackView } from "@/components/analytics/track-view";
import { courseSlugs, getCourse, nextBatch, tierById } from "@/content/courses";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return courseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};

  return {
    title: course.seo.title,
    description: course.seo.description,
    keywords: [...course.seo.keywords],
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      title: course.seo.title,
      description: course.seo.description,
      url: `${site.url}/courses/${course.slug}`,
      type: "website",
    },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const batch = nextBatch(course);
  const core = tierById(course, "core");

  return (
    <>
      <TrackView event={{ name: "view_course", courseSlug: course.slug }} />
      <CourseJsonLd course={course} />
      <FaqJsonLd faqs={course.faqs} />

      {/* 1 */}
      <CourseHero course={course} />

      {/* 2 — hides itself entirely when there's no upcoming batch.
          showCountdown is false because the countdown now lives only in the
          sticky bar: two timers on one page compete with each other and read
          as pressure rather than information. This bar keeps the date and the
          seat count. */}
      {batch && (
        <UrgencyBar
          startDate={batch.startDate}
          timeIST={batch.timeIST}
          seats={batch.seats}
          seatsLeft={batch.seatsLeft}
          showCountdown={false}
          showSeatsLeft={course.urgency.showSeatsLeft}
        />
      )}

      <WorkshopDetails course={course} />

      <StatBand />

      {/* 3 */}
      <PainStrip painPoints={course.painPoints} />

      {/* 4 */}
      <Outcomes course={course} />

      {/* 5 */}
      <Curriculum course={course} />

      {/* 6 */}
      <UpgradeBlock course={course} />

      <CareerScope course={course} />

      <Bonuses course={course} />

      <PriceHonesty />

      {/* 7 */}
      <Pricing course={course} />

      {/* 8 */}
      <WhatYouGet course={course} />

      {/* 9 */}
      <Audience course={course} />

      {/* 10 */}
      <InstructorBlock />

      {/* 11 — renders nothing until real testimonials exist */}
      <Reviews />

      {/* 12 */}
      <CertificatePreview course={course} />

      {/* 13 */}
      <FaqSection faqs={course.faqs} title="Everything else you're wondering" />

      <FinalCtaBand />

      {/* 14 */}
      {core && (
        <StickyCta
          courseSlug={course.slug}
          priceINR={core.priceINR}
          startDate={batch?.startDate}
        />
      )}
    </>
  );
}
