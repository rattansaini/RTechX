import { FileStack, Globe2, UserCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/ui/section";

const reasons = [
  {
    icon: UserCheck,
    // NBSP keeps "TA lead" together — text-wrap:balance otherwise splits it.
    title: "Taught by a working TA lead, not a full-time trainer",
    body: "Rattan still runs live requirements every week. What you learn on Tuesday is what he used on Monday — not a syllabus written three years ago.",
  },
  {
    icon: FileStack,
    title: "You leave with artifacts, not notes",
    body: "A 60+ page handbook, requirement intake sheets, a Boolean library, screening scorecards and a submission template. Things you can open on day one of a job.",
  },
  {
    icon: Globe2,
    title: "Global, not just US",
    body: "Most courses teach the US market and stop. Days 1–3 apply anywhere — India, US, EU, UK, South Africa, APAC — and the specialisation days go deep on the two markets that actually pay Indian recruiters.",
  },
];

export function WhyRTechX() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Why RTechX"
        title="Three things that make this different"
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {reasons.map((r, i) => (
          <Reveal key={r.title} delay={i * 0.08}>
            <article className="group h-full rounded-card border border-line bg-white p-6 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_32px_-16px_rgba(10,31,68,0.28)]">
              <span className="grid size-11 place-items-center rounded-field bg-blue-50 text-blue">
                <r.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold leading-snug text-ink">{r.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-400">{r.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
