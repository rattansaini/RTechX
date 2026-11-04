import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { TOOLS_TRIAL_DAYS, tools } from "@/content/tools";

/** Home-page teaser for the Free Recruiter Toolkit. */
export function ToolkitBand() {
  return (
    <section className="border-y border-line bg-white" aria-label="Free Recruiter Toolkit">
      <Container>
        <div className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">
              Free Recruiter Toolkit · Built by Rattan
            </p>
            <h2 className="mt-3 text-[1.75rem] font-extrabold leading-[1.15] text-ink sm:text-4xl">
              {tools.length} recruiter tools, free for {TOOLS_TRIAL_DAYS} days
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {tools.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/tools/${t.slug}`}
                    className="inline-flex rounded-pill border border-line bg-paper px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-blue-200"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Button asChild size="lg" className="justify-self-start">
            <Link href="/tools">
              Try the toolkit <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
