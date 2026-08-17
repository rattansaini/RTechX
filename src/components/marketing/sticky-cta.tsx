"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatINR } from "@/lib/utils";

/**
 * Persistent purchase bar: countdown to the real batch start, plus the CTA.
 *
 * Two rules this holds to, both of which competitor pages break:
 *
 *  - The countdown targets the actual batch date from the content file. It is
 *    not seeded from page load, so it cannot be reset by refreshing, and it
 *    genuinely reaches zero.
 *  - At zero the digits disappear rather than looping. A timer that restarts
 *    is a lie, and it is the single most common dark pattern on pages like
 *    this one.
 *
 * The first paint is deliberately countdown-free: the server has no clock the
 * client will agree with, so rendering digits during hydration guarantees a
 * mismatch. It appears on the first tick instead.
 */

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function remainingUntil(target: number): Remaining | null {
  const diff = target - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function Digits({ remaining }: { remaining: Remaining }) {
  const parts: [number, string][] = [
    [remaining.days, "d"],
    [remaining.hours, "h"],
    [remaining.minutes, "m"],
    [remaining.seconds, "s"],
  ];

  return (
    <p
      className="font-mono text-lg font-semibold tabular-nums leading-none text-ink sm:text-xl"
      // Announced once, not on every tick — a per-second live region makes
      // screen readers unusable.
      aria-label={`Batch starts in ${remaining.days} days, ${remaining.hours} hours`}
    >
      {parts.map(([value, unit], i) => (
        <span key={unit}>
          {pad(value)}
          <span className="text-[0.6875rem] font-normal text-ink-400">{unit}</span>
          {i < parts.length - 1 && <span className="mx-1 text-ink-400">:</span>}
        </span>
      ))}
    </p>
  );
}

export function StickyCta({
  courseSlug,
  priceINR,
  startDate,
  label = "Register now",
}: {
  courseSlug: string;
  priceINR: number;
  /** ISO batch start date. Omit and the bar shows price only. */
  startDate?: string;
  label?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const onScroll = () => {
      // Roughly one viewport — past the hero on every screen size.
      setVisible(window.scrollY > window.innerHeight * 0.85);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!startDate) return;
    const target = new Date(`${startDate}T00:00:00+05:30`).getTime();
    const tick = () => setRemaining(remainingUntil(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startDate]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm transition-transform duration-200",
        visible ? "translate-y-0" : "translate-y-full"
      )}
      aria-hidden={!visible}
      inert={!visible ? true : undefined}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          {remaining ? (
            <>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-400">
                Batch starts in
              </p>
              <div className="mt-1">
                <Digits remaining={remaining} />
              </div>
            </>
          ) : (
            <>
              <p className="font-display text-xl font-extrabold leading-none text-ink">
                {formatINR(priceINR)}
              </p>
              <p className="mt-1 font-mono text-[0.6875rem] text-ink-400">
                3 days · live online
              </p>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {remaining && (
            <span className="hidden font-display text-lg font-extrabold text-ink sm:block">
              {formatINR(priceINR)}
            </span>
          )}
          <Button asChild size="md">
            <Link href={`/checkout/${courseSlug}?tier=core`}>{label}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
