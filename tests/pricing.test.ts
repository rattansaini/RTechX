import { describe, expect, it, vi } from "vitest";

/**
 * Server-side price resolution.
 *
 * The browser sends a slug, a tier and maybe a coupon — never an amount. These
 * tests pin the arithmetic that turns those into paise, including the upgrade
 * delta, which is the one figure a customer could otherwise be overcharged for.
 *
 * Supabase is stubbed, so no coupon lookup leaves the machine.
 */

vi.mock("@/lib/supabase", () => ({
  supabaseAdmin: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
    }),
  }),
}));

const { resolvePrice } = await import("@/lib/pricing");

describe("resolvePrice", () => {
  it("charges the list price for the 3-day tier", async () => {
    const p = await resolvePrice({
      courseSlug: "it-recruitment-masterclass",
      tierId: "core",
      isUpgrade: false,
    });
    expect("error" in p).toBe(false);
    if ("error" in p) return;
    expect(p.totalPaise).toBe(49_900);
    expect(p.isUpgrade).toBe(false);
  });

  it("charges the list price for the 5-day tier", async () => {
    const p = await resolvePrice({
      courseSlug: "it-recruitment-masterclass",
      tierId: "full",
      isUpgrade: false,
    });
    if ("error" in p) throw new Error(p.error);
    expect(p.totalPaise).toBe(99_900);
  });

  it("charges only the difference on an upgrade", async () => {
    const p = await resolvePrice({
      courseSlug: "it-recruitment-masterclass",
      tierId: "full",
      isUpgrade: true,
    });
    if ("error" in p) throw new Error(p.error);
    // ₹999 − ₹499. Someone who already paid for the 3-day must never be billed
    // the full ₹999 a second time.
    expect(p.totalPaise).toBe(50_000);
    expect(p.isUpgrade).toBe(true);
  });

  it("refuses to 'upgrade' to the entry tier", async () => {
    const p = await resolvePrice({
      courseSlug: "it-recruitment-masterclass",
      tierId: "core",
      isUpgrade: true,
    });
    expect("error" in p).toBe(true);
  });

  it("rejects an unknown course or tier rather than defaulting to a price", async () => {
    expect(
      "error" in
        (await resolvePrice({ courseSlug: "nope", tierId: "core", isUpgrade: false }))
    ).toBe(true);
    expect(
      "error" in
        (await resolvePrice({
          courseSlug: "it-recruitment-masterclass",
          // @ts-expect-error — deliberately invalid, mimicking a tampered request
          tierId: "free",
          isUpgrade: false,
        }))
    ).toBe(true);
  });

  it("ignores an unknown coupon instead of failing checkout", async () => {
    const p = await resolvePrice({
      courseSlug: "it-recruitment-masterclass",
      tierId: "core",
      isUpgrade: false,
      couponCode: "NOTAREALCODE",
    });
    if ("error" in p) throw new Error(p.error);
    expect(p.discountPaise).toBe(0);
    expect(p.totalPaise).toBe(49_900);
  });

  it("never returns a total below Razorpay's ₹1 floor", async () => {
    for (const tierId of ["core", "full"] as const) {
      for (const isUpgrade of [false, true]) {
        const p = await resolvePrice({
          courseSlug: "it-recruitment-masterclass",
          tierId,
          isUpgrade,
        });
        if ("error" in p) continue;
        expect(p.totalPaise).toBeGreaterThanOrEqual(100);
      }
    }
  });
});
