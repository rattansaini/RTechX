import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What personal data RTechX collects, why, who processes it, and how to have it deleted.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="3 November 2026">
      <p>
        <strong>{site.legal.entity}</strong> operates RTechX. This page describes
        what we collect, why, and how to get it removed. It is written to be read,
        not to be survived.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>When you book a course:</strong> your name, email address, WhatsApp
          number, and optionally your city and whether you&rsquo;re a student or a
          working recruiter.
        </li>
        <li>
          <strong>When you download a free resource or ask to be notified:</strong>{" "}
          your email address, and which resource or course it was for.
        </li>
        <li>
          <strong>Payment metadata:</strong> the amount, the order and payment
          reference, and whether it succeeded. <strong>We never receive or store
          your card number, UPI PIN, CVV or bank credentials</strong> &mdash; those
          go directly to Razorpay.
        </li>
        <li>
          <strong>Campaign attribution:</strong> if you arrive from an ad or a link
          with tracking parameters, we record which campaign sent you. This is stored
          for the current browsing session only and attached to your enquiry.
        </li>
      </ul>

      <h2>Why we collect it</h2>
      <ul>
        <li>To deliver the course you paid for and send joining details.</li>
        <li>To issue your certificate in the correct name.</li>
        <li>To answer your questions and process refunds.</li>
        <li>
          To understand which campaigns bring people who actually enrol, so we
          don&rsquo;t waste money advertising to the wrong audience.
        </li>
      </ul>
      <p>
        We do not sell your data. We do not share your email or phone number with
        other training providers, recruiters or employers.
      </p>

      <h2>1:1 Coaching bookings</h2>
      <p>
        When you book a Custom 1:1 Coaching call we collect your name, email, mobile
        number and the answers you give on the booking form. We use them to arrange
        the call and to contact you about it. They are stored in our database, and
        they are not shared or sold. You can ask us to delete them at{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>

      <h2>Free Recruiter Toolkit</h2>
      <p>
        When you sign in to the toolkit we store your email address, the date your
        free access started and ends, and a count of how many times you used each
        tool each day (to apply the daily limit). We do not store the job
        descriptions, resumes or other text you paste into a tool, or the answers
        the tools give. Please remove candidates&rsquo; names and contact details
        before pasting a resume. You can delete your toolkit account yourself from
        any tool page, or ask us at{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>

      <h2>Who processes it for us</h2>
      <ul>
        <li>
          <strong>Razorpay</strong> &mdash; payment processing. Subject to their own
          privacy policy and RBI regulation.
        </li>
        <li>
          <strong>Supabase</strong> &mdash; the database holding your booking. Hosted
          in Mumbai, India.
        </li>
        <li>
          <strong>Cal.com</strong> &mdash; the calendar where you pick your coaching
          call time. It receives your name and email.
        </li>
        <li>
          <strong>Resend</strong> &mdash; sends your confirmation and joining emails,
          and your toolkit sign-in codes.
        </li>
        <li>
          <strong>Anthropic (Claude)</strong> &mdash; the AI behind the toolkit. The
          text you paste into an AI tool is sent to Anthropic, through Netlify&rsquo;s
          AI Gateway, to produce the answer, subject to their privacy policies.
          Netlify says its gateway does not store prompts or answers. Their servers
          may be outside India.
        </li>
        <li>
          <strong>n8n</strong> &mdash; our internal workflow tool. When you submit a
          form or enrol, your name, email and phone number are passed to it so we
          can follow up. It is not used for advertising and your details are not
          sold or shared onward.
        </li>
        <li>
          <strong>Netlify</strong> &mdash; hosts the website.
        </li>
        <li>
          <strong>Google Analytics and Meta</strong> &mdash; only if you consent to
          analytics cookies. Decline and no analytics or advertising script loads at
          all.
        </li>
      </ul>

      <h2>How long we keep it</h2>
      <ul>
        <li>
          <strong>Enrolment and payment records:</strong> retained as long as
          required for tax and accounting purposes under Indian law.
        </li>
        <li>
          <strong>Enquiries that never became a booking:</strong> deleted within 24
          months, or immediately on request.
        </li>
      </ul>

      <h2>Your rights</h2>
      <p>
        Under India&rsquo;s Digital Personal Data Protection Act, 2023, you may ask
        us to show you what we hold about you, correct it, or delete it. Email{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> from the
        address you signed up with and we will act within 30 days.
      </p>
      <p>
        Deleting your data may mean we can no longer prove you completed a course or
        issue a replacement certificate. We&rsquo;ll tell you before doing it.
      </p>

      <h2>Cookies</h2>
      <p>
        The site sets no advertising cookies unless you consent. Campaign attribution
        uses your browser&rsquo;s session storage, which is cleared when you close
        the tab and is not shared across sites.
      </p>
      <p>
        If you sign in to the Free Recruiter Toolkit, one essential cookie keeps
        you signed in for up to 30 days. It holds no personal details and is
        removed when you sign out.
      </p>

      <h2>Children</h2>
      <p>
        This course is intended for adults entering or working in recruitment. We do
        not knowingly collect data from anyone under 18.
      </p>

      <h2>Changes</h2>
      <p>
        If we change this policy substantively, we&rsquo;ll update the date at the
        top and email anyone with an active booking.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> ·{" "}
        <a href={`https://wa.me/${site.whatsapp.e164}`}>{site.whatsapp.display}</a>
      </p>
    </LegalPage>
  );
}
