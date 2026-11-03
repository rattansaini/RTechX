import { z } from "zod";
import { GOAL_MAX, OCCUPATIONS, TRACK_OPTIONS } from "@/content/coaching";

/**
 * Shared by the booking form (client) and /api/coaching/create-order (server)
 * so the two can never disagree. No server-only imports here.
 */

/** "+91 98765-43210" -> "+919876543210". */
export function normaliseMobile(raw: string) {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  return `+${digits}`;
}

/** E.164-ish: + then 8–15 digits. Indian numbers must be a 10-digit mobile. */
export function isValidMobile(raw: string) {
  const n = normaliseMobile(raw);
  if (!/^\+[1-9]\d{7,14}$/.test(n)) return false;
  if (n.startsWith("+91")) return /^\+91[6-9]\d{9}$/.test(n);
  return true;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const coachingBookingSchema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name.").max(120),
    email: z
      .string()
      .trim()
      .max(254)
      .regex(EMAIL_RE, "Please enter a valid email address."),
    mobile: z
      .string()
      .trim()
      .max(24)
      .refine(isValidMobile, "Please enter a valid mobile number with country code."),
    occupation: z.enum(OCCUPATIONS, { message: "Please choose one." }),
    tracks: z
      .array(z.enum(TRACK_OPTIONS))
      .min(1, "Pick at least one track.")
      .max(TRACK_OPTIONS.length),
    goal: z
      .string()
      .trim()
      .min(5, "Tell us in a line or two what you want to achieve.")
      .max(GOAL_MAX, `Please keep this under ${GOAL_MAX} characters.`),
    consent: z.literal(true, { message: "Please tick the box to continue." }),
    company: z.string().max(0).optional(), // honeypot
  })
  .strict();

export type CoachingBooking = z.infer<typeof coachingBookingSchema>;

/**
 * True when a new Cal.com booking would silently replace a different booking
 * that is already on this paid row — i.e. one ₹299 payment used for two calls.
 * A reschedule (BOOKING_RESCHEDULED) or a retry of the same uid is not.
 */
export function isSecondBooking(
  row: { call_status: string | null; cal_booking_uid: string | null },
  trigger: string,
  uid: string
) {
  return (
    trigger === "BOOKING_CREATED" &&
    row.call_status === "booked" &&
    !!row.cal_booking_uid &&
    row.cal_booking_uid !== uid
  );
}
