"use client";

import { useId, useState } from "react";
import { billForMargin, ctcAfterHike, hikePct, monthlyCtc, noticeDates, usRates } from "@/lib/tools/rates";
import { cn } from "@/lib/utils";

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
const usd0 = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const pct = (n: number) => `${n.toFixed(1)}%`;
const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`)
  );

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

const field =
  "h-12 w-full rounded-field border border-line bg-white px-4 text-[0.9375rem] text-ink outline-none transition-colors focus:border-blue";

function Field({
  label,
  value,
  onChange,
  suffix,
  type = "number",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  type?: "number" | "date";
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={type}
          inputMode={type === "number" ? "decimal" : undefined}
          min={type === "number" ? 0 : undefined}
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(field, suffix && "pr-14")}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-ink-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Out({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <dt className="text-[0.9375rem] text-ink-400">{label}</dt>
      <dd className={cn("text-right tabular-nums text-ink", strong ? "text-lg font-bold" : "font-semibold")}>{value}</dd>
    </div>
  );
}

function UsRates() {
  const [type, setType] = useState<"W2" | "C2C" | "1099">("W2");
  const [pay, setPay] = useState("50");
  const [bill, setBill] = useState("70");
  const [burden, setBurden] = useState("20");
  const [target, setTarget] = useState("20");

  const r = usRates({ pay: num(pay), bill: num(bill), burdenPct: num(burden) });
  const need = billForMargin({ pay: num(pay), burdenPct: num(burden), marginPct: num(target) });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <fieldset>
          <legend className="text-sm font-semibold text-ink">Employment type</legend>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {(["W2", "C2C", "1099"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => {
                  setType(t);
                  setBurden(t === "W2" ? "20" : "0");
                }}
                className={cn(
                  "h-11 rounded-field border text-[0.9375rem] font-semibold transition-colors",
                  type === t ? "border-blue bg-blue-50 text-blue-700" : "border-line bg-white text-ink hover:border-blue-200"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Pay rate to the consultant (per hour)" value={pay} onChange={setPay} suffix="USD" />
        <Field label="Bill rate to the client (per hour)" value={bill} onChange={setBill} suffix="USD" />
        <Field label="Employer burden — taxes and benefits you pay on top" value={burden} onChange={setBurden} suffix="%" />
        <p className="text-sm leading-relaxed text-ink-400">
          {type === "W2"
            ? "On W2 you are the employer, so payroll taxes and benefits sit on top of the pay rate. 20% is only a starting guess — use your company's real figure."
            : "On C2C and 1099 the consultant's own company or the consultant pays taxes and benefits, so burden is usually 0%."}
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-card border border-line bg-paper p-5">
          <h3 className="font-bold text-ink">Your numbers</h3>
          {r ? (
            <dl className="mt-2">
              <Out label="Markup on pay" value={pct(r.markupPct)} />
              <Out label="Loaded cost per hour" value={usd(r.loadedCost)} />
              <Out label="Gross margin per hour" value={usd(r.marginPerHour)} strong />
              <Out label="Gross margin %" value={pct(r.marginPct)} strong />
              <Out label="Yearly margin (2,080 hours)" value={usd0(r.annualMargin)} />
              <Out label="Yearly pay equivalent" value={usd0(r.annualPay)} />
            </dl>
          ) : (
            <p className="mt-2 text-sm text-ink-400">Enter a pay rate and bill rate above zero.</p>
          )}
          {r && r.marginPerHour < 0 && (
            <p className="mt-3 text-sm font-semibold text-red-700">The bill rate doesn&rsquo;t cover the loaded cost — this deal loses money.</p>
          )}
        </div>

        <div className="rounded-card border border-line bg-white p-5">
          <h3 className="font-bold text-ink">What bill rate do I need?</h3>
          <div className="mt-3">
            <Field label="Target gross margin" value={target} onChange={setTarget} suffix="%" />
          </div>
          <p className="mt-3 text-[0.9375rem] text-ink">
            {need ? (
              <>
                Bill at least <strong className="tabular-nums">{usd(need)}</strong> per hour.
              </>
            ) : (
              <span className="text-ink-400">Enter a pay rate and a margin below 100%.</span>
            )}
          </p>
        </div>

        <p className="text-xs leading-relaxed text-ink-400">
          Markup = (bill − pay) ÷ pay. Gross margin = (bill − loaded cost) ÷ bill. A 25% markup is not a 25% margin —
          that difference is the point of this calculator.
        </p>
      </div>
    </div>
  );
}

function IndiaCtc() {
  const [current, setCurrent] = useState("1200000");
  const [offered, setOffered] = useState("1500000");
  const [expected, setExpected] = useState("30");
  const [resigned, setResigned] = useState("");
  const [notice, setNotice] = useState("60");

  const hike = hikePct(num(current), num(offered));
  const afterHike = ctcAfterHike(num(current), num(expected));
  const monthly = monthlyCtc(num(offered));
  const dates = resigned ? noticeDates(resigned, num(notice)) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <Field label="Current CTC (per year)" value={current} onChange={setCurrent} suffix="₹" />
        <Field label="Offered CTC (per year)" value={offered} onChange={setOffered} suffix="₹" />
        <Field label="Hike the candidate expects" value={expected} onChange={setExpected} suffix="%" />
        <Field label="Resignation date" value={resigned} onChange={setResigned} type="date" />
        <Field label="Notice period" value={notice} onChange={setNotice} suffix="days" />
      </div>

      <div className="space-y-6">
        <div className="rounded-card border border-line bg-paper p-5">
          <h3 className="font-bold text-ink">Offer maths</h3>
          <dl className="mt-2">
            <Out label="Hike on the offer" value={hike === null ? "—" : pct(hike)} strong />
            <Out label="CTC at the expected hike" value={afterHike === null ? "—" : inr(afterHike)} />
            <Out
              label="Gap: offer vs. expectation"
              value={afterHike === null || !(num(offered) >= 0) ? "—" : inr(num(offered) - afterHike)}
            />
            <Out label="Offered CTC per month (before tax)" value={monthly === null ? "—" : inr(monthly)} />
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-ink-400">
            Monthly CTC is not take-home pay. In-hand salary depends on the salary structure, PF, tax regime and
            deductions — check the offer letter&rsquo;s breakup.
          </p>
        </div>

        <div className="rounded-card border border-line bg-white p-5">
          <h3 className="font-bold text-ink">Notice period</h3>
          {dates ? (
            <dl className="mt-2">
              <Out label="Last working day" value={longDate(dates.lastDay)} />
              <Out label="Earliest joining date" value={longDate(dates.joinFrom)} strong />
            </dl>
          ) : (
            <p className="mt-2 text-sm text-ink-400">Pick a resignation date and a notice period in whole days.</p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-ink-400">
            Counts calendar days from the day after resignation. The employer&rsquo;s policy and any buyout or early
            release decide the real date.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RateCalculator() {
  const [tab, setTab] = useState<"us" | "india">("us");
  return (
    <div className="rounded-card border border-line bg-white p-5 sm:p-8">
      <div role="tablist" aria-label="Calculator" className="mb-8 inline-flex rounded-field border border-line bg-paper p-1">
        {[
          { id: "us", label: "US rates" },
          { id: "india", label: "India CTC & notice" },
        ].map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id as "us" | "india")}
            className={cn(
              "h-10 rounded-[10px] px-4 text-[0.9375rem] font-semibold transition-colors",
              tab === t.id ? "bg-white text-ink shadow-[0_1px_2px_rgba(10,31,68,0.12)]" : "text-ink-400 hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "us" ? <UsRates /> : <IndiaCtc />}
    </div>
  );
}
