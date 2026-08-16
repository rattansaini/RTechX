"use client";

import { useEffect, useId, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureAttribution, readAttribution } from "@/lib/attribution";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "done" | "error";

async function submitLead(payload: Record<string, unknown>) {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, attribution: readAttribution() }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Something went wrong. Please try again.");
  }
}

function useAttributionOnMount() {
  useEffect(() => {
    captureAttribution();
  }, []);
}

/**
 * Email capture used by the free-resource band and the coming-soon cards.
 * Status is announced politely rather than only shown, so it lands for screen
 * reader users too.
 */
export function EmailCaptureForm({
  source,
  cta = "Send it to me",
  placeholder = "you@email.com",
  successMessage = "Done — check your inbox.",
  extra,
  className,
  tone = "ink",
  layout = "inline",
}: {
  source: string;
  cta?: string;
  placeholder?: string;
  successMessage?: string;
  extra?: Record<string, unknown>;
  className?: string;
  tone?: "ink" | "white";
  /** "stacked" for narrow containers like catalogue cards. */
  layout?: "inline" | "stacked";
}) {
  useAttributionOnMount();
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      await submitLead({ email, source, ...extra });
      setStatus("done");
      setMessage(successMessage);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <p
        className={cn(
          "flex items-center gap-2 text-[0.9375rem] font-medium",
          tone === "white" ? "text-cyan" : "text-green-ink",
          className
        )}
        role="status"
      >
        <Check className="size-4" aria-hidden="true" />
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)} noValidate>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          "flex flex-col gap-2.5",
          layout === "inline" && "sm:flex-row"
        )}
      >
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          aria-describedby={message ? `${id}-msg` : undefined}
          aria-invalid={status === "error" || undefined}
          className={cn(
            // `flex-1` must never be unconditional here: in the stacked (column)
            // layout it sets flex-basis on the HEIGHT, collapsing the field to
            // ~20px. Only apply it at the breakpoint where the row appears.
            "h-12 w-full rounded-field border px-4 text-[0.9375rem] outline-none transition-colors placeholder:text-ink-400/70",
            layout === "inline" && "sm:min-w-0 sm:flex-1",
            tone === "white"
              ? "border-line-navy bg-ink-800 text-white focus:border-cyan"
              : "border-line bg-white text-ink focus:border-blue"
          )}
        />
        <Button
          type="submit"
          size="md"
          variant={tone === "white" ? "onNavy" : "primary"}
          full={layout === "stacked"}
          disabled={status === "sending"}
        >
          {status === "sending" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending
            </>
          ) : (
            <>
              {cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>

      <p
        id={`${id}-msg`}
        role="status"
        aria-live="polite"
        className={cn(
          "mt-2 min-h-5 text-sm",
          status === "error"
            ? tone === "white"
              ? "text-red-300"
              : "text-red-600"
            : "sr-only"
        )}
      >
        {message}
      </p>
    </form>
  );
}

/** Compact variant for locked catalogue cards. */
export function NotifyMeForm({
  courseSlug,
  courseTitle,
}: {
  courseSlug: string;
  courseTitle: string;
}) {
  return (
    <EmailCaptureForm
      source="course-notify"
      cta="Notify me"
      placeholder="you@email.com"
      successMessage={`We'll email you when ${courseTitle} opens.`}
      extra={{ courseSlug }}
      layout="stacked"
    />
  );
}
