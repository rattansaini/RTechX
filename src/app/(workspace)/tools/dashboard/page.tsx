import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Clock } from "lucide-react";
import { TrialEnded } from "@/components/tools/blocks";
import { ToolsSignIn } from "@/components/tools/sign-in";
import { TOOL_SHORT_NAMES, ToolIcon } from "@/components/tools/tool-icons";
import { TOOLS_TRIAL_DAYS, tools } from "@/content/tools";
import { currentAccess, recentUsage } from "@/lib/tools/session";

export const metadata: Metadata = {
  title: { absolute: "Dashboard — RTechX Recruiter Toolkit" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** A ring gauge drawn in SVG — days left, runs left. */
function Ring({ value, max, label, sub }: { value: number; max: number; label: string; sub: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="flex items-center gap-4 rounded-[16px] border border-line bg-white p-5">
      <svg viewBox="0 0 76 76" className="size-[4.25rem] shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#E2E8F3" strokeWidth="8" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke="#0060F0"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div>
        <p className="font-display text-2xl font-extrabold tabular-nums text-ink">{label}</p>
        <p className="text-sm text-ink-400">{sub}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const access = await currentAccess();

  if (access.state !== "active") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Your Recruiter Toolkit</h1>
        <p className="mt-2 text-ink-400">Seven tools for one requirement, from JD to submission.</p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {access.state === "expired" ? <TrialEnded /> : <ToolsSignIn />}
          <ul className="grid content-start gap-2 sm:grid-cols-2">
            {tools.map((t) => (
              <li key={t.slug} className="flex items-center gap-3 rounded-[12px] border border-line bg-white p-3 opacity-80">
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-paper text-ink-400">
                  <ToolIcon slug={t.slug} className="size-4" />
                </span>
                <span className="text-sm font-semibold text-ink">{TOOL_SHORT_NAMES[t.slug]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const usage = await recentUsage(access.user.id);
  const runsLeft = Math.max(0, access.dailyLimit - access.usedToday);
  const weekRuns = usage.reduce((s, u) => s + u.units, 0);
  const perTool = new Map<string, number>();
  for (const u of usage) perTool.set(u.tool, (perTool.get(u.tool) ?? 0) + 1);
  const name = access.user.email.split("@")[0];

  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-[1.75rem]">
          {greeting()}, {name}
        </h1>
        <p className="text-ink-400">Pick up a requirement where you left off, or start a new one.</p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Ring
          value={access.daysLeft}
          max={TOOLS_TRIAL_DAYS}
          label={`${access.daysLeft} ${access.daysLeft === 1 ? "day" : "days"}`}
          sub="of free access left"
        />
        <Ring value={runsLeft} max={access.dailyLimit} label={`${runsLeft} of ${access.dailyLimit}`} sub="AI runs left today" />
        <div className="flex items-center gap-4 rounded-[16px] border border-line bg-white p-5 sm:col-span-2 xl:col-span-1">
          <span className="flex size-[4.25rem] shrink-0 items-center justify-center rounded-full bg-paper font-display text-2xl font-extrabold tabular-nums text-ink">
            {weekRuns}
          </span>
          <div>
            <p className="font-semibold text-ink">Runs in the last 7 days</p>
            <p className="text-sm text-ink-400">Across {perTool.size} of {tools.length} tools</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Launcher */}
        <section aria-labelledby="launch" className="rounded-[16px] border border-line bg-white">
          <div className="flex h-12 items-center border-b border-line px-5">
            <h2 id="launch" className="text-sm font-semibold text-ink">
              Your tools
            </h2>
          </div>
          <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {tools
              .filter((t) => t.slug !== "recruiter-copilot")
              .map((t) => (
                <li key={t.slug} className="bg-white">
                  <Link href={`/tools/${t.slug}`} className="group flex h-full flex-col p-5 transition-colors hover:bg-blue-50/50">
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-[12px] bg-ink text-cyan transition-transform group-hover:scale-105">
                        <ToolIcon slug={t.slug} className="size-[1.125rem]" />
                      </span>
                      <span className="text-xs tabular-nums text-ink-400">
                        {perTool.get(t.slug) ? `${perTool.get(t.slug)} this week` : t.usesAI ? "AI" : "No AI"}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold text-ink">{t.name}</p>
                    <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-400">{t.short}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                      Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
          <Link
            href="/tools/recruiter-copilot"
            className="group flex items-center gap-4 rounded-b-[16px] border-t border-line bg-ink p-5 text-ink-300 hover:bg-ink-800"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-cyan/15 text-cyan">
              <Bot className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-white">Recruiter Copilot — the agent</span>
              <span className="block truncate text-sm">Paste one JD: decode, search strings and screening plan in one go. Uses 3 runs.</span>
            </span>
            <ArrowRight className="size-4 text-white transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </section>

        {/* Activity + promo */}
        <div className="flex flex-col gap-5">
          <section aria-labelledby="activity" className="rounded-[16px] border border-line bg-white">
            <div className="flex h-12 items-center border-b border-line px-5">
              <h2 id="activity" className="text-sm font-semibold text-ink">
                Recent activity
              </h2>
            </div>
            {usage.length === 0 ? (
              <div className="p-5 text-sm leading-relaxed text-ink-400">
                No runs yet. Most recruiters start with the{" "}
                <Link href="/tools/jd-decoder" className="font-semibold text-blue-700 underline underline-offset-4">
                  JD Decoder
                </Link>
                .
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {usage.slice(0, 8).map((u, i) => (
                  <li key={i}>
                    <Link href={`/tools/${u.tool}`} className="flex items-center gap-3 px-5 py-3 hover:bg-paper">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-paper text-ink">
                        <ToolIcon slug={u.tool} className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                        {TOOL_SHORT_NAMES[u.tool] ?? u.tool}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-ink-400">
                        <Clock className="size-3" aria-hidden="true" />
                        {timeAgo(u.createdAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="border-t border-line px-5 py-3 text-xs text-ink-400">
              Only the tool and time are kept. What you paste is never stored.
            </p>
          </section>

          <Link href="/coaching" className="group rounded-[16px] bg-gradient-to-br from-blue to-ink p-5 text-white">
            <p className="text-xs text-blue-200">1:1 Coaching · Track 3</p>
            <p className="mt-1 font-display text-lg font-extrabold leading-snug">Build your own recruiting tool, like these.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
              See how <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
