"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatINR } from "@/lib/utils";

/**
 * Mobile-only sticky purchase bar. Appears once the user has scrolled past the
 * hero so it never covers the opening pitch, and respects the iOS safe area.
 */
export function StickyCta({
  courseSlug,
  priceINR,
  label = "Join now",
}: {
  courseSlug: string;
  priceINR: number;
  label?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Roughly one viewport — past the hero on every phone size.
      setVisible(window.scrollY > window.innerHeight * 0.85);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] transition-transform duration-200 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
      // Keep it out of the tab order and off screen readers while hidden.
      aria-hidden={!visible}
      inert={!visible ? true : undefined}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <div>
          <p className="font-display text-xl font-extrabold leading-none text-ink">
            {formatINR(priceINR)}
          </p>
          <p className="mt-1 font-mono text-[0.6875rem] text-ink-400">
            3 days · live online
          </p>
        </div>
        <Button asChild size="md">
          <Link href={`/checkout/${courseSlug}?tier=core`}>{label}</Link>
        </Button>
      </div>
    </div>
  );
}
