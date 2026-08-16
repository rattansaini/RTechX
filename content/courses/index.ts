import { itRecruitmentMasterclass } from "./it-recruitment-masterclass";
import { comingSoonCourses } from "./coming-soon";
import type { CatalogueEntry, Course } from "./types";

/**
 * The course registry.
 *
 * TO ADD COURSE #2: create `content/courses/<slug>.ts` exporting a `Course`,
 * then add the import and one array entry below. Every page that lists or
 * routes courses reads from here — no component needs touching.
 */
export const liveCourses: Course[] = [itRecruitmentMasterclass];

/** Live courses first, then locked cards. Drives /courses. */
export const catalogue: CatalogueEntry[] = [...liveCourses, ...comingSoonCourses];

export function getCourse(slug: string): Course | undefined {
  return liveCourses.find((c) => c.slug === slug);
}

/** Static params for /courses/[slug]. */
export function courseSlugs(): string[] {
  return liveCourses.map((c) => c.slug);
}

/** The one course the brand currently leads with, used by the home hero and nav. */
export const flagshipCourse = itRecruitmentMasterclass;

export * from "./types";
