"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { POOL_SIZE, SPHERE_SKILLS, TalentSphere, buildPool, countMatches, type SphereSkill } from "@/components/tools/talent-sphere";
import { cn } from "@/lib/utils";

/** The OR-groups a recruiter would actually write for each skill. */
const GROUPS: Record<SphereSkill, string> = {
  Java: `("Java" OR "Core Java" OR J2EE)`,
  "Spring Boot": `("Spring Boot" OR Springboot OR "Spring Framework")`,
  AWS: `(AWS OR "Amazon Web Services" OR EC2 OR Lambda)`,
  Kafka: `(Kafka OR "Apache Kafka")`,
  Python: `(Python OR Django OR Flask)`,
  SQL: `(SQL OR MySQL OR PostgreSQL)`,
  React: `(React OR "React.js" OR ReactJS)`,
  Kubernetes: `(Kubernetes OR K8s OR EKS OR AKS)`,
};

const TOKEN = /("[^"]*"|\bAND\b|\bOR\b|[()]|site:\S+|[^\s()]+|\s+)/g;

function Highlighted({ text }: { text: string }) {
  return (
    <>
      {(text.match(TOKEN) ?? []).map((t, i) => (
        <span
          key={i}
          className={
            t === "AND" || t === "OR"
              ? "font-semibold text-cyan"
              : t.startsWith('"')
                ? "text-white"
                : t === "(" || t === ")"
                  ? "text-ink-300"
                  : t.startsWith("site:")
                    ? "text-[#FF9800]"
                    : "text-blue-200"
          }
        >
          {t}
        </span>
      ))}
    </>
  );
}

export function ToolkitHero({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<SphereSkill[]>(["Java", "Spring Boot", "AWS"]);
  const [mode, setMode] = useState<"linkedin" | "xray">("linkedin");
  const [copied, setCopied] = useState(false);
  const pool = useMemo(() => buildPool(), []);
  const matches = countMatches(pool, selected);

  const string = useMemo(() => {
    if (selected.length === 0) return "";
    const body = selected.map((s) => GROUPS[s]).join(" AND ");
    return mode === "xray" ? `site:linkedin.com/in ${body}` : body;
  }, [selected, mode]);

  const toggle = (s: SphereSkill) =>
    setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <section className="on-navy relative overflow-hidden bg-ink text-ink-300">
      <div className="pointer-events-none absolute inset-0 grid-field-navy opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-40 -top-40 size-[44rem] rounded-full bg-[radial-gradient(circle,rgba(0,96,240,0.35),transparent_65%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-10">
        <div className="relative z-10 flex flex-col lg:col-span-7">
          <p className="text-[0.875rem] text-cyan">Free Recruiter Toolkit, built by Rattan Saini</p>
          <h1 className="mt-3 font-display text-[2.125rem] font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-[3.25rem]">
            Seven tools that think like a recruiter.
          </h1>
          <p className="mt-4 max-w-xl text-[1rem] leading-relaxed sm:text-[1.0625rem]">
            Tap the skills a JD asks for. Watch the Boolean string write itself and the talent pool narrow — that&rsquo;s
            the Boolean Builder in miniature. Sign in and all seven tools are yours, free for 7 days.
          </p>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-white">What does the JD ask for?</legend>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {SPHERE_SKILLS.map((s) => {
                const on = selected.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(s)}
                    className={cn(
                      "inline-flex h-9 items-center gap-1 rounded-pill border px-3 text-[0.8125rem] font-medium transition-[background-color,border-color,color,transform] duration-150 active:scale-95",
                      on
                        ? "border-cyan bg-cyan/15 text-white"
                        : "border-line-navy bg-ink-800 text-ink-300 hover:border-ink-600 hover:text-white"
                    )}
                  >
                    {on && <Check className="size-3.5 text-cyan" aria-hidden="true" />}
                    {s}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5 overflow-hidden rounded-card border border-line-navy bg-ink-800/80 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-line-navy px-4 py-2">
              <div role="tablist" aria-label="Where you will search" className="flex gap-1">
                {(
                  [
                    ["linkedin", "LinkedIn"],
                    ["xray", "Google X-ray"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    role="tab"
                    type="button"
                    aria-selected={mode === id}
                    onClick={() => setMode(id)}
                    className={cn(
                      "rounded-[8px] px-3 py-1 text-sm font-semibold transition-colors",
                      mode === id ? "bg-ink-600 text-white" : "text-ink-300 hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!string}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(string);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1600);
                  } catch {
                    /* selection still works */
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-40"
              >
                {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre
              aria-live="polite"
              className="min-h-[4.25rem] whitespace-pre-wrap break-words px-4 py-3 font-mono text-[0.78rem] leading-relaxed"
            >
              {string ? <Highlighted text={string} /> : <span className="text-ink-300">Pick at least one skill.</span>}
            </pre>
          </div>

          <div className="mt-5">{children}</div>
        </div>

        <div className="relative -mx-5 sm:mx-0 lg:col-span-5">
          <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
            <TalentSphere selected={selected} />
          </div>
          <div className="-mt-6 flex flex-col items-center gap-0.5 text-center">
            <div className="contents">
              <p aria-live="polite" className="font-display text-2xl font-extrabold tabular-nums text-white sm:text-3xl">
                {matches}
                <span className="text-base font-semibold text-ink-300"> of {POOL_SIZE}</span>
              </p>
              <p className="text-sm text-ink-300">
                {selected.length ? "profiles match every skill" : "profiles in the pool"}
              </p>
              <p className="mt-1 text-xs text-ink-300/80">Illustration with sample profiles, not real candidates. Drag to spin.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
