import { Bot, Calculator, ClipboardCheck, FileSearch, PhoneCall, Search, Send, type LucideIcon } from "lucide-react";

/** One icon per tool, used in the workspace sidebar, dashboard and headers. */
export const TOOL_ICONS: Record<string, LucideIcon> = {
  "jd-decoder": FileSearch,
  "boolean-builder": Search,
  "rate-calculator": Calculator,
  "resume-scorecard": ClipboardCheck,
  "screening-kit": PhoneCall,
  "outreach-writer": Send,
  "recruiter-copilot": Bot,
};

/** Short names that fit the sidebar. */
export const TOOL_SHORT_NAMES: Record<string, string> = {
  "jd-decoder": "JD Decoder",
  "boolean-builder": "Boolean Builder",
  "rate-calculator": "Rate & CTC",
  "resume-scorecard": "Resume Scorecard",
  "screening-kit": "Screening Call Kit",
  "outreach-writer": "Outreach Writer",
  "recruiter-copilot": "Recruiter Copilot",
};

/** Sidebar groups, in the order a requirement moves. */
export const TOOL_GROUPS: { label: string; slugs: string[] }[] = [
  { label: "Read and find", slugs: ["jd-decoder", "boolean-builder", "rate-calculator"] },
  { label: "Screen and submit", slugs: ["resume-scorecard", "screening-kit", "outreach-writer"] },
  { label: "Agent", slugs: ["recruiter-copilot"] },
];

export function ToolIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = TOOL_ICONS[slug] ?? FileSearch;
  return <Icon className={className} aria-hidden="true" />;
}
