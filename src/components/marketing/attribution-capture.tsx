"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Renders nothing; stores the ad parameters from the landing URL.
 *
 * Essential on /lp: Instagram traffic arrives with the UTM and click ids on
 * the first URL only. By the time someone reaches /checkout those params are
 * gone, so without this every enrolment would look like direct traffic and the
 * ad spend would be unattributable.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
