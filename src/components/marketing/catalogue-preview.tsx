import Link from "next/link";
import { CourseCard } from "@/components/marketing/course-card";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { comingSoonCourses } from "@/content/courses/coming-soon";
import { liveCourses } from "@/content/courses";

/**
 * The flagship gets a full-width featured row; everything planned sits below it
 * as locked cards. That keeps the catalogue looking like a catalogue while one
 * product carries the revenue.
 */
export function CataloguePreview() {
  const featured = liveCourses[0];
  const rest = liveCourses.slice(1);
  const planned = comingSoonCourses.slice(0, 3);

  return (
    <Section id="courses">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="The catalogue"
          title="One course live. More being built."
          lead="Everything is taught live by a working recruiter. Nothing is pre-recorded and resold."
        />
        <Button asChild variant="secondary" className="hidden sm:inline-flex">
          <Link href="/courses">See all courses</Link>
        </Button>
      </div>

      {featured && (
        <Reveal className="mt-12">
          <CourseCard entry={featured} featured />
        </Reveal>
      )}

      {(rest.length > 0 || planned.length > 0) && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...rest, ...planned].map((entry) => (
            <Reveal key={entry.slug} className="h-full">
              <CourseCard entry={entry} />
            </Reveal>
          ))}
        </div>
      )}

      <div className="mt-8 sm:hidden">
        <Button asChild variant="secondary" full>
          <Link href="/courses">See all courses</Link>
        </Button>
      </div>
    </Section>
  );
}
