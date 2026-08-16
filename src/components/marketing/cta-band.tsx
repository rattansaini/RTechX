import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { flagshipCourse, nextBatch, tierById } from "@/content/courses";
import { site } from "@/lib/site";
import { formatBatchDate, formatINR } from "@/lib/utils";

export function FinalCtaBand() {
  const batch = nextBatch(flagshipCourse);
  const core = tierById(flagshipCourse, "core");
  const full = tierById(flagshipCourse, "full");

  return (
    <section className="on-navy relative overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 grid-field-navy" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -bottom-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,168,240,0.18),transparent_65%)] blur-2xl"
        aria-hidden="true"
      />

      <Container className="relative py-16 text-center sm:py-20 lg:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan">
          {site.tagline}
        </p>
        <h2 className="mx-auto mt-5 max-w-2xl text-[1.875rem] font-extrabold leading-[1.12] text-white sm:text-4xl lg:text-[2.75rem]">
          Three evenings from now, you could be running your own search.
        </h2>
        {batch && (
          <p className="mt-5 text-[1.0625rem] text-ink-300">
            Next batch starts {formatBatchDate(batch.startDate)} · {batch.timeIST}
          </p>
        )}

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          {core && (
            <Button asChild size="lg" variant="onNavy">
              <Link href={`/checkout/${flagshipCourse.slug}?tier=core`}>
                Join the 3-day batch — {formatINR(core.priceINR)}
              </Link>
            </Button>
          )}
          {full && (
            <Button asChild size="lg" variant="onNavyOutline">
              <Link href={`/checkout/${flagshipCourse.slug}?tier=full`}>
                Get all 5 days — {formatINR(full.priceINR)}
              </Link>
            </Button>
          )}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-ink-300">
          {site.disclaimer}
        </p>
      </Container>
    </section>
  );
}
