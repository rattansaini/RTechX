import type { Metadata } from "next";
import { CourseCard } from "@/components/marketing/course-card";
import { FinalCtaBand } from "@/components/marketing/cta-band";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Section, SectionHeading } from "@/components/ui/section";
import { comingSoonCourses } from "@/content/courses/coming-soon";
import { liveCourses } from "@/content/courses";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Live online recruitment training from a working talent acquisition specialist. IT Recruitment Masterclass is enrolling now; US Staffing, Bench Sales, Non-IT Recruitment and AI for Recruiters are in development.",
  alternates: { canonical: "/courses" },
};

export default function CoursesPage() {
  return (
    <>
      <Container className="py-12 sm:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">
          RTechX Academy
        </p>
        <h1 className="mt-3 max-w-3xl text-[2rem] font-extrabold leading-[1.12] sm:text-5xl">
          Every course is taught live by someone who still does the job.
        </h1>
        <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-400 sm:text-lg">
          {site.tagline} Nothing here is pre-recorded and resold. When a course
          isn&rsquo;t built yet, we say so rather than taking your money for a
          waitlist.
        </p>
      </Container>

      <Section className="!pt-0">
        <h2 className="sr-only">Enrolling now</h2>
        <div className="space-y-5">
          {liveCourses.map((course) => (
            <Reveal key={course.slug}>
              <CourseCard entry={course} featured />
            </Reveal>
          ))}
        </div>
      </Section>

      {comingSoonCourses.length > 0 && (
        <Section tone="white">
          <SectionHeading
            eyebrow="In development"
            title="What we're building next"
            lead="No dates, no prices, no pre-orders — these are locked until they're genuinely ready. Leave your email and you'll hear the day one opens."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {comingSoonCourses.map((entry) => (
              <Reveal key={entry.slug} className="h-full">
                <CourseCard entry={entry} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <FinalCtaBand />
    </>
  );
}
