import { Container } from "@/components/ui/container";
import { site } from "@/lib/site";

/**
 * Shared shell for the three pages Razorpay requires. Kept plain and readable
 * — legal pages that nobody can parse are worse than useless.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  /** ISO date of the last substantive change. */
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-[2rem] font-extrabold leading-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-400">
          Last updated {updated}
        </p>

        <div className="legal-prose mt-10">{children}</div>

        <div className="mt-12 rounded-card border border-line bg-paper p-5 text-[0.9375rem] leading-relaxed text-ink-400">
          <p className="font-semibold text-ink">{site.legal.entity}</p>
          {site.legal.address && <p className="mt-1">{site.legal.address}</p>}
          <p className="mt-1">
            <a href={`mailto:${site.supportEmail}`} className="text-blue-700 underline underline-offset-4">
              {site.supportEmail}
            </a>{" "}
            ·{" "}
            <a href={`https://wa.me/${site.whatsapp.e164}`} className="text-blue-700 underline underline-offset-4">
              {site.whatsapp.display}
            </a>
          </p>
          {site.legal.gstRegistered && <p className="mt-1">GST registered{site.legal.gstin ? ` · ${site.legal.gstin}` : ""}</p>}
          <p className="mt-4 border-t border-line pt-4 text-sm">{site.disclaimer}</p>
        </div>
      </div>
    </Container>
  );
}
