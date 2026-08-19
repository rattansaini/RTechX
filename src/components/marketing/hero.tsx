import Link from "next/link";
import { Award, BookOpen, Radio } from "lucide-react";
import { BooleanBuilder } from "@/components/marketing/boolean-builder";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { flagshipCourse, nextBatch, tierById } from "@/content/courses";
import { formatBatchDate, formatINR } from "@/lib/utils";

const microProofs = [
  { icon: Radio, label: "Live, not recorded" },
  { icon: BookOpen, label: "Recordings + 60+ page handbook" },
  { icon: Award, label: "Certificate on completion" },
];

export function HomeHero() {
  const batch = nextBatch(flagshipCourse);
  const core = tierById(flagshipCourse, "core");
  const corePrice = core ? formatINR(core.priceINR) : null;

  return (
    <section className="relative overflow-hidden">
      {/* Quiet dashboard field + one soft brand glow. Nothing else decorative. */}
      <div className="pointer-events-none absolute inset-0 grid-field" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(34,199,230,0.16),transparent_65%)] blur-2xl"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
          {/* Copy — deliberately not motion-wrapped: the H1 is the LCP element
              and must paint on the first frame. */}
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2.5 rounded-pill border border-line bg-white px-3.5 py-1.5 text-[0.8125rem] font-medium text-ink-400 shadow-[0_1px_2px_rgba(10,31,68,0.04)]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-green" />
              </span>
              Live online
              {batch && ` · Next batch ${formatBatchDate(batch.startDate)}`}
            </p>

            <h1 className="mt-6 text-[2.125rem] leading-[1.08] font-extrabold sm:text-5xl lg:text-[3.5rem]">
              Learn IT recruitment from someone who{" "}
              <span className="mark-underline">still hires every day</span>.
            </h1>

            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-400 sm:text-lg">
              AI took the entry-level recruiting job. This is how you get the one it
              can&rsquo;t do.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link href={`/checkout/${flagshipCourse.slug}?tier=core`}>
                  Join the 3-day batch{corePrice && ` — ${corePrice}`}
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={`/courses/${flagshipCourse.slug}#curriculum`}>
                  See what&rsquo;s inside
                </Link>
              </Button>
            </div>

            <ul
              className="rise mt-8 flex flex-wrap gap-x-6 gap-y-3"
              style={{ "--rise-delay": "180ms" } as React.CSSProperties}
            >
              {microProofs.map(({ icon: Icon, label }) => (
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

          <div
            className="rise lg:col-span-5"
            style={{ "--rise-delay": "120ms" } as React.CSSProperties}
          >
            <BooleanBuilder />
          </div>
        </div>
      </Container>
    </section>
  );
}
