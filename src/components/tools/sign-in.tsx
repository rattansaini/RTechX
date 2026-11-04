"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOOLS_TRIAL_DAYS } from "@/content/tools";

/**
 * Two steps: email + consent → 6-digit code by email → signed in.
 * No password, no Google account needed.
 */
export function ToolsSignIn({ compact = false, redirectTo }: { compact?: boolean; redirectTo?: string }) {
  const router = useRouter();
  const uid = useId();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: res.ok, error: data.error };
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Please enter a valid email address.");
    if (!consent) return setError("Please tick the box to continue.");
    setBusy(true);
    const r = await post("/api/tools/auth/request-code", { email: email.trim(), consent: true });
    setBusy(false);
    if (!r.ok) return setError(r.error ?? "Couldn't send a code. Please try again.");
    setStep("code");
    setNotice(`We've emailed a 6-digit code to ${email.trim()}. Check spam if it isn't there in a minute.`);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code.trim())) return setError("The code is 6 digits.");
    setBusy(true);
    const r = await post("/api/tools/auth/verify", { email: email.trim(), code: code.trim() });
    if (!r.ok) {
      setBusy(false);
      return setError(r.error ?? "That code didn't work.");
    }
    if (redirectTo) router.push(redirectTo);
    else router.refresh();
  }

  const field =
    "h-12 w-full rounded-field border border-line bg-white px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-400/70 focus:border-blue";

  return (
    <div className="rounded-card border border-line bg-white p-6 sm:p-8">
      {!compact && (
        <>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">Free for {TOOLS_TRIAL_DAYS} days</p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight text-ink">Sign in to use the toolkit</h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-400">
            No password. We email you a code. Your {TOOLS_TRIAL_DAYS} free days start the first time you sign in.
          </p>
        </>
      )}

      {step === "email" ? (
        <form onSubmit={requestCode} noValidate className={compact ? "" : "mt-6"}>
          <label htmlFor={`${uid}-email`} className="text-sm font-semibold text-ink">
            Email
          </label>
          <input
            id={`${uid}-email`}
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${field} mt-1.5`}
            placeholder="you@example.com"
          />
          <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-ink-400">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 size-4 shrink-0 accent-[#0060F0]"
            />
            <span>
              I agree that RTechX stores my email to give me {TOOLS_TRIAL_DAYS} days of free access and to count my daily
              runs. What I paste into the tools is not stored. See the{" "}
              <Link href="/legal/privacy" className="font-semibold text-blue-700 underline underline-offset-4">
                Privacy policy
              </Link>
              .
            </span>
          </label>
          <Button type="submit" size="lg" full className="mt-5" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Mail aria-hidden="true" />}
            Email me a code
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} noValidate className={compact ? "" : "mt-6"}>
          {notice && <p className="mb-4 text-[0.9375rem] leading-relaxed text-ink">{notice}</p>}
          <label htmlFor={`${uid}-code`} className="text-sm font-semibold text-ink">
            6-digit code
          </label>
          <input
            id={`${uid}-code`}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={`${field} mt-1.5 font-mono text-xl tracking-[0.4em]`}
            placeholder="••••••"
          />
          <Button type="submit" size="lg" full className="mt-5" disabled={busy}>
            {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
            Sign in
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="mt-3 text-sm font-semibold text-blue-700 underline underline-offset-4"
          >
            Use a different email or send a new code
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
