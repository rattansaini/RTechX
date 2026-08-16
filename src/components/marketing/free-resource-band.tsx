import { FileDown } from "lucide-react";
import { EmailCaptureForm } from "@/components/marketing/lead-capture";
import { Container } from "@/components/ui/container";

export function FreeResourceBand() {
  return (
    <section className="on-navy relative overflow-hidden bg-ink-800">
      <div className="pointer-events-none absolute inset-0 grid-field-navy" aria-hidden="true" />
      <Container className="relative py-14 sm:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-pill border border-line-navy bg-ink px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-cyan">
              <FileDown className="size-3.5" aria-hidden="true" />
              Free
            </span>
            <h2 className="mt-4 text-[1.75rem] font-extrabold leading-[1.15] text-white sm:text-3xl">
              Get the 1-page Boolean cheat-sheet
            </h2>
            <p className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-ink-300">
              The operators, the syntax, and five role-family strings you can paste
              into LinkedIn tonight. No course required.
            </p>
          </div>

          <div className="lg:col-span-5">
            <EmailCaptureForm
              source="boolean-cheatsheet"
              cta="Send it to me"
              successMessage="On its way — check your inbox."
              tone="white"
            />
            <p className="mt-3 text-[0.8125rem] text-ink-300">
              One email with the PDF. Unsubscribe any time.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
