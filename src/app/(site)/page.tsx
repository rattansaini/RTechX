import { AiObjection } from "@/components/marketing/ai-objection";
import { CataloguePreview } from "@/components/marketing/catalogue-preview";
import { FinalCtaBand } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/faq";
import { FreeResourceBand } from "@/components/marketing/free-resource-band";
import { HomeHero } from "@/components/marketing/hero";
import { InstructorTeaser } from "@/components/marketing/instructor-teaser";
import { PainStrip } from "@/components/marketing/pain-strip";
import { StatBand } from "@/components/marketing/stat-band";
import { WhyRTechX } from "@/components/marketing/why-rtechx";
import type { Metadata } from "next";
import { flagshipCourse } from "@/content/courses";

// Every other page declares its canonical; the homepage was the one that did
// not, which is the page most likely to be reached on several URLs at once
// (rtechx.com, www, trailing slash, and any ?utm_ tail from a campaign).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <StatBand />
      <PainStrip painPoints={flagshipCourse.painPoints} />
      <AiObjection />
      <WhyRTechX />
      <CataloguePreview />
      <InstructorTeaser />
      <FreeResourceBand />
      {/* Short FAQ here; the full set lives on the course page. */}
      <FaqSection
        faqs={flagshipCourse.faqs.slice(0, 5)}
        moreHref={`/courses/${flagshipCourse.slug}#faq`}
      />
      <FinalCtaBand />
    </>
  );
}
