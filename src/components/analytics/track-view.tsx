"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Fires a single view event on mount. Renders nothing.
 * `track` no-ops without consent, so this is safe to mount unconditionally.
 */
export function TrackView({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    track(event);
    // Intentionally once per mount — re-firing on prop identity changes would
    // inflate the count on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
