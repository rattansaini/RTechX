import Link from "next/link";
import { ArrowRight, Hammer, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tool } from "@/content/tools";

/** "Built by Rattan" — the real facts of how a tool was made. */
export function HowIBuilt({ tool }: { tool: Tool }) {
  return (
    <aside className="rounded-card border border-line bg-paper p-6">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">
        <Hammer className="size-3.5" aria-hidden="true" />
        How I built this
      </p>
      <ul className="mt-4 space-y-2.5">
        {tool.howIBuilt.map((line) => (
          <li key={line} className="flex gap-2.5 text-[0.9375rem] leading-relaxed text-ink">
            <span className="mt-2 size-1.5 shrink-0 rounded-pill bg-blue" aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-ink-400">Mirrors: {tool.teaches}</p>
    </aside>
  );
}

/** The pitch every tool ends with: you can build one too. */
export function BuildYourOwn() {
  return (
    <section className="on-navy overflow-hidden rounded-card bg-ink p-6 text-ink-300 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan">1:1 Coaching · Track 3</p>
      <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white">Want to build a tool like this for your own desk?</h2>
      <p className="mt-3 max-w-2xl leading-relaxed">
        Every tool here was designed by Rattan and built with AI. In Track 3 of 1:1 Coaching you pick one real problem
        from your own recruiting work and build the tool for it with him, session by session. No coding background
        needed to start.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" variant="onNavy">
          <Link href="/coaching">
            See 1:1 Coaching <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="onNavyOutline">
          <Link href="/courses/it-recruitment-masterclass">The IT Recruitment Masterclass</Link>
        </Button>
      </div>
    </section>
  );
}

/** Shown when the 7 days are over. */
export function TrialEnded() {
  return (
    <div className="rounded-card border border-line bg-white p-6 sm:p-8">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">
        <Lock className="size-3.5" aria-hidden="true" />
        Free access ended
      </p>
      <h2 className="mt-2 text-2xl font-extrabold leading-tight text-ink">Your 7 free days are over</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-400">
        Thanks for trying the toolkit. To keep learning the method behind it — or to build tools like these yourself —
        join the Masterclass or book a 1:1 Coaching call. Students and coachees can ask for longer access at
        hello@rtechx.com.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/coaching">Book a 1:1 call</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/courses/it-recruitment-masterclass">See the Masterclass</Link>
        </Button>
      </div>
    </div>
  );
}
