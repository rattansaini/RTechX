import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { flagshipCourse } from "@/content/courses";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund policy",
  description:
    "How refunds work for RTechX live courses: attend Day 1, and if it isn't what you expected, ask before Day 2 begins for a full refund.",
  alternates: { canonical: "/legal/refund-policy" },
};

export default function RefundPolicyPage() {
  const guarantee = flagshipCourse.guarantee;

  return (
    <LegalPage title="Refund policy" updated="16 August 2026">
      <p>
        We would rather refund you than have you sit through something that
        isn&rsquo;t right for you. This page says exactly when you can ask, and what
        happens when you do.
      </p>

      {guarantee && (
        <>
          <h2>The guarantee</h2>
          <p>
            <strong>{guarantee.label}</strong> {guarantee.body}
          </p>
        </>
      )}

      <h2>How to request a refund</h2>
      <ol>
        <li>
          Email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> from
          the address you booked with, or WhatsApp{" "}
          <a href={`https://wa.me/${site.whatsapp.e164}`}>{site.whatsapp.display}</a>.
        </li>
        <li>
          Send it <strong>before Day 2 of your batch begins</strong>. You don&rsquo;t
          need to explain yourself and there is no form to fill in.
        </li>
        <li>
          We confirm within 2 working days and process the refund to your original
          payment method.
        </li>
      </ol>

      <h2>How long it takes</h2>
      <p>
        We initiate the refund through Razorpay within <strong>2 working days</strong>{" "}
        of confirming your request. Once initiated, the money typically reaches your
        account in <strong>5&ndash;7 working days</strong> for cards and netbanking,
        and sooner for UPI. That final leg is controlled by your bank, not by us.
      </p>

      <h2>What isn&rsquo;t refundable</h2>
      <ul>
        <li>
          Requests made after Day 2 of the batch has begun. By that point you have
          had a full live session plus the recording and materials.
        </li>
        <li>
          Requests where the course was completed in full and a certificate issued.
        </li>
        <li>
          Duplicate or accidental payments are always refunded in full &mdash; tell
          us and we&rsquo;ll return the extra amount regardless of timing.
        </li>
      </ul>

      <h2>If we cancel or reschedule</h2>
      <p>
        If we cancel a batch, or move it to dates that don&rsquo;t work for you, you
        get a <strong>full refund</strong> or a free transfer to a later batch &mdash;
        your choice. This applies whatever stage the batch has reached.
      </p>

      <h2>Upgrades</h2>
      <p>
        If you upgraded from the 3-day course to the 5-day version, the same window
        applies to the upgrade amount, measured from Day 4 &mdash; the first
        specialisation day.
      </p>

      <h2>What we don&rsquo;t promise</h2>
      <p>
        RTechX does not guarantee employment, interviews or placement, and no refund
        is offered on the basis of not finding a job. We teach a skill and give you
        the artifacts you built. What you do with them is yours. This is stated
        openly on the{" "}
        <Link href={`/courses/${flagshipCourse.slug}`}>course page</Link> before you
        pay.
      </p>

      <h2>Questions</h2>
      <p>
        Email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. A
        person reads it, usually the same day.
      </p>
    </LegalPage>
  );
}
