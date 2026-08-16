import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import type { PainPoint } from "@/content/courses";

/**
 * The highest-signal block on the page: recruiter pain, one line each, then a
 * single payoff. Sits on navy — it's the low point of the narrative, and the
 * contrast makes the light sections either side read as the way out.
 */
/**
 * Emphasises the final sentence of the payoff. Falls back to plain text when
 * the copy has no sentence break, so editing this string can't break the page.
 */
function PayoffLine({ payoff }: { payoff: string }) {
  const sentences = payoff.split(/(?<=\.)\s+/);
  if (sentences.length < 2) return <>{payoff}</>;
  const tail = sentences.pop() as string;
  return (
    <>
      {sentences.join(" ")} <span className="text-gradient-brand">{tail}</span>
    </>
  );
}

export function PainStrip({
  painPoints,
  heading = "Sound familiar?",
  payoff = "Different problems. One missing skill: understanding the tech.",
}: {
  painPoints: readonly PainPoint[];
  heading?: string;
  payoff?: string;
}) {
  return (
    <Section tone="navy">
      <SectionHeading title={heading} tone="white" />

      <ul className="mt-10 space-y-3">
        {painPoints.map((p, i) => (
          <Reveal as="li" key={p.line} delay={i * 0.05}>
            <div className="flex items-start gap-4 rounded-card border border-line-navy bg-ink-800/60 px-4 py-4 sm:items-center sm:px-5">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-field bg-ink text-xl"
                aria-hidden="true"
              >
                {p.emoji}
              </span>
              <span className="text-[1.0625rem] leading-snug text-white">{p.line}</span>
            </div>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={0.1}>
        <p className="mt-10 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          <PayoffLine payoff={payoff} />
        </p>
      </Reveal>
    </Section>
  );
}
