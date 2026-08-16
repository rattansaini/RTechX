import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { flagshipCourse } from "@/content/courses";
import { instructor, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Questions about RTechX courses? Email ${site.supportEmail} or WhatsApp ${site.whatsapp.display}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-[2rem] font-extrabold leading-tight sm:text-4xl">
          Talk to a person
        </h1>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-400">
          There&rsquo;s no support desk and no ticket queue. {instructor.name} reads
          both of these himself, usually the same day.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href={`mailto:${site.supportEmail}`}
            className="group rounded-card border border-line bg-white p-6 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_32px_-16px_rgba(10,31,68,0.28)]"
          >
            <span className="grid size-11 place-items-center rounded-field bg-blue-50 text-blue">
              <Mail className="size-5" aria-hidden="true" />
            </span>
            <span className="mt-5 block text-[1.0625rem] font-bold text-ink">Email</span>
            <span className="mt-1 block text-[0.9375rem] text-blue-700 underline underline-offset-4">
              {site.supportEmail}
            </span>
            <span className="mt-2 block text-[0.9375rem] text-ink-400">
              Best for anything detailed — refunds, invoices, certificates.
            </span>
          </a>

          <a
            href={`https://wa.me/${site.whatsapp.e164}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-card border border-line bg-white p-6 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_32px_-16px_rgba(10,31,68,0.28)]"
          >
            <span className="grid size-11 place-items-center rounded-field bg-green/12 text-green-ink">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <span className="mt-5 block text-[1.0625rem] font-bold text-ink">WhatsApp</span>
            <span className="mt-1 block text-[0.9375rem] text-blue-700 underline underline-offset-4">
              {site.whatsapp.display}
            </span>
            <span className="mt-2 block text-[0.9375rem] text-ink-400">
              Best for quick questions before you book.
            </span>
          </a>
        </div>

        <div className="mt-10 rounded-card border border-line bg-paper p-6">
          <h2 className="text-[1.0625rem] font-bold text-ink">
            Before you write — these come up most
          </h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem] leading-relaxed text-ink-400">
            <li>
              <strong className="text-ink">Do I need a technical background?</strong>{" "}
              No. That&rsquo;s the whole point of Day 1.
            </li>
            <li>
              <strong className="text-ink">Will I get a job?</strong> We don&rsquo;t
              promise placement, and we say so plainly.
            </li>
            <li>
              <strong className="text-ink">What if I miss a session?</strong> You get
              the recording, the handbook and the templates regardless.
            </li>
          </ul>
          <p className="mt-4 text-[0.9375rem] text-ink-400">
            The full set is on the{" "}
            <Link
              href={`/courses/${flagshipCourse.slug}#faq`}
              className="font-semibold text-blue-700 underline underline-offset-4"
            >
              course page FAQ
            </Link>
            .
          </p>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-[0.9375rem] leading-relaxed text-ink-400">
          <p className="font-semibold text-ink">{site.legal.entity}</p>
          {site.legal.address && <p className="mt-1">{site.legal.address}</p>}
          <p className="mt-1">{instructor.location}</p>
          <p className="mt-4 text-sm">{site.disclaimer}</p>
        </div>
      </div>
    </Container>
  );
}
