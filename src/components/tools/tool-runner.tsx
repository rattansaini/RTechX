"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toolBySlug, validateToolInput } from "@/content/tools";
import { ResultView, type ToolResultView } from "@/components/tools/result-view";

const WAIT_LINES = [
  "Reading what you pasted…",
  "Working through it the RTechX way…",
  "Checking the structure…",
  "Almost there…",
];

export function ToolRunner({ slug, usedToday, dailyLimit }: { slug: string; usedToday: number; dailyLimit: number }) {
  const tool = toolBySlug(slug);
  const router = useRouter();
  const uid = useId();
  const resultRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((tool?.fields ?? []).map((f) => [f.name, f.type === "select" ? (f.options?.[0] ?? "") : ""]))
  );
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
    const timer = setInterval(() => setWaitLine((n) => Math.min(n + 1, WAIT_LINES.length - 1)), 5000);
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
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      clearInterval(timer);
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-field border border-line bg-white px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-400/70 focus:border-blue";

  return (
    <div className="space-y-8">
      <form onSubmit={run} noValidate className="rounded-card border border-line bg-white p-5 sm:p-8">
        {t.privacyNote && (
          <p className="mb-5 flex gap-2.5 rounded-field bg-blue-50 px-4 py-3 text-sm leading-relaxed text-ink">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-700" aria-hidden="true" />
            {t.privacyNote}
          </p>
        )}
        <div className="space-y-5">
          {t.fields.map((f) => {
            const id = `${uid}-${f.name}`;
            const value = values[f.name] ?? "";
            return (
              <div key={f.name}>
                <label htmlFor={id} className="text-sm font-semibold text-ink">
                  {f.label}
                  {!f.required && f.type !== "select" && <span className="font-normal text-ink-400"> (optional)</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    id={id}
                    rows={f.rows ?? 6}
                    maxLength={f.maxLength}
                    value={value}
                    placeholder={f.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className={`${field} mt-1.5 py-3 leading-relaxed`}
                  />
                ) : f.type === "select" ? (
                  <select
                    id={id}
                    value={value}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className={`${field} mt-1.5 h-12`}
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
                    className={`${field} mt-1.5 h-12`}
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
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
            {busy ? WAIT_LINES[waitLine] : t.submitLabel}
          </Button>
          <p className="text-sm text-ink-400">
            {t.cost > 1 ? `Uses ${t.cost} runs · ` : ""}
            {left} of {dailyLimit} runs left today
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </form>

      <div ref={resultRef} className="scroll-mt-24">
        {result && <ResultView result={result} />}
      </div>
    </div>
  );
}
