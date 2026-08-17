import { CalendarDays, Clock, MonitorPlay, Timer } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { type Course, nextBatch, tierById } from "@/content/courses";
import { formatBatchDate } from "@/lib/utils";

/**
 * The four facts a visitor checks before deciding: when, where, what time, how
 * long. Everything reads from the batch in the content file.
 *
 * Deliberately not a "Day 1 / Day 2 time" split like some competitor pages
 * use — every RTechX session runs at the same hour, so two identical time
 * cards would read as a mistake. Duration is the more useful fourth cell.
 */
export function WorkshopDetails({ course }: { course: Course }) {
  const batch = nextBatch(course);
  if (!batch) return null;

  const core = tierById(course, "core");
  const full = tierById(course, "full");

  const durationLabel = full
    ? `${core?.durationLabel.split(" · ")[0] ?? "3 days"} or ${full.durationLabel.split(" · ")[0]}`
    : (core?.durationLabel.split(" · ")[0] ?? null);

  const cells = [
    { icon: CalendarDays, label: "Starts", value: formatBatchDate(batch.startDate) },
    { icon: MonitorPlay, label: "Live on", value: batch.platform },
    { icon: Clock, label: "Time", value: batch.timeIST },
    ...(durationLabel
      ? [{ icon: Timer, label: "Length", value: `${durationLabel} · 2 hrs a day` }]
      : []),
  ];

  return (
    <Section id="workshop-details" tone="white">
      <SectionHeading eyebrow="Workshop details" title="When and where" />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cells.map((cell) => (
          <Reveal as="li" key={cell.label} className="h-full">
            <div className="flex h-full flex-col rounded-card border border-line bg-paper p-5">
              <span className="grid size-10 place-items-center rounded-field bg-blue-50 text-blue">
                <cell.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-400">
                {cell.label}
              </p>
              <p className="mt-1.5 text-[1.0625rem] font-semibold leading-snug text-ink">
                {cell.value}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
