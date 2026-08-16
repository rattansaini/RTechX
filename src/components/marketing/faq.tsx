import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section, SectionHeading } from "@/components/ui/section";
import type { Faq } from "@/content/courses";

export function FaqSection({
  faqs,
  title = "Questions people actually ask",
  eyebrow = "FAQ",
  moreHref,
  id = "faq",
}: {
  faqs: readonly Faq[];
  title?: string;
  eyebrow?: string;
  /** When set, renders a "full FAQ" link — used on the home page. */
  moreHref?: string;
  id?: string;
}) {
  if (faqs.length === 0) return null;

  return (
    <Section id={id}>
      <SectionHeading eyebrow={eyebrow} title={title} />

      <div className="mt-10 max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>
                {/* Answers may carry paragraph breaks. JSX collapses "\n\n" to
                    a single space, so split explicitly or long answers render
                    as one unbroken wall of text. */}
                {f.a.split("\n\n").map((para, p) => (
                  <p key={para.slice(0, 32)} className={p > 0 ? "mt-3" : undefined}>
                    {para}
                  </p>
                ))}
                {/* Answers that quote a figure carry its source, in the same
                    muted style the stat tiles use. */}
                {f.source && (
                  <p className="mt-3 text-[0.75rem] leading-snug text-ink-400">{f.source}</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {moreHref && (
          <p className="mt-6 text-[0.9375rem] text-ink-400">
            More questions are answered on the{" "}
            <Link
              href={moreHref}
              className="font-semibold text-blue-700 underline underline-offset-4 hover:text-blue"
            >
              course page
            </Link>
            .
          </p>
        )}
      </div>
    </Section>
  );
}
