import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "The terms governing RTechX live online courses.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms and conditions" updated="16 August 2026">
      <p>
        These terms govern your use of {site.url.replace("https://", "")} and any
        course you book through it. The site and the courses are operated by{" "}
        <strong>{site.legal.entity}</strong> (&ldquo;RTechX&rdquo;, &ldquo;we&rdquo;).
        By booking, you agree to what follows.
      </p>

      <h2>What we provide</h2>
      <p>
        Live online training, delivered on Zoom or Google Meet at the dates and times
        shown at the point of sale. Depending on the option you buy, this includes
        session recordings, a handbook, templates and a certificate of completion.
        The syllabus published on the course page is what we teach.
      </p>

      <h2>What we don&rsquo;t provide</h2>
      <ul>
        <li>
          <strong>No guarantee of employment.</strong> We do not promise a job,
          interviews, placement or a salary outcome, and we have no hiring partners
          who owe you an interview.
        </li>
        <li>
          <strong>No immigration, legal or employment-law advice.</strong> Material
          on visas and employment models is educational awareness only. Take
          professional advice before relying on it in a real hiring decision.
        </li>
        <li>
          <strong>No paid tool licences.</strong> The course is designed so that a
          laptop and an internet connection are enough.
        </li>
      </ul>

      <h2>Booking and payment</h2>
      <ul>
        <li>Prices are in Indian Rupees and shown inclusive of applicable taxes.</li>
        <li>
          Payment is handled by Razorpay. We never see or store your full card
          details.
        </li>
        <li>
          Your seat is confirmed when payment succeeds and you receive a confirmation
          email. If you paid but received nothing within an hour, contact us &mdash;
          we can trace it.
        </li>
        <li>Seats are limited per batch and allocated in order of payment.</li>
      </ul>

      <h2>Attendance and access</h2>
      <p>
        Sessions run live. If you miss one, the recording is shared with everyone in
        the batch regardless of attendance. Access to recordings and materials is for
        your personal use, tied to the email you booked with.
      </p>

      <h2>Your conduct</h2>
      <ul>
        <li>
          Don&rsquo;t record, re-stream or redistribute sessions. They contain live
          screen-shares of real requirements.
        </li>
        <li>
          Don&rsquo;t share your access, handbook, templates or recordings with
          people who haven&rsquo;t paid.
        </li>
        <li>
          Treat other participants and the instructor decently. We may remove someone
          from a batch without refund for harassment or abuse.
        </li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        The handbook, templates, Boolean library, scorecards, recordings and course
        structure remain our property. You get a personal, non-transferable licence
        to use them in your own work &mdash; including in a job, for your employer.
        You may not resell them or teach from them.
      </p>

      <h2>Changes to batches</h2>
      <p>
        We may reschedule a session for genuine reasons &mdash; illness, technical
        failure, or too few participants to run properly. If new dates don&rsquo;t
        work for you, you may transfer to a later batch or take a full refund. See
        the <Link href="/legal/refund-policy">refund policy</Link>.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, our total liability arising from a course is
        limited to the amount you paid for it. We are not liable for indirect losses,
        including lost earnings or lost opportunities. Nothing here limits liability
        that cannot lawfully be limited.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India. Disputes are subject to the
        exclusive jurisdiction of the courts at Gurugram, Haryana.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
      </p>
    </LegalPage>
  );
}
