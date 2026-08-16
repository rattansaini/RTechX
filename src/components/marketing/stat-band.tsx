import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { stats as defaultStats, type Stat } from "@/content/stats";
import { cn } from "@/lib/utils";

/**
 * Attribution line. Exported because the AI-objection section renders its
 * sources in exactly this style — one definition, so the two can never drift.
 *
 * Always rendered, never a tooltip, never hidden at any breakpoint. Showing
 * the publisher and the date next to the number is the differentiator; hiding
 * it on mobile would remove it for most of this site's traffic.
 */
export function SourceLine({
  source,
  asOf,
  className,
}: {
  source: string;
  asOf: string;
  className?: string;
}) {
  return (
    <p className={cn("text-[0.75rem] leading-snug text-ink-400", className)}>
      {source} · {asOf}
    </p>
  );
}

export function StatTile({ stat }: { stat: Stat }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-card border bg-white p-5 sm:p-6",
        stat.emphasis ? "border-blue-200" : "border-line"
      )}
    >
      {/* A single accent rule marks the emphasised tile. One tile only — the
          flag is set in content/stats.ts, not here. */}
      {stat.emphasis && (
        <span
          className="mb-4 block h-1 w-10 rounded-pill bg-gradient-to-r from-blue to-cyan"
          aria-hidden="true"
        />
      )}

      <p
        className={cn(
          "font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-[2.25rem]",
          stat.emphasis ? "text-blue-700" : "text-ink"
        )}
      >
        {stat.value}
      </p>

      <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink">
        {stat.label}
      </p>

      <SourceLine
        source={stat.source}
        asOf={stat.asOf}
        className="mt-4 border-t border-line pt-3"
      />
    </div>
  );
}

/**
 * Four tiles under the hero: 4 across on desktop, 2×2 on tablet, stacked on
 * mobile.
 */
export function StatBand({
  stats = defaultStats,
  className,
}: {
  stats?: readonly Stat[];
  className?: string;
}) {
  if (stats.length === 0) return null;

  return (
    <section className={cn("bg-paper", className)} aria-label="Market data">
      <Container className="pb-4 sm:pb-6 lg:pb-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Reveal as="li" key={stat.id} className="h-full">
              <StatTile stat={stat} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
