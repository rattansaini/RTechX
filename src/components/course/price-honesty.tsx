import { Container } from "@/components/ui/container";

/**
 * Sits directly above the pricing table. Deliberately quiet — muted type on
 * paper, no accent colour, no border flourish. It reads as a note, not a
 * promotion, which is the only way the claim lands.
 */
export function PriceHonesty() {
  return (
    <section className="bg-paper" aria-label="A note about price">
      <Container className="pt-14 sm:pt-16 lg:pt-20">
        <p className="max-w-3xl text-[0.9375rem] leading-relaxed text-ink-400">
          <strong className="font-semibold text-ink">One honest note about price.</strong>{" "}
          Comparable live IT-recruitment programmes in India are typically priced between
          ₹3,000 and ₹25,000. We&rsquo;re at ₹499 and ₹999 because this is a new brand and
          we would rather have students than margin. The syllabus isn&rsquo;t smaller. The
          price is.
        </p>
      </Container>
    </section>
  );
}
