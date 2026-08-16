import Link from "next/link";
import { Award, BookOpen, PlayCircle, Radio, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { type Course, tierById } from "@/content/courses";
import { formatINR } from "@/lib/utils";

const chipIcons = [Timer, Radio, BookOpen, Award];

export function CourseHero({ course }: { course: Course }) {
  const core = tierById(course, "core");
  const full = tierById(course, "full");

  const chips = [
    core?.durationLabel.replace(" · Live", "") ?? null,
    "Live online",
    "Handbook + templates",
    "Certificate",
  ].filter(Boolean) as string[];

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-field" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(0,168,240,0.14),transparent_65%)] blur-2xl"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-start gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:py-20">
          {/* Without a trailer there is nothing to sit beside, so the copy takes
              the full width rather than leaving five dead columns and forcing
              the H1 into six lines. */}
          <div className={course.trailerUrl ? "lg:col-span-7" : "lg:col-span-11"}>
            <h1 className="text-[2rem] font-extrabold leading-[1.1] sm:text-[2.75rem] lg:text-[3.25rem]">
              {course.hookLine}
            </h1>

            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-400 sm:text-lg">
              {course.subHook}
            </p>

            <ul className="mt-7 flex flex-wrap gap-2">
              {chips.map((chip, i) => {
                const Icon = chipIcons[i] ?? Timer;
                return (
                  <li
                    key={chip}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-white px-3 py-1.5 text-[0.8125rem] font-medium text-ink-400"
                  >
                    <Icon className="size-3.5 text-blue" aria-hidden="true" />
                    {chip}
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {core && (
                <Button asChild size="lg">
                  <Link href={`/checkout/${course.slug}?tier=core`}>
                    Join for {formatINR(core.priceINR)}
                  </Link>
                </Button>
              )}
              {full && (
                <Button asChild size="lg" variant="secondary">
                  <Link href={`/checkout/${course.slug}?tier=full`}>
                    Get the 5-day version — {formatINR(full.priceINR)}
                  </Link>
                </Button>
              )}
            </div>

            {course.guarantee && (
              <p className="mt-5 text-[0.9375rem] font-medium text-green-ink">
                {course.guarantee.label}
              </p>
            )}
          </div>

          {/* Trailer slot. Renders nothing at all when no trailer exists — no
              placeholder frame, no "video coming soon". */}
          {course.trailerUrl && (
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-card border border-line bg-ink shadow-[0_24px_60px_-24px_rgba(10,31,68,0.45)]">
                <div className="relative aspect-video">
                  <iframe
                    src={course.trailerUrl}
                    title={`${course.title} — course trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 size-full"
                  />
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 font-mono text-[0.6875rem] text-ink-400">
                <PlayCircle className="size-3.5" aria-hidden="true" />
                60-second walkthrough
              </p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
