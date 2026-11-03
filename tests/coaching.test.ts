import crypto from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  COACHING_BASE_PAISE,
  COACHING_GST_PAISE,
  COACHING_TOTAL_PAISE,
  TOTAL_LABEL,
} from "@/content/coaching";
import { verifyCalSignature } from "@/lib/cal";
import { coachingBookingSchema, isValidMobile, normaliseMobile } from "@/lib/coaching";

const valid = {
  fullName: "Asha Verma",
  email: "asha@example.com",
  mobile: "+91 98765 43210",
  occupation: "Recruiter",
  tracks: ["AI and automation"],
  goal: "Save hours on screening",
  consent: true,
};

describe("coaching price", () => {
  it("is ₹299 + 18% GST = 35282 paise", () => {
    expect(COACHING_BASE_PAISE).toBe(29900);
    expect(COACHING_GST_PAISE).toBe(5382);
    expect(COACHING_TOTAL_PAISE).toBe(35282);
    expect(TOTAL_LABEL).toBe("₹352.82");
  });
});

describe("mobile validation", () => {
  it("normalises and accepts Indian mobiles", () => {
    expect(normaliseMobile("+91 98765-43210")).toBe("+919876543210");
    expect(isValidMobile("+91 98765 43210")).toBe(true);
  });
  it("rejects short or non-mobile Indian numbers and missing country code", () => {
    expect(isValidMobile("+91 12345 67890")).toBe(false);
    expect(isValidMobile("+91 98765")).toBe(false);
    expect(isValidMobile("+91 ")).toBe(false);
  });
  it("accepts other country codes in E.164 range", () => {
    expect(isValidMobile("+44 7911 123456")).toBe(true);
  });
});

describe("booking schema", () => {
  it("accepts a valid booking", () => {
    expect(coachingBookingSchema.safeParse(valid).success).toBe(true);
  });
  it("requires consent, a track, and a goal within 500 chars", () => {
    expect(coachingBookingSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(coachingBookingSchema.safeParse({ ...valid, tracks: [] }).success).toBe(false);
    expect(coachingBookingSchema.safeParse({ ...valid, goal: "x".repeat(501) }).success).toBe(false);
  });
  it("rejects unknown fields, so an amount can't be smuggled in", () => {
    expect(coachingBookingSchema.safeParse({ ...valid, amount: 1 }).success).toBe(false);
  });
});

describe("Cal.com signature", () => {
  const original = process.env.CAL_WEBHOOK_SECRET;
  afterEach(() => {
    process.env.CAL_WEBHOOK_SECRET = original;
  });
  it("accepts a correct HMAC and rejects a wrong one", () => {
    process.env.CAL_WEBHOOK_SECRET = "s3cret";
    const body = '{"triggerEvent":"BOOKING_CREATED"}';
    const sig = crypto.createHmac("sha256", "s3cret").update(body).digest("hex");
    expect(verifyCalSignature(body, sig)).toBe(true);
    expect(verifyCalSignature(body, sig.replace(/.$/, "0"))).toBe(false);
    expect(verifyCalSignature(body + " ", sig)).toBe(false);
  });
  it("rejects everything when no secret is set", () => {
    delete process.env.CAL_WEBHOOK_SECRET;
    expect(verifyCalSignature("{}", "abc")).toBe(false);
  });
});
