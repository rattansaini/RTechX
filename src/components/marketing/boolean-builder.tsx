"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The brand signature: a JD phrase resolving into a real Boolean string.
 *
 * Types out once on load, then sits static. Under `prefers-reduced-motion` the
 * full string is painted immediately with no caret. The sizing layer holds the
 * final height from first paint, so the panel never shifts as it types.
 */

const DEFAULT_JD = "Java, Spring Boot, microservices, AWS";

const DEFAULT_BOOLEAN = `("Java Developer" OR "Backend Engineer")
AND ("Spring Boot" OR Spring)
AND (microservices OR REST OR API)
AND (AWS OR Cloud)`;

const TOKEN = /("[^"]*"|\bAND\b|\bOR\b|\bNOT\b|[()]|\n|[^\s()]+|\s+)/g;

function tokenClass(token: string) {
  if (token === "AND" || token === "OR" || token === "NOT")
    return "text-cyan font-semibold";
  if (token.startsWith('"')) return "text-white";
  if (token === "(" || token === ")") return "text-ink-300";
  return "text-blue-200";
}

function Highlighted({ text }: { text: string }) {
  const parts = useMemo(() => text.match(TOKEN) ?? [], [text]);
  return (
    <>
      {parts.map((part, i) =>
        part.trim() === "" ? (
          <span key={i}>{part}</span>
        ) : (
          <span key={i} className={tokenClass(part)}>
            {part}
          </span>
        )
      )}
    </>
  );
}

export function BooleanBuilder({
  jd = DEFAULT_JD,
  boolean: booleanString = DEFAULT_BOOLEAN,
  className,
}: {
  jd?: string;
  boolean?: string;
  className?: string;
}) {
  // Server and first client render are both "nothing typed yet", so hydration
  // matches exactly. The media query is read afterwards, in the effect.
  const [typedCount, setTypedCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const done = typedCount >= booleanString.length;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTypedCount(booleanString.length);
      return;
    }
    setTyping(true);

    // Driven off rAF elapsed time rather than setInterval: background tabs
    // throttle timers to ~1/sec, which would leave the panel half-typed for a
    // minute. rAF simply doesn't tick until the tab is visible, so the effect
    // starts when someone is actually looking at it.
    const MS_PER_CHAR = 18;
    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      start ??= now;
      const n = Math.min(booleanString.length, Math.floor((now - start) / MS_PER_CHAR));
      setTypedCount(n);
      if (n < booleanString.length) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [booleanString]);

  return (
    <div
      className={cn(
        "on-navy overflow-hidden rounded-card bg-ink text-left shadow-[0_24px_60px_-24px_rgba(10,31,68,0.55)] ring-1 ring-ink-700",
        className
      )}
    >
      {/* panel chrome */}
      <div className="flex items-center gap-2.5 border-b border-line-navy px-4 py-3">
        <span className="size-2 rounded-full bg-cyan" aria-hidden="true" />
        <span className="font-mono text-[0.6875rem] tracking-wide text-ink-300">
          rtechx · boolean-builder
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {/* the requirement, as it arrives */}
        <div>
          <p className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-300">
            JD says
          </p>
          <p className="rounded-field bg-ink-800 px-3 py-2.5 font-mono text-[0.8125rem] leading-relaxed text-blue-200 ring-1 ring-line-navy">
            {jd}
          </p>
        </div>

        <div className="flex items-center gap-3" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" className="size-4 text-cyan">
            <path
              d="M8 2v12m0 0 4.5-4.5M8 14l-4.5-4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="h-px flex-1 bg-line-navy" />
        </div>

        {/* the search a trained recruiter actually runs */}
        <div>
          <p className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-300">
            You search
          </p>
          <div className="grid rounded-field bg-ink-800 p-3 ring-1 ring-line-navy">
            {/* sizing layer: reserves final height from first paint */}
            <pre
              aria-hidden="true"
              className="invisible col-start-1 row-start-1 whitespace-pre-wrap break-words font-mono text-[0.8125rem] leading-relaxed"
            >
              {booleanString}
            </pre>
            <pre
              aria-hidden="true"
              className="col-start-1 row-start-1 whitespace-pre-wrap break-words font-mono text-[0.8125rem] leading-relaxed"
            >
              <Highlighted text={booleanString.slice(0, typedCount)} />
              {typing && !done && (
                <span className="ml-px inline-block h-[1.05em] w-[0.5ch] translate-y-[0.18em] animate-pulse bg-cyan" />
              )}
            </pre>
            {/* screen readers get the finished string immediately */}
            <span className="sr-only">
              Boolean search string: {booleanString.replace(/\n/g, " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line-navy px-4 py-3">
        <span className="font-mono text-[0.6875rem] text-ink-300">
          Day 2 · Boolean search
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] text-cyan">
          <span className="size-1.5 rounded-full bg-green" aria-hidden="true" />
          taught live
        </span>
      </div>
    </div>
  );
}
