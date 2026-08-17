import { describe, expect, it } from "vitest";
import { buildBatchIcs } from "@/lib/ics";
import { flagshipCourse, nextBatch, tierById } from "@/content/courses";

/**
 * The calendar invite attached to every confirmation email.
 *
 * The hazard here is timezone arithmetic, not formatting. A batch date is a
 * plain label like "2026-09-01", but midnight IST is 18:30 UTC the day before —
 * so any code that anchors to +05:30 and reads the date back through UTC lands
 * a day early. That exact mistake has already been made once in this codebase.
 */

const batch = nextBatch(flagshipCourse)!;
const core = tierById(flagshipCourse, "core")!;
const full = tierById(flagshipCourse, "full")!;

function build(tier: typeof core) {
  return buildBatchIcs({
    course: flagshipCourse,
    tier,
    batchStartDate: batch.startDate,
    timeIST: batch.timeIST,
    attendeeEmail: "student@example.com",
    organiserEmail: "hello@rtechx.com",
  });
}

describe("buildBatchIcs", () => {
  it("gives the 3-day tier three sessions and the 5-day tier five", () => {
    expect((build(core).match(/BEGIN:VEVENT/g) ?? []).length).toBe(3);
    expect((build(full).match(/BEGIN:VEVENT/g) ?? []).length).toBe(5);
  });

  it("starts Day 1 on the batch start date, not the day before", () => {
    const ics = build(core);
    const starts = [...ics.matchAll(/DTSTART:(\d{8})T/g)].map((m) => m[1]);
    // 8:00 PM IST on 1 Sept is 14:30 UTC on 1 Sept — same calendar day. The bug
    // this guards against would produce 20260831.
    expect(starts[0]).toBe(batch.startDate.replace(/-/g, ""));
  });

  it("runs on consecutive days", () => {
    const starts = [...build(full).matchAll(/DTSTART:(\d{8})T/g)].map((m) =>
      Date.parse(
        `${m[1].slice(0, 4)}-${m[1].slice(4, 6)}-${m[1].slice(6, 8)}T00:00:00Z`
      )
    );
    for (let i = 1; i < starts.length; i++) {
      expect(starts[i] - starts[i - 1]).toBe(86_400_000);
    }
  });

  it("converts 8:00–10:00 PM IST to 14:30–16:30 UTC", () => {
    const ics = build(core);
    expect(ics).toContain("DTSTART:20260901T143000Z");
    expect(ics).toContain("DTEND:20260901T163000Z");
  });

  it("emits CRLF line endings, as RFC 5545 requires", () => {
    const ics = build(core);
    expect(ics).toContain("\r\n");
    expect(ics.split("\r\n").length).toBeGreaterThan(20);
  });

  it("escapes commas and semicolons in descriptions", () => {
    // An unescaped comma silently truncates a property in strict parsers.
    const body = build(core);
    const descriptions = body.split("\r\n").filter((l) => l.startsWith("DESCRIPTION:"));
    expect(descriptions.length).toBeGreaterThan(0);
    for (const d of descriptions) {
      const withoutEscaped = d.replace(/\\[,;n\\]/g, "");
      expect(withoutEscaped).not.toMatch(/(?<!\\)[,;]/);
    }
  });
});
