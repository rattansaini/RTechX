import { cn } from "@/lib/utils";

/**
 * Scroll reveal.
 *
 * This is deliberately a server component that only adds a class — there is no
 * JavaScript behind it at all. The animation is a CSS scroll-driven timeline
 * (see `.reveal` in globals.css), which means:
 *
 *  - content is visible by default and never depends on hydration, an
 *    IntersectionObserver, or a working `requestAnimationFrame`;
 *  - it degrades to plain static content in the Instagram/Facebook in-app
 *    webviews, which is where most of this site's traffic lands;
 *  - it runs off the main thread, so it costs nothing on a mid-range Android.
 *
 * The `delay` prop is accepted and ignored: with a view() timeline each element
 * is driven by its own scroll position, which produces a natural stagger
 * without hardcoding one.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** @deprecated Retained for call-site compatibility; stagger is positional. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "figure" | "ul";
}) {
  return <Tag className={cn("reveal", className)}>{children}</Tag>;
}
