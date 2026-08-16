import { Search } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import type { Course } from "@/content/courses";

/**
 * Where the career goes, placed at the moment the reader is deciding whether
 * the upgrade is worth it.
 *
 * Everything here reads from `course.careerScope`, so the quarterly figure
 * refresh is a content edit. Renders nothing when a course has no careerScope
 * — same rule the rest of the site follows for absent data.
 */
export function CareerScope({ course }: { course: Course }) {
  const scope = course.careerScope;
  if (!scope) return null;

  return (
    <Section id="career-scope" tone="white">
      <SectionHeading eyebrow="The career" title="Where this career actually goes" />

      <div className="mt-8 max-w-3xl space-y-5">
        {scope.intro.map((para) => (
          <p key={para.slice(0, 40)} className="text-[1.0625rem] leading-relaxed text-ink-400">
            {para}
          </p>
        ))}
      </div>

      <Reveal className="mt-10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[38rem] border-collapse text-left">
            <caption className="sr-only">
              Typical progression and earnings in IT recruitment
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-3 pr-4 text-[0.9375rem] font-semibold text-ink">
                  Stage
                </th>
                <th scope="col" className="py-3 pr-4 text-[0.9375rem] font-semibold text-ink">
                  Role
                </th>
                <th scope="col" className="py-3 text-[0.9375rem] font-semibold text-ink">
                  Typical earnings
                </th>
              </tr>
            </thead>
            <tbody>
              {scope.ladder.map((row) => (
                <tr key={row.stage} className="border-b border-line/70">
                  <th
                    scope="row"
                    className="py-4 pr-4 align-top font-mono text-[0.8125rem] font-medium text-ink"
                  >
                    {row.stage}
                  </th>
                  <td className="py-4 pr-4 align-top text-[0.9375rem] text-ink">
                    {row.role}
                  </td>
                  <td className="py-4 align-top text-[0.9375rem] text-ink-400">
                    {row.earnings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Same muted attribution treatment the stat tiles use. */}
        <p className="mt-4 text-[0.75rem] leading-snug text-ink-400">{scope.ladderNote}</p>
      </Reveal>

      <Reveal className="mt-10">
        <div className="flex max-w-2xl gap-3.5 rounded-card border border-blue-200 bg-blue-50/60 p-5 sm:p-6">
          <Search className="mt-0.5 size-5 shrink-0 text-blue" aria-hidden="true" />
          <p className="text-[0.9375rem] leading-relaxed text-ink">{scope.verifyPrompt}</p>
        </div>
      </Reveal>
    </Section>
  );
}
