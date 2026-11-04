import { describe, expect, it } from "vitest";
import { toolBySlug, tools, validateToolInput } from "@/content/tools";
import { parseResult } from "@/lib/tools/ai";
import { billForMargin, hikePct, monthlyCtc, noticeDates, usRates } from "@/lib/tools/rates";
import { accessEnd, signSession, startOfTodayIST, verifySession } from "@/lib/tools/session";

describe("US rate maths", () => {
  it("separates markup from margin", () => {
    const r = usRates({ pay: 50, bill: 70, burdenPct: 20 });
    expect(r).not.toBeNull();
    if (!r) return;
    expect(r.markupPct).toBeCloseTo(40);
    expect(r.loadedCost).toBeCloseTo(60);
    expect(r.marginPerHour).toBeCloseTo(10);
    expect(r.marginPct).toBeCloseTo(14.2857, 3);
    expect(r.annualMargin).toBeCloseTo(20_800);
  });
  it("finds the bill rate for a target margin", () => {
    expect(billForMargin({ pay: 50, burdenPct: 20, marginPct: 20 })).toBeCloseTo(75);
    expect(billForMargin({ pay: 50, burdenPct: 0, marginPct: 100 })).toBeNull();
  });
  it("rejects zero or missing rates", () => {
    expect(usRates({ pay: 0, bill: 70, burdenPct: 0 })).toBeNull();
    expect(usRates({ pay: Number.NaN, bill: 70, burdenPct: 0 })).toBeNull();
  });
});

describe("India CTC maths", () => {
  it("computes hike and monthly CTC", () => {
    expect(hikePct(1_200_000, 1_500_000)).toBeCloseTo(25);
    expect(monthlyCtc(1_500_000)).toBeCloseTo(125_000);
  });
  it("counts notice days from the day after resignation", () => {
    expect(noticeDates("2026-11-04", 60)).toEqual({ lastDay: "2027-01-03", joinFrom: "2027-01-04" });
    expect(noticeDates("2026-11-04", 1.5)).toBeNull();
    expect(noticeDates("04/11/2026", 30)).toBeNull();
  });
});

describe("toolkit session", () => {
  const key = "k".repeat(40);
  it("round-trips a signed token", () => {
    const t = signSession("user-1", 1_000, key);
    expect(verifySession(t ?? undefined, 2_000, key)).toBe("user-1");
  });
  it("rejects a tampered, foreign or expired token", () => {
    const t = signSession("user-1", 1_000, key) as string;
    const [payload, sig] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ u: "admin", e: 9e15 })).toString("base64url");
    expect(verifySession(`${forged}.${sig}`, 2_000, key)).toBeNull();
    expect(verifySession(t, 2_000, "x".repeat(40))).toBeNull();
    expect(verifySession(`${payload}.${sig}`, 1_000 + 31 * 864e5, key)).toBeNull();
    expect(verifySession(undefined, 2_000, key)).toBeNull();
  });
  it("uses the later of trial end and manual extension", () => {
    expect(accessEnd({ trialEndsAt: "2026-11-11T00:00:00Z", accessUntil: null })).toBe("2026-11-11T00:00:00Z");
    expect(accessEnd({ trialEndsAt: "2026-11-11T00:00:00Z", accessUntil: "2027-01-01T00:00:00Z" })).toBe(
      "2027-01-01T00:00:00Z"
    );
  });
  it("resets the daily count at midnight India time", () => {
    // 4 Nov 2026, 01:00 IST = 3 Nov 2026, 19:30 UTC → day starts 3 Nov 18:30 UTC.
    expect(startOfTodayIST(Date.parse("2026-11-03T19:30:00Z"))).toBe("2026-11-03T18:30:00.000Z");
  });
});

describe("tool input validation", () => {
  const decoder = toolBySlug("jd-decoder")!;
  it("requires the JD and caps its length", () => {
    expect(validateToolInput(decoder, { jd: "" }).ok).toBe(false);
    expect(validateToolInput(decoder, { jd: "x".repeat(8001) }).ok).toBe(false);
    expect(validateToolInput(decoder, { jd: "Java developer, Spring Boot" }).ok).toBe(true);
  });
  it("rejects unknown fields", () => {
    expect(validateToolInput(decoder, { jd: "Java", model: "x" }).ok).toBe(false);
  });
  it("needs a JD or a string for the Boolean builder", () => {
    const b = toolBySlug("boolean-builder")!;
    expect(validateToolInput(b, { jd: "", existing: "", location: "" }).ok).toBe(false);
    expect(validateToolInput(b, { existing: "Java AND Spring" }).ok).toBe(true);
  });
  it("only accepts listed channels", () => {
    const o = toolBySlug("outreach-writer")!;
    expect(validateToolInput(o, { jd: "Java", highlights: "6 yrs", channel: "Fax" }).ok).toBe(false);
    expect(validateToolInput(o, { jd: "Java", highlights: "6 yrs", channel: "WhatsApp" }).ok).toBe(true);
  });
  it("defines seven tools with unique slugs", () => {
    expect(tools).toHaveLength(7);
    expect(new Set(tools.map((t) => t.slug)).size).toBe(7);
  });
});

describe("AI result parsing", () => {
  it("pulls the JSON out of the reply", () => {
    const r = parseResult('Here you go {"title":"T","sections":[{"heading":"H","bullets":["a"]}]} done');
    expect(r.title).toBe("T");
  });
  it("throws on a reply without valid JSON", () => {
    expect(() => parseResult("no json here")).toThrow();
    expect(() => parseResult('{"title":"T","sections":[]}')).toThrow();
  });
});
