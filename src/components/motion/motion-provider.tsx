"use client";

import { MotionConfig } from "framer-motion";

/**
 * `reducedMotion="user"` makes Framer Motion drop transform and layout
 * animations for anyone with `prefers-reduced-motion: reduce`, while leaving
 * opacity alone. Handling it here means no component has to branch its markup
 * on a media query — which would desync server and client rendering.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
