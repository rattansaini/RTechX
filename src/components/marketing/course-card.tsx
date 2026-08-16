import Link from "next/link";
import { ArrowRight, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotifyMeForm } from "@/components/marketing/lead-capture";
import {
  type CatalogueEntry,
  type ComingSoonCourse,
  type Course,
  isLive,
  nextBatch,
  tierById,
} from "@/content/courses";
import { formatBatchDate, formatINR } from "@/lib/utils";

export function CourseCard({
  entry,
  featured = false,
}: {
  entry: CatalogueEntry;
  /** Horizontal hero treatment — used for the flagship on the home page. */
  featured?: boolean;
}) {
  if (!isLive(entry)) return <LockedCard entry={entry} />;
  return featured ? <FeaturedCard entry={entry} /> : <LiveCard entry={entry} />;
}

function EnrollingFlag({ batch }: { batch: ReturnType<typeof nextBatch> }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-blue-700">
        <span className="size-1.5 rounded-full bg-green" aria-hidden="true" />
        Enrolling now
      </span>
      {batch && (
        <span className="font-mono text-[0.6875rem] text-ink-400">
          Starts {formatBatchDate(batch.startDate)}
        </span>
      )}
    </div>
  );
}

function FeaturedCard({ entry }: { entry: Course }) {
  const core = tierById(entry, "core");
  const full = tierById(entry, "full");
  const batch = nextBatch(entry);

  return (
    <article className="overflow-hidden rounded-card border border-line bg-white shadow-[0_1px_2px_rgba(10,31,68,0.04)]">
      <div className="grid lg:grid-cols-12">
        <div className="p-6 sm:p-8 lg:col-span-7">
          <EnrollingFlag batch={batch} />

          <h3 className="mt-4 text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
            <Link
              href={`/courses/${entry.slug}`}
              className="hover:text-blue-700 focus-visible:text-blue-700"
            >
              {entry.title}
            </Link>
          </h3>
          <p className="mt-3 max-w-lg text-[1.0625rem] leading-relaxed text-ink-400">
            {entry.cardSummary}
          </p>

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {entry.outcomes.slice(0, 4).map((o) => (
              <li key={o} className="flex gap-2.5 text-[0.9375rem] leading-snug text-ink">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-green-ink"
                  aria-hidden="true"
                />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-line bg-paper p-6 sm:p-8 lg:col-span-5 lg:border-l lg:border-t-0">
          <ul className="space-y-3">
            {entry.tiers.map((t) => (
              <li
                key={t.id}
                className="flex items-baseline justify-between gap-4 rounded-field border border-line bg-white px-4 py-3.5"
              >
                <div>
                  <p className="text-[0.9375rem] font-semibold leading-snug text-ink">
                    {t.id === "core" ? "3-day masterclass" : "+ Geo specialisation"}
                  </p>
                  <p className="mt-0.5 font-mono text-[0.6875rem] text-ink-400">
                    {t.durationLabel}
                  </p>
                </div>
                <span className="font-display text-xl font-extrabold text-ink">
                  {formatINR(t.priceINR)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2.5">
            {core && (
              <Button asChild size="lg" full>
                <Link href={`/checkout/${entry.slug}?tier=core`}>
                  Join for {formatINR(core.priceINR)}
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant="secondary" full>
              <Link href={`/courses/${entry.slug}`}>
                See the full curriculum
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {batch && full && (
            <p className="mt-4 text-center text-[0.8125rem] leading-relaxed text-ink-400">
              {batch.timeIST} · Upgrade to all 5 days any time for the difference.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function LiveCard({ entry }: { entry: Course }) {
  const core = tierById(entry, "core");
  const batch = nextBatch(entry);

  return (
    <article className="group relative flex h-full flex-col rounded-card border border-line bg-white p-6 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_40px_-20px_rgba(10,31,68,0.3)]">
      <EnrollingFlag batch={batch} />
      <h3 className="mt-4 text-xl font-bold leading-snug text-ink">
        <Link href={`/courses/${entry.slug}`} className="after:absolute after:inset-0">
          {entry.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-400">
        {entry.cardSummary}
      </p>
      <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-5">
        <p className="font-display text-2xl font-extrabold text-ink">
          {core ? formatINR(core.priceINR) : "—"}
        </p>
        <span className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-blue-700">
          View course
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

function LockedCard({ entry }: { entry: ComingSoonCourse }) {
  return (
    <article className="flex h-full flex-col rounded-card border border-dashed border-line bg-paper p-6">
      <span className="inline-flex w-fit items-center gap-2 rounded-pill border border-line bg-white px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-400">
        <Lock className="size-3" aria-hidden="true" />
        In development
      </span>

      <h3 className="mt-5 text-lg font-bold leading-snug text-ink">{entry.title}</h3>
      <p className="mt-2.5 flex-1 text-[0.9375rem] leading-relaxed text-ink-400">
        {entry.cardSummary}
      </p>

      <div className="mt-6 border-t border-line pt-5">
        <NotifyMeForm courseSlug={entry.slug} courseTitle={entry.title} />
      </div>
    </article>
  );
}
