"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { formatBatchDate } from "@/lib/utils";

/**
 * Batch urgency bar.
 *
 * Every number here is real:
 *  - the countdown targets the actual batch start date from the content file,
 *    so it can only ever run down once and then the bar stops rendering;
 *  - seats-left renders only when a concrete number exists (a manual override,
 *    or later a live count of confirmed enrolments). When it's null the seat
 *    chip is simply absent rather than invented.
 *
 * There is no reset, no loop, and no "hurry, offer ends" without a real end.
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

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-lg font-bold tabular-nums text-white sm:text-xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink-300">
        {label}
      </span>
    </div>
  );
}

export function UrgencyBar({
  startDate,
  timeIST,
  seats,
  seatsLeft,
  showCountdown,
  showSeatsLeft,
}: {
  startDate: string;
  timeIST: string;
  seats: number;
  seatsLeft: number | null;
  showCountdown: boolean;
  showSeatsLeft: boolean;
}) {
  const target = new Date(startDate).getTime();

  // Null on the server and on the first client render, so hydration matches;
  // the real value arrives in the effect.
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!showCountdown) return;
    const tick = () => {
      const r = remainingUntil(target);
      setRemaining(r);
      if (!r) setStarted(true);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, showCountdown]);

  // The batch has begun — the bar removes itself rather than showing zeros.
  if (started) return null;

  const showSeats = showSeatsLeft && typeof seatsLeft === "number";

  return (
    <div className="on-navy border-y border-line-navy bg-ink-800">
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-4">
        <p className="flex items-center gap-2.5 text-[0.9375rem] text-white">
          <CalendarClock className="size-4 shrink-0 text-cyan" aria-hidden="true" />
          <span>
            Batch starts{" "}
            <strong className="font-semibold">{formatBatchDate(startDate)}</strong>
            <span className="text-ink-300"> · {timeIST}</span>
          </span>
        </p>

        <div className="flex items-center gap-6">
          {showSeats && (
            <p className="flex items-center gap-2 text-[0.9375rem] text-white">
              <Users className="size-4 shrink-0 text-cyan" aria-hidden="true" />
              <span>
                <strong className="font-semibold">{seatsLeft}</strong>
                <span className="text-ink-300"> of {seats} seats left</span>
              </span>
            </p>
          )}

          {showCountdown && remaining && (
            <div
              className="flex items-center gap-3"
              role="timer"
              aria-label={`Batch starts in ${remaining.days} days`}
            >
              <Unit value={remaining.days} label="days" />
              <Unit value={remaining.hours} label="hrs" />
              <Unit value={remaining.minutes} label="min" />
              <Unit value={remaining.seconds} label="sec" />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
