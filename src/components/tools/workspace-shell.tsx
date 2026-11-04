"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, LayoutDashboard, Lock, LogOut, Menu, X } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { TOOL_GROUPS, TOOL_SHORT_NAMES, ToolIcon } from "@/components/tools/tool-icons";
import { toolBySlug } from "@/content/tools";
import { cn } from "@/lib/utils";

export type ShellAccount =
  | { state: "signed-out" }
  | { state: "expired"; email: string }
  | { state: "active"; email: string; daysLeft: number; trialDays: number; usedToday: number; dailyLimit: number };

function Meter({ label, value, max, detail }: { label: string; value: number; max: number; detail: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-ink-300">{label}</span>
        <span className="font-semibold tabular-nums text-white">{detail}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-white/10">
        <div className="h-full rounded-pill bg-cyan transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SidebarBody({ account, onNavigate }: { account: ShellAccount; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const locked = account.state !== "active";

  async function post(url: string) {
    await fetch(url, { method: "POST" }).catch(() => null);
    router.refresh();
  }

  const item = (href: string, active: boolean) =>
    cn(
      "group relative flex items-center gap-3 rounded-[10px] px-3 py-2 text-[0.9375rem] font-medium transition-colors",
      active ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-5">
        <LogoMark className="h-7" />
        <div className="leading-tight">
          <p className="font-display text-lg font-extrabold tracking-tight text-white">RTechX</p>
          <p className="text-xs text-ink-300">Recruiter Toolkit</p>
        </div>
      </div>

      <nav aria-label="Toolkit" className="flex-1 overflow-y-auto px-3">
        <Link href="/tools/dashboard" onClick={onNavigate} className={item("/tools/dashboard", pathname === "/tools/dashboard")}>
          {pathname === "/tools/dashboard" && <span className="absolute inset-y-2 left-0 w-0.5 rounded-pill bg-cyan" aria-hidden="true" />}
          <LayoutDashboard className="size-[1.125rem] shrink-0" aria-hidden="true" />
          Dashboard
        </Link>

        {TOOL_GROUPS.map((g) => (
          <div key={g.label} className="mt-5">
            <p className="px-3 pb-1.5 text-xs font-medium text-ink-300/80">{g.label}</p>
            <ul className="space-y-0.5">
              {g.slugs.map((slug) => {
                const href = `/tools/${slug}`;
                const active = pathname === href;
                const tool = toolBySlug(slug);
                return (
                  <li key={slug}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={item(href, active)}
                    >
                      {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-pill bg-cyan" aria-hidden="true" />}
                      <ToolIcon slug={slug} className={cn("size-[1.125rem] shrink-0", active ? "text-cyan" : "")} />
                      <span className="flex-1 truncate">{TOOL_SHORT_NAMES[slug]}</span>
                      {locked ? (
                        <Lock className="size-3.5 text-ink-300/60" aria-label="Sign in to use" />
                      ) : (
                        <span className="text-[0.6875rem] tabular-nums text-ink-300/70">{tool?.number}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-4 border-t border-line-navy px-5 py-5">
        {account.state === "active" && (
          <>
            <Meter
              label="Free access"
              value={account.daysLeft}
              max={account.trialDays}
              detail={`${account.daysLeft} ${account.daysLeft === 1 ? "day" : "days"} left`}
            />
            <Meter
              label="Runs today"
              value={account.dailyLimit - account.usedToday}
              max={account.dailyLimit}
              detail={`${Math.max(0, account.dailyLimit - account.usedToday)} of ${account.dailyLimit} left`}
            />
          </>
        )}
        {account.state === "expired" && (
          <p className="text-sm leading-relaxed text-ink-300">
            Your 7 free days have ended.{" "}
            <Link href="/coaching" className="font-semibold text-cyan underline underline-offset-4">
              Keep going with 1:1 Coaching
            </Link>
          </p>
        )}
        {account.state === "signed-out" && (
          <p className="text-sm leading-relaxed text-ink-300">Sign in to unlock all seven tools, free for 7 days.</p>
        )}

        {account.state !== "signed-out" && (
          <div className="text-xs text-ink-300">
            <p className="truncate" title={account.email}>
              {account.email}
            </p>
            {!confirming ? (
              <div className="mt-2 flex gap-4">
                <button type="button" onClick={() => post("/api/tools/auth/logout")} className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-cyan">
                  <LogOut className="size-3.5" aria-hidden="true" /> Sign out
                </button>
                <button type="button" onClick={() => setConfirming(true)} className="underline underline-offset-4 hover:text-white">
                  Delete account
                </button>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                <span className="text-white">Delete your account?</span>
                <button type="button" onClick={() => post("/api/tools/auth/delete")} className="font-semibold text-[#FF8A8A] underline underline-offset-4">
                  Yes, delete
                </button>
                <button type="button" onClick={() => setConfirming(false)} className="underline underline-offset-4">
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-300 hover:text-white">
          <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to rtechx.com
        </Link>
      </div>
    </div>
  );
}

export function WorkspaceShell({ account, children }: { account: ShellAccount; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const slug = pathname?.split("/")[2] ?? "";
  const title = slug === "dashboard" ? "Dashboard" : (toolBySlug(slug)?.name ?? "Toolkit");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex min-h-dvh bg-[#EEF2F8]">
      <aside className="on-navy sticky top-0 hidden h-dvh w-64 shrink-0 bg-ink lg:block">
        <SidebarBody account={account} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Toolkit menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="on-navy relative h-full w-72 max-w-[85vw] bg-ink shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 inline-flex size-9 items-center justify-center rounded-field text-white hover:bg-white/10"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            <SidebarBody account={account} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open toolkit menu"
            className="inline-flex size-9 items-center justify-center rounded-field text-ink hover:bg-ink/5 lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1 truncate text-sm text-ink-400">
            <Link href="/tools/dashboard" className="hover:text-ink">
              Toolkit
            </Link>
            <span className="mx-2 text-ink-400/60">/</span>
            <span className="font-semibold text-ink">{title}</span>
          </nav>
          {account.state === "active" && (
            <span className="hidden rounded-pill bg-blue-50 px-3 py-1 text-xs font-semibold tabular-nums text-blue-700 sm:inline-flex">
              {Math.max(0, account.dailyLimit - account.usedToday)} runs left today
            </span>
          )}
          <Link href="/coaching" className="hidden text-sm font-semibold text-blue-700 hover:underline md:inline">
            Build your own tool
          </Link>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
