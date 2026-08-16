import "server-only";
import { getCourse, type Tier, tierById } from "@/content/courses";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Server-side price resolution.
 *
 * The browser never gets a say in what anything costs. The client sends a
 * course slug, a tier id and maybe a coupon code; everything else — base
 * price, upgrade delta, discount, final amount — is derived here from the
 * content collection and the database. A tampered request can at worst pick a
 * different valid tier, never a different price.
 */

export type PriceBreakdown = {
  courseSlug: string;
  courseTitle: string;
  tier: Tier;
  isUpgrade: boolean;
  /** What this tier normally costs. */
  listPaise: number;
  /** After the upgrade delta, before any coupon. */
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  couponCode: string | null;
  couponLabel: string | null;
};

export type CouponRow = {
  code: string;
  discount_type: "percent" | "flat";
  discount_value: number;
  active: boolean;
  max_redemptions: number | null;
  redeemed_count: number;
  expires_at: string | null;
  applies_to_tier: string | null;
};

export type CouponResult =
  | { ok: true; coupon: CouponRow; discountPaise: number; label: string }
  | { ok: false; reason: string };

const toPaise = (rupees: number) => Math.round(rupees * 100);

/**
 * Validates a coupon against the database. Every rule is checked server-side,
 * including expiry and redemption cap, so a stale code cannot be replayed.
 */
export async function resolveCoupon(
  rawCode: string,
  tierId: Tier["id"],
  subtotalPaise: number
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "Enter a coupon code." };

  const { data, error } = await supabaseAdmin()
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) return { ok: false, reason: "Could not check that code. Try again." };
  if (!data) return { ok: false, reason: "That code isn't valid." };

  const coupon = data as CouponRow;

  if (!coupon.active) return { ok: false, reason: "That code is no longer active." };

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "That code has expired." };
  }

  if (
    typeof coupon.max_redemptions === "number" &&
    coupon.redeemed_count >= coupon.max_redemptions
  ) {
    return { ok: false, reason: "That code has been fully redeemed." };
  }

  if (coupon.applies_to_tier && coupon.applies_to_tier !== tierId) {
    return { ok: false, reason: "That code doesn't apply to this option." };
  }

  const discountPaise =
    coupon.discount_type === "percent"
      ? Math.round((subtotalPaise * coupon.discount_value) / 100)
      : toPaise(coupon.discount_value);

  // Never let a discount exceed the subtotal, and never produce a total that
  // Razorpay would reject as below its ₹1 minimum.
  const capped = Math.min(discountPaise, Math.max(0, subtotalPaise - 100));

  if (capped <= 0) return { ok: false, reason: "That code doesn't reduce this total." };

  return {
    ok: true,
    coupon,
    discountPaise: capped,
    label:
      coupon.discount_type === "percent"
        ? `${coupon.discount_value}% off`
        : `₹${coupon.discount_value} off`,
  };
}

export async function resolvePrice(input: {
  courseSlug: string;
  tierId: Tier["id"];
  isUpgrade: boolean;
  couponCode?: string | null;
}): Promise<PriceBreakdown | { error: string }> {
  const course = getCourse(input.courseSlug);
  if (!course) return { error: "Unknown course." };

  const tier = tierById(course, input.tierId);
  if (!tier) return { error: "Unknown option." };

  const listPaise = toPaise(tier.priceINR);

  // Upgrading from an existing 3-day booking charges only the difference.
  let subtotalPaise = listPaise;
  let isUpgrade = false;

  if (input.isUpgrade) {
    const parent = tier.inheritsFrom ? tierById(course, tier.inheritsFrom) : undefined;
    if (!parent) return { error: "This option can't be upgraded to." };
    subtotalPaise = listPaise - toPaise(parent.priceINR);
    isUpgrade = true;
    if (subtotalPaise < 100) return { error: "This upgrade has no balance to pay." };
  }

  let discountPaise = 0;
  let couponCode: string | null = null;
  let couponLabel: string | null = null;

  if (input.couponCode) {
    const result = await resolveCoupon(input.couponCode, input.tierId, subtotalPaise);
    if (result.ok) {
      discountPaise = result.discountPaise;
      couponCode = result.coupon.code;
      couponLabel = result.label;
    }
    // An invalid code is silently ignored here; the dedicated /api/coupons
    // endpoint is what tells the user why. Checkout must never fail because
    // someone typed a bad code.
  }

  return {
    courseSlug: course.slug,
    courseTitle: course.title,
    tier,
    isUpgrade,
    listPaise,
    subtotalPaise,
    discountPaise,
    totalPaise: subtotalPaise - discountPaise,
    couponCode,
    couponLabel,
  };
}
