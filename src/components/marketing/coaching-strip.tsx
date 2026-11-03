import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/** Full-width Electric Blue band announcing Custom 1:1 Coaching. */
export function CoachingStrip() {
  return (
    <section className="on-navy bg-blue text-white" aria-label="Custom 1:1 Coaching">
      <Container>
        <div className="flex flex-col gap-5 py-8 sm:py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <p className="max-w-3xl text-[1.0625rem] leading-relaxed sm:text-lg">
            <strong className="font-bold">New · Custom 1:1 Coaching.</strong>{" "}
            Full recruitment cycle, AI in recruiting, or build your own AI agent — planned after a
            20-minute call with Rattan.
          </p>
          <Button asChild size="lg" variant="onNavy" className="shrink-0">
            <Link href="/coaching#book">Book your call · ₹299 + GST</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
