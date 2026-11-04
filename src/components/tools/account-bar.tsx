"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";

export function AccountBar({ email, daysLeft, endsAt }: { email: string; daysLeft: number; endsAt: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function call(url: string) {
    setBusy(true);
    await fetch(url, { method: "POST" }).catch(() => null);
    router.refresh();
  }

  const ends = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).format(
    new Date(endsAt)
  );

  return (
    <div className="flex flex-col gap-3 rounded-card border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2.5">
        <CalendarClock className="size-4 shrink-0 text-blue-700" aria-hidden="true" />
        <span>
          <strong>
            {daysLeft} {daysLeft === 1 ? "day" : "days"} of free access left
          </strong>{" "}
          (until {ends}) · signed in as {email}
        </span>
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {!confirming ? (
          <>
            <button type="button" disabled={busy} onClick={() => call("/api/tools/auth/logout")} className="font-semibold text-blue-700 underline underline-offset-4">
              Sign out
            </button>
            <button type="button" onClick={() => setConfirming(true)} className="text-ink-400 underline underline-offset-4">
              Delete my account
            </button>
          </>
        ) : (
          <>
            <span className="text-ink">Delete your account and usage log?</span>
            <button type="button" disabled={busy} onClick={() => call("/api/tools/auth/delete")} className="font-semibold text-red-700 underline underline-offset-4">
              Yes, delete
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="text-ink-400 underline underline-offset-4">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
