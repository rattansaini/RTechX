import { cn } from "@/lib/utils";

/**
 * The RTechX mark: a magnifier over a globe, navy -> blue -> cyan.
 *
 * Drawn inline as SVG rather than loaded from `/assets/rtechx-logo.png` so the
 * header costs no request and never shifts layout. To swap in the supplied PNG
 * later, replace the <svg> below with next/image — nothing else references it.
 */
export function LogoMark({
  className,
  id = "rtx",
}: {
  className?: string;
  /** Gradient ids must be unique per instance on a page. */
  id?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A1F44" />
          <stop offset="0.55" stopColor="#1D6FF2" />
          <stop offset="1" stopColor="#22C7E6" />
        </linearGradient>
      </defs>
      {/* globe */}
      <circle cx="13.5" cy="13.5" r="10.5" stroke={`url(#${id}-g)`} strokeWidth="2.5" />
      <path
        d="M3 13.5h21M13.5 3c2.8 3 4.2 6.6 4.2 10.5S16.3 21 13.5 24c-2.8-3-4.2-6.6-4.2-10.5S10.7 6 13.5 3Z"
        stroke={`url(#${id}-g)`}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* magnifier handle */}
      <path
        d="m21.6 21.6 7 7"
        stroke="#22C7E6"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  tone = "ink",
  id,
}: {
  className?: string;
  tone?: "ink" | "white";
  id?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark id={id} />
      <span
        className={cn(
          "font-display text-[1.375rem] font-extrabold tracking-tight",
          tone === "white" ? "text-white" : "text-ink"
        )}
      >
        RTech
        <span className={tone === "white" ? "text-cyan" : "text-blue-600"}>X</span>
      </span>
    </span>
  );
}
