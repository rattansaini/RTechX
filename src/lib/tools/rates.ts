/**
 * Rate & CTC maths — pure functions, no I/O, shared by the calculator and the
 * tests. Definitions follow the Masterclass:
 *
 *   markup        = (bill − pay) / pay
 *   loaded cost   = pay × (1 + burden)        burden = employer taxes/benefits,
 *                                             usually 0 for C2C and 1099
 *   gross margin  = (bill − loaded cost) / bill
 *
 * Hours per year use 2,080 (40 h × 52 weeks), the US convention for
 * annualising an hourly rate.
 */

export const HOURS_PER_YEAR = 2080;

export type UsRateResult = {
  loadedCost: number;
  markupPct: number;
  spreadPerHour: number;
  marginPerHour: number;
  marginPct: number;
  annualPay: number;
  annualBill: number;
  annualMargin: number;
};

export function usRates(input: { pay: number; bill: number; burdenPct: number }): UsRateResult | null {
  const { pay, bill, burdenPct } = input;
  if (!(pay > 0) || !(bill > 0) || !(burdenPct >= 0)) return null;
  const loadedCost = pay * (1 + burdenPct / 100);
  const marginPerHour = bill - loadedCost;
  return {
    loadedCost,
    markupPct: ((bill - pay) / pay) * 100,
    spreadPerHour: bill - pay,
    marginPerHour,
    marginPct: (marginPerHour / bill) * 100,
    annualPay: pay * HOURS_PER_YEAR,
    annualBill: bill * HOURS_PER_YEAR,
    annualMargin: marginPerHour * HOURS_PER_YEAR,
  };
}

/** Bill rate needed to hit a target gross margin on a given pay rate. */
export function billForMargin(input: { pay: number; burdenPct: number; marginPct: number }): number | null {
  const { pay, burdenPct, marginPct } = input;
  if (!(pay > 0) || !(burdenPct >= 0) || !(marginPct >= 0) || !(marginPct < 100)) return null;
  return (pay * (1 + burdenPct / 100)) / (1 - marginPct / 100);
}

export function hikePct(current: number, offered: number): number | null {
  if (!(current > 0) || !(offered >= 0)) return null;
  return ((offered - current) / current) * 100;
}

export function ctcAfterHike(current: number, pct: number): number | null {
  if (!(current > 0) || !Number.isFinite(pct)) return null;
  return current * (1 + pct / 100);
}

/** Gross monthly CTC, before tax and deductions. Not take-home pay. */
export function monthlyCtc(annual: number): number | null {
  if (!(annual > 0)) return null;
  return annual / 12;
}

/**
 * Last working day and earliest joining date after a notice period.
 * Dates are ISO yyyy-mm-dd and handled in UTC so no time zone shifts the day.
 * Notice counts calendar days from the day after resignation.
 */
export function noticeDates(resignedOn: string, noticeDays: number): { lastDay: string; joinFrom: string } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(resignedOn) || !(noticeDays >= 0) || !Number.isInteger(noticeDays)) return null;
  const start = Date.parse(`${resignedOn}T00:00:00Z`);
  if (Number.isNaN(start)) return null;
  const day = 864e5;
  const last = new Date(start + noticeDays * day);
  const join = new Date(start + (noticeDays + 1) * day);
  return { lastDay: last.toISOString().slice(0, 10), joinFrom: join.toISOString().slice(0, 10) };
}
