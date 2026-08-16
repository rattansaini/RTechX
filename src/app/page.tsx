import { CataloguePreview } from "@/components/marketing/catalogue-preview";
import { FinalCtaBand } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/faq";
import { FreeResourceBand } from "@/components/marketing/free-resource-band";
import { HomeHero } from "@/components/marketing/hero";
import { InstructorTeaser } from "@/components/marketing/instructor-teaser";
import { PainStrip } from "@/components/marketing/pain-strip";
import { WhyRTechX } from "@/components/marketing/why-rtechx";
import { flagshipCourse } from "@/content/courses";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <PainStrip painPoints={flagshipCourse.painPoints} />
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
