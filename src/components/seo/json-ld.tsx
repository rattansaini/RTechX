import type { Course } from "@/content/courses";
import { instructor, site } from "@/lib/site";

/**
 * Structured data.
 *
 * Every field here mirrors something actually on the page. Marking up claims
 * the page doesn't make — ratings, enrolment counts — is what gets rich
 * results revoked, so there is no aggregateRating until real reviews exist.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Content is ours, not user input; the escape guards against a stray
      // "</script>" ever appearing in course copy.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function OrganizationJsonLd() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
  const sameAs = [instructor.linkedin, ...Object.values(site.socials)].filter(
    Boolean
  ) as string[];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: site.name,
        url: base,
        logo: `${base}/brand/rtechx-logo.png`,
        description: site.tagline,
        email: site.supportEmail,
        telephone: `+${site.whatsapp.e164}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Gurugram",
          addressRegion: "Haryana",
          addressCountry: "IN",
        },
        founder: {
          "@type": "Person",
          name: instructor.name,
          jobTitle: instructor.role,
          sameAs: [instructor.linkedin],
        },
        ...(sameAs.length > 0 ? { sameAs } : {}),
      }}
    />
  );
}

export function CourseJsonLd({ course }: { course: Course }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
  const upcoming = course.batches.filter(
    (b) => new Date(b.startDate).getTime() > Date.now()
  );

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description: course.seo.description,
        url: `${base}/courses/${course.slug}`,
        provider: {
          "@type": "EducationalOrganization",
          name: site.name,
          url: base,
        },
        inLanguage: "en-IN",
        teaches: course.outcomes,
        educationalLevel: "Beginner",
        hasCourseInstance: upcoming.map((batch) => ({
          "@type": "CourseInstance",
          courseMode: "Online",
          courseWorkload: course.tiers[0]?.durationLabel,
          startDate: batch.startDate,
          instructor: {
            "@type": "Person",
            name: instructor.name,
            jobTitle: instructor.role,
          },
        })),
        offers: course.tiers.map((tier) => ({
          "@type": "Offer",
          name: tier.name,
          price: tier.priceINR,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `${base}/checkout/${course.slug}?tier=${tier.id}`,
          category: "Paid",
        })),
      }}
    />
  );
}

export function FaqJsonLd({ faqs }: { faqs: readonly { q: string; a: string }[] }) {
  if (faqs.length === 0) return null;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }}
    />
  );
}
