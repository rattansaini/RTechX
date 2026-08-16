"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page and wire Escape while the mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className={cn(
        // Solid rather than blurred: backdrop-filter on a sticky element is a
        // reliable source of scroll jank on mid-range Android, which is most
        // of this audience.
        "sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-b border-line bg-paper shadow-[0_1px_3px_rgba(10,31,68,0.04)]"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <Link href="/" aria-label="RTechX home" className="shrink-0">
            <Logo priority />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {nav.primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-field px-3.5 py-2 text-[0.9375rem] font-medium text-ink-400 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/courses/it-recruitment-masterclass">Join for ₹499</Link>
            </Button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex size-10 items-center justify-center rounded-field text-ink transition-colors hover:bg-ink/5 lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile sheet */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line bg-paper lg:hidden"
      >
        <Container>
          <nav aria-label="Mobile" className="flex flex-col py-3">
            {nav.primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-field px-3 py-3.5 text-base font-medium text-ink transition-colors hover:bg-ink/5"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild size="lg" full className="mt-3 mb-4">
              <Link
                href="/courses/it-recruitment-masterclass"
                onClick={() => setOpen(false)}
              >
                Join the 3-day batch — ₹499
              </Link>
            </Button>
          </nav>
        </Container>
      </div>
    </header>
  );
}
