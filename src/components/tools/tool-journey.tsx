"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { tools, type Tool } from "@/content/tools";
import { cn } from "@/lib/utils";

/** Where each tool sits in the life of one requirement. */
const STAGE: Record<string, string> = {
  "jd-decoder": "Read the JD",
  "boolean-builder": "Find people",
  "rate-calculator": "Check the money",
  "resume-scorecard": "Screen the resume",
  "screening-kit": "Run the call",
  "outreach-writer": "Reach out and submit",
  "recruiter-copilot": "Let the agent do steps 1, 2 and 5",
};

function TiltCard({ tool, wide = false }: { tool: Tool; wide?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);

  // Follows the pointer with a small 3D tilt and a moving highlight. Mouse
  // only: touch and reduced-motion visitors get a flat card.
  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 8}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 10}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <Link
      ref={ref}
      href={`/tools/${tool.slug}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ "--rx": "0deg", "--ry": "0deg", "--gx": "50%", "--gy": "0%" } as React.CSSProperties}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-white p-6 transition-[transform,box-shadow,border-color] duration-200 ease-out [transform:perspective(900px)_rotateX(var(--rx))_rotateY(var(--ry))] [transform-style:preserve-3d] hover:border-blue-200 hover:shadow-[0_24px_48px_-24px_rgba(10,31,68,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue",
        wide && "bg-ink text-ink-300 border-ink hover:border-cyan sm:p-8"
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 [background:radial-gradient(420px_circle_at_var(--gx)_var(--gy),rgba(0,96,240,0.10),transparent_60%)]"
      />
      <div className="relative flex items-start justify-between gap-4 [transform:translateZ(30px)]">
        <span
          className={cn(
            "font-display text-4xl font-extrabold leading-none tabular-nums",
            wide ? "text-cyan" : "text-blue-200"
          )}
        >
          {tool.number}
        </span>
        <span
          className={cn(
            "rounded-pill px-2.5 py-1 text-xs font-semibold",
            tool.usesAI ? (wide ? "bg-cyan/15 text-cyan" : "bg-blue-50 text-blue-700") : "bg-paper text-ink-400"
          )}
        >
          {tool.usesAI ? (tool.cost > 1 ? `AI agent · ${tool.cost} runs` : "AI") : "No AI"}
        </span>
      </div>
      <p className={cn("relative mt-5 text-sm font-medium", wide ? "text-ink-300" : "text-cyan-ink")}>
        {STAGE[tool.slug]}
      </p>
      <h3
        className={cn(
          "relative mt-1 font-display text-xl font-extrabold leading-tight [transform:translateZ(20px)]",
          wide ? "text-white sm:text-2xl" : "text-ink"
        )}
      >
        {tool.name}
      </h3>
      <p className={cn("relative mt-2 flex-1 text-[0.9375rem] leading-relaxed", wide ? "max-w-2xl" : "text-ink-400")}>
        {tool.short}
      </p>
      <span
        className={cn(
          "relative mt-5 inline-flex items-center gap-1 text-[0.9375rem] font-semibold",
          wide ? "text-white" : "text-blue-700"
        )}
      >
        Open {tool.name}
        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function ToolJourney() {
  const steps = tools.filter((t) => t.slug !== "recruiter-copilot");
  const agent = tools.find((t) => t.slug === "recruiter-copilot");
  return (
    <div>
      <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((t) => (
          <li key={t.slug}>
            <TiltCard tool={t} />
          </li>
        ))}
      </ol>
      {agent && (
        <div className="mt-5">
          <TiltCard tool={agent} wide />
        </div>
      )}
    </div>
  );
}
