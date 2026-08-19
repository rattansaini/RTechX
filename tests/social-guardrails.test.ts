import { describe, expect, it } from "vitest";
import { applyGuardrails } from "@/lib/social/generate";
import { getTodaysSlot } from "@/lib/social/schedule";
import type { GeneratedContent } from "@/lib/social/types";

/**
 * The gate that decides whether a generated post can be published at all.
 *
 * `has_verified_source: false` does not mean "post it with a caveat" — it
 * routes the draft to manual review instead of rendering and queueing it. So
 * this function is the only automated thing standing between a language model
 * and the brand's public feed, on a site whose entire pitch is that every
 * number is checkable. It runs unattended at 9am and nobody reads it.
 *
 * No API key is needed here: the model call is separate, and this is the
 * deterministic pass that runs over whatever the model returned.
 */

function content(over: Partial<GeneratedContent> = {}): GeneratedContent {
  return {
    format: "still",
    angle: "test",
    eyebrow: "India IT",
    headline: "Specialised hiring is growing.",
    stat_primary: null,
    stat_secondary: null,
    takeaway: "That gap is the argument for specialising.",
    takeaway_highlight: "gap",
    source_line: "Source: Indian Staffing Federation, Q3 FY2025-26",
    has_verified_source: true,
    caption_instagram: "A short honest caption. Explore the curriculum — link in bio.",
    caption_facebook: "A short honest caption. Explore the curriculum: www.rtechx.com",
    hashtags: "#itrecruitment #hiring",
    alt_text: "Navy graphic with two statistics.",
    reel_beats: [],
    ...over,
  } as GeneratedContent;
}

describe("applyGuardrails", () => {
  it("lets a clean, sourced post through", () => {
    expect(applyGuardrails(content(), "still").has_verified_source).toBe(true);
  });

  it("flags a number that arrives without a source line", () => {
    const out = applyGuardrails(
      content({
        headline: "IT staffing grew 16.1% this year.",
        source_line: "",
      }),
      "still"
    );
    expect(out.has_verified_source).toBe(false);
    expect(out.angle).toContain("numeric claim without a source line");
  });

  it.each([
    "guaranteed job",
    "guaranteed placement",
    "seats left",
    "last chance",
    "hurry",
    "limited time",
    "unlock",
    "supercharge",
    "game-changer",
    "revolutionary",
  ])("flags the banned phrase %s", (phrase) => {
    const out = applyGuardrails(
      content({ caption_instagram: `Something ${phrase} here. Explore the curriculum.` }),
      "still"
    );
    expect(out.has_verified_source).toBe(false);
  });

  it("flags a caption with no approved call to action", () => {
    const out = applyGuardrails(
      content({
        caption_instagram: "Just some text with no CTA.",
        caption_facebook: "Same here.",
      }),
      "still"
    );
    expect(out.has_verified_source).toBe(false);
    expect(out.angle).toContain("no approved CTA");
  });

  it("accepts any one of the approved CTAs", () => {
    for (const cta of [
      "Explore the curriculum",
      "Reserve your seat",
      "Download the free guide",
      "Learn how the course works",
    ]) {
      const out = applyGuardrails(
        content({ caption_instagram: `Body text. ${cta}.` }),
        "still"
      );
      expect(out.has_verified_source).toBe(true);
    }
  });

  it("catches lakh and crore claims, not just percentages", () => {
    const out = applyGuardrails(
      content({ takeaway: "Around 5 lakh roles are projected.", source_line: "" }),
      "still"
    );
    expect(out.has_verified_source).toBe(false);
  });

  it("forces the format back to the slot's format", () => {
    // A model that returns the wrong format would otherwise send a reel script
    // down the still path, or vice versa.
    expect(applyGuardrails(content({ format: "reel" }), "still").format).toBe("still");
  });

  it("flags a reel with too few beats to be producible", () => {
    const out = applyGuardrails(content({ format: "reel", reel_beats: [] }), "reel");
    expect(out.has_verified_source).toBe(false);
  });
});

describe("getTodaysSlot", () => {
  it("posts nothing at the weekend", () => {
    // 2026-08-22 is a Saturday, 2026-08-23 a Sunday.
    expect(getTodaysSlot(new Date("2026-08-22T12:00:00+05:30"))).toBeNull();
    expect(getTodaysSlot(new Date("2026-08-23T12:00:00+05:30"))).toBeNull();
  });

  it("returns a slot on every weekday", () => {
    const weekdays = [
      "2026-08-24", "2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28",
    ];
    for (const d of weekdays) {
      const slot = getTodaysSlot(new Date(`${d}T12:00:00+05:30`));
      expect(slot, d).not.toBeNull();
      expect(slot!.dateIso).toBe(d);
      expect(["still", "reel"]).toContain(slot!.format);
    }
  });
});
