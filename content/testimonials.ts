import type { Testimonial } from "./courses/types";

/**
 * Real reviews only.
 *
 * The reviews section reads this array and renders NOTHING while it is empty —
 * no placeholder cards, no sample quotes, no "coming soon" state. That is
 * deliberate: invented testimonials attributed to named people are fabricated
 * evidence, and they carry real exposure under India's Consumer Protection Act
 * and Meta's advertising policies.
 *
 * To add one, you need all three fields. A quote must name a specific outcome —
 * what the person could do afterwards, how much work it was, or how the support
 * held up. "Great course!" is not a testimonial and should not go in here.
 *
 * Example of the shape (keep this commented until it's a real person):
 *
 * {
 *   name: "…",
 *   role: "…",
 *   quote: "…",
 *   photo: "/testimonials/….jpg",
 * }
 */
export const testimonials: Testimonial[] = [];
