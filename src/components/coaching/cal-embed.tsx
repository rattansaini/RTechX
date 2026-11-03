"use client";

import Cal from "@calcom/embed-react";

/** Inline Cal.com calendar, prefilled, tagged with our row id for the webhook. */
export function CalEmbed({
  calLink,
  name,
  email,
  refId,
}: {
  calLink: string;
  name: string;
  email: string;
  refId: string;
}) {
  return (
    <div className="min-h-[36rem] w-full overflow-hidden rounded-card border border-line bg-white">
      <Cal
        calLink={calLink}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{
          layout: "month_view",
          name,
          email,
          "metadata[ref]": refId,
        }}
      />
    </div>
  );
}
