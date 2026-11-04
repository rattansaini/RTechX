"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toolBySlug, validateToolInput } from "@/content/tools";
import { ResultView, type ToolResultView } from "@/components/tools/result-view";
import { ToolIcon } from "@/components/tools/tool-icons";

const WAIT_LINES = [
  "Reading what you pasted…",
  "Working through it the RTechX way…",
  "Building the structure…",
  "Checking the details…",
  "Almost there…",
];

/** What each tool's output panel promises before the first run. */
const EXPECT: Record<string, string[]> = {
  "jd-decoder": ["Must-haves vs wish-list", "Plain-English glossary", "Questions for the hiring manager", "Red flags in the JD"],
  "boolean-builder": ["LinkedIn string", "Naukri Resdex string", "Google X-ray string", "Block-by-block explanation"],
  "resume-scorecard": ["Evidence scorecard (0–5)", "Must-haves checked", "Gaps to probe", "Questions for the call"],
  "screening-kit": ["Timed 20-minute plan", "Must-have questions", "Strong vs weak answers", "Scorecard to fill in"],
  "outreach-writer": ["First message", "Follow-up", "Submission note", "Why it works"],
  "recruiter-copilot": ["Step 1 · Decode the JD", "Step 2 · Search strings", "Step 3 · Screening plan", "One combined report"],
};

function PanelHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex h-12 items-center justify-between gap-3 border-b border-line px-5">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {right}
    </div>
  );
}

export function ToolRunner({ slug, usedToday, dailyLimit }: { slug: string; usedToday: number; dailyLimit: number }) {
  const tool = toolBySlug(slug);
  const router = useRouter();
  const uid = useId();
  const initial = () =>
    Object.fromEntries((tool?.fields ?? []).map((f) => [f.name, f.type === "select" ? (f.options?.[0] ?? "") : ""]));
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [busy, setBusy] = useState(false);
  const [waitLine, setWaitLine] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ToolResultView | null>(null);
  const [used, setUsed] = useState(usedToday);

  if (!tool) return null;
  const t = tool;
  const left = Math.max(0, dailyLimit - used);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const checked = validateToolInput(t, values);
    if (!checked.ok) return setError(checked.error);
    if (left < t.cost) return setError(`You've used today's ${dailyLimit} runs. They reset at midnight (India time).`);

    setBusy(true);
    setResult(null);
    setWaitLine(0);
    const timer = setInterval(() => setWaitLine((n) => Math.min(n + 1, WAIT_LINES.length - 1)), 4500);
    try {
      const res = await fetch("/api/tools/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tool: t.slug, input: checked.input }),
      });
      const text = (await res.text()).trim();
      let data: { result?: ToolResultView; error?: string; code?: string; usedToday?: number } = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: "The answer came back incomplete. Please try again." };
      }
      if (data.code === "signed-out" || data.code === "expired") {
        router.refresh();
        return;
      }
      if (!res.ok || data.error || !data.result) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data.result);
      if (typeof data.usedToday === "number") setUsed(data.usedToday);
      router.refresh(); // updates the sidebar's runs-left meter
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setTimeout(() => document.getElementById(`${uid}-output`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      clearInterval(timer);
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-[10px] border border-line bg-paper px-3.5 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-400/70 focus:border-blue focus:bg-white";

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Input */}
      <form onSubmit={run} noValidate className="flex flex-col overflow-hidden rounded-[16px] border border-line bg-white xl:self-start">
        <PanelHeader
          title="Input"
          right={
            <button
              type="button"
              onClick={() => {
                setValues(initial());
                setResult(null);
                setError(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-ink"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> Clear
            </button>
          }
        />
        <div className="space-y-4 p-5">
          {t.privacyNote && (
            <p className="flex gap-2.5 rounded-[10px] bg-blue-50 px-3.5 py-2.5 text-sm leading-relaxed text-ink">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-700" aria-hidden="true" />
              {t.privacyNote}
            </p>
          )}
          {t.fields.map((f) => {
            const id = `${uid}-${f.name}`;
            const value = values[f.name] ?? "";
            return (
              <div key={f.name}>
                <label htmlFor={id} className="text-sm font-semibold text-ink">
                  {f.label}
                  {!f.required && f.type !== "select" && !f.label.includes("optional") && (
                    <span className="font-normal text-ink-400"> (optional)</span>
                  )}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    id={id}
                    rows={f.rows ?? 6}
                    maxLength={f.maxLength}
                    value={value}
                    placeholder={f.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className={`${field} mt-1.5 resize-y py-2.5 leading-relaxed`}
                  />
                ) : f.type === "select" ? (
                  <select
                    id={id}
                    value={value}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className={`${field} mt-1.5 h-11`}
                  >
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={id}
                    maxLength={f.maxLength}
                    value={value}
                    placeholder={f.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className={`${field} mt-1.5 h-11`}
                  />
                )}
                <div className="mt-1 flex justify-between gap-4 text-xs text-ink-400">
                  <span>{f.help}</span>
                  {f.type === "textarea" && (
                    <span className="shrink-0 tabular-nums">
                      {value.length.toLocaleString("en-IN")} / {f.maxLength.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-[10px] bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 border-t border-line bg-paper px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
            {busy ? "Working…" : t.submitLabel}
          </Button>
          <p className="text-xs text-ink-400">
            {t.cost > 1 ? `Uses ${t.cost} runs · ` : ""}
            {left} of {dailyLimit} runs left today
          </p>
        </div>
      </form>

      {/* Output */}
      <section
        id={`${uid}-output`}
        aria-label="Output"
        className="flex min-h-[28rem] scroll-mt-20 flex-col overflow-hidden rounded-[16px] border border-line bg-white"
      >
        <PanelHeader
          title="Output"
          right={
            result ? (
              <span className="rounded-pill bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-ink">Ready</span>
            ) : busy ? (
              <span className="rounded-pill bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">Running</span>
            ) : null
          }
        />
        <div className="flex-1 p-5 sm:p-6">
          {result ? (
            <ResultView result={result} bare />
          ) : busy ? (
            <div aria-live="polite">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Loader2 className="size-4 animate-spin text-blue" aria-hidden="true" />
                {WAIT_LINES[waitLine]}
              </p>
              <div className="mt-6 space-y-3" aria-hidden="true">
                {[92, 78, 85, 60, 88, 70, 80].map((w, i) => (
                  <div key={i} className="h-3 animate-pulse rounded-pill bg-line" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-[16px] bg-blue-50 text-blue-700">
                <ToolIcon slug={t.slug} className="size-6" />
              </span>
              <p className="mt-4 font-semibold text-ink">Your result appears here</p>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-400">
                Fill in the input and press &ldquo;{t.submitLabel}&rdquo;. Answers usually take 15–30 seconds.
              </p>
              {EXPECT[t.slug] && (
                <ul className="mt-6 grid w-full max-w-md gap-2 text-left sm:grid-cols-2">
                  {EXPECT[t.slug].map((x) => (
                    <li key={x} className="rounded-[10px] border border-dashed border-line px-3 py-2 text-sm text-ink-400">
                      {x}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
