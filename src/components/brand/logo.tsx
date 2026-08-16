import Image from "next/image";
import { cn } from "@/lib/utils";
import mark from "../../../public/brand/rtechx-logo.png";

/**
 * The RTechX mark — the supplied ribbon logo, trimmed of its transparent
 * padding and served through next/image. Statically imported so Next knows
 * the intrinsic size at build time and reserves the box (no layout shift).
 *
 * The mark carries the brand's full spectrum. The interface around it stays
 * navy/blue on purpose — see globals.css.
 */
export function LogoMark({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src={mark}
      alt=""
      aria-hidden="true"
      priority={priority}
      className={cn("h-8 w-auto", className)}
      sizes="64px"
    />
  );
}

export function Logo({
  className,
  tone = "ink",
  priority,
}: {
  className?: string;
  tone?: "ink" | "white";
  priority?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark priority={priority} />
      <span
        className={cn(
          "font-display text-[1.375rem] font-extrabold tracking-tight",
          tone === "white" ? "text-white" : "text-ink"
        )}
      >
        RTech
        <span className={tone === "white" ? "text-cyan" : "text-blue"}>X</span>
      </span>
    </span>
  );
}
