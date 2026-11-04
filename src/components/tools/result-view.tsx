"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export type ToolResultView = {
  title: string;
  summary?: string;
  sections: {
    heading: string;
    text?: string;
    bullets?: string[];
    code?: { label: string; value: string }[];
    table?: { headers: string[]; rows: string[][] };
  }[];
  note?: string;
};

function CopyButton({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* clipboard blocked — the text is still selectable */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-field border border-line-navy px-2.5 py-1 text-xs font-semibold text-white hover:border-cyan"
    >
      {done ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export function ResultView({ result, bare = false }: { result: ToolResultView; bare?: boolean }) {
  return (
    <article className={bare ? "" : "rounded-card border border-line bg-white p-5 sm:p-8"} aria-live="polite">
      <h2 className={bare ? "text-xl font-extrabold leading-tight text-ink" : "text-2xl font-extrabold leading-tight text-ink"}>
        {result.title}
      </h2>
      {result.summary && <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink-400">{result.summary}</p>}

      <div className="mt-6 space-y-8">
        {result.sections.map((s, i) => (
          <section key={i}>
            <h3 className="text-lg font-bold leading-snug text-ink">{s.heading}</h3>
            {s.text && <p className="mt-2 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink">{s.text}</p>}
            {s.bullets && s.bullets.length > 0 && (
              <ul className="mt-3 space-y-2">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2.5 text-[0.9375rem] leading-relaxed text-ink">
                    <span className="mt-2 size-1.5 shrink-0 rounded-pill bg-blue" aria-hidden="true" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.code?.map((c, j) => (
              <div key={j} className="mt-3 overflow-hidden rounded-field bg-ink">
                <div className="flex items-center justify-between gap-3 border-b border-line-navy px-4 py-2">
                  <span className="font-mono text-xs text-ink-300">{c.label}</span>
                  <CopyButton value={c.value} />
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-white">
                  {c.value}
                </pre>
              </div>
            ))}
            {s.table && (
              <div className="mt-3 overflow-x-auto rounded-field border border-line">
                <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                  <thead className="bg-paper">
                    <tr>
                      {s.table.headers.map((h, j) => (
                        <th key={j} scope="col" className="border-b border-line px-3 py-2.5 font-semibold text-ink">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((r, j) => (
                      <tr key={j} className="align-top">
                        {r.map((cell, k) => (
                          <td key={k} className="border-b border-line px-3 py-2.5 leading-relaxed text-ink">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>

      {result.note && <p className="mt-8 border-t border-line pt-4 text-sm leading-relaxed text-ink-400">{result.note}</p>}
      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        AI-generated from what you pasted. Check it before you use it — you make the decisions.
      </p>
    </article>
  );
}
