import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, CheckCircle2, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { flagshipCourse, nextBatch } from "@/content/courses";
import { site } from "@/lib/site";
import { formatBatchDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "You're in",
  robots: { index: false, follow: false },
};

/**
 * Deliberately shows no order details. The URL carries an order id so support
 * can trace a report, but the page renders the same generic next steps for
 * everyone — nobody's name, phone or amount is exposed to anyone who happens
 * to have the link.
 */
export default function ThankYouPage() {
  const course = flagshipCourse;
  const batch = nextBatch(course);
  const whatsappGroup = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || null;

  const steps = [
    {
      icon: CheckCircle2,
      title: "Check your email",
      body: "Your confirmation is on its way, with a calendar invite for every session attached. If it isn't there in a few minutes, look in spam — and tell us, so we can fix it for the next person.",
    },
    {
      icon: MessageCircle,
      title: whatsappGroup ? "Join the batch WhatsApp group" : "Watch your WhatsApp",
      body: whatsappGroup
        ? "The joining link and the day-before reminder go out there first. Your Field Kit follows after Day 1, and the full handbook after Day 3."
        : "We'll send the joining link to the number you gave us before Day 1. Your Field Kit follows after Day 1, and the full handbook after Day 3.",
    },
    {
      icon: CalendarPlus,
      title: batch
        ? `Turn up on ${formatBatchDate(batch.startDate)}`
        : "Turn up on the day",
      body: batch
        ? `${batch.timeIST}. Bring a laptop and an internet connection — no paid tools required. Come with a JD you're stuck on if you have one.`
        : "Bring a laptop and an internet connection. No paid tools required.",
    },
  ];

  return (
    <Container className="py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-pill border border-green/30 bg-green/10 px-3.5 py-1.5 text-[0.8125rem] font-semibold text-green-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Payment received
        </span>

        <h1 className="mt-6 text-[2rem] font-extrabold leading-[1.12] sm:text-5xl">
          You&rsquo;re in. Your seat is booked.
        </h1>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-400">
          Here&rsquo;s exactly what happens next — three things, none of them urgent.
        </p>

        <ol className="mt-10 space-y-5">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-card border border-line bg-white p-5 sm:p-6"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 font-display text-base font-extrabold text-blue-700">
                {i + 1}
              </span>
              <span>
                <span className="flex items-center gap-2 text-[1.0625rem] font-bold text-ink">
                  <step.icon className="size-4 text-blue" aria-hidden="true" />
                  {step.title}
                </span>
                <span className="mt-1.5 block text-[0.9375rem] leading-relaxed text-ink-400">
                  {step.body}
                </span>
              </span>
            </li>
          ))}
        </ol>

        {whatsappGroup && (
          <Button asChild size="lg" full className="mt-8">
            <a href={whatsappGroup} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-5" aria-hidden="true" />
              Join the WhatsApp group
            </a>
          </Button>
        )}

        <div className="mt-10 rounded-card border border-line bg-paper p-6">
          <h2 className="flex items-center gap-2 text-[1.0625rem] font-bold text-ink">
            <Share2 className="size-4 text-blue" aria-hidden="true" />
            Know someone who&rsquo;d benefit?
          </h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-400">
            Send them the course page. Most people who take this course were told about
            it by someone who&rsquo;d just done it.
          </p>
          <Button asChild variant="secondary" className="mt-4">
            <Link href={`/courses/${course.slug}`}>Copy the course link</Link>
          </Button>
        </div>

        <p className="mt-10 text-[0.9375rem] leading-relaxed text-ink-400">
          Something not right? Email{" "}
          <a
            href={`mailto:${site.supportEmail}`}
            className="font-semibold text-blue-700 underline underline-offset-4"
          >
            {site.supportEmail}
          </a>{" "}
          or WhatsApp{" "}
          <a
            href={`https://wa.me/${site.whatsapp.e164}`}
            className="font-semibold text-blue-700 underline underline-offset-4"
          >
            {site.whatsapp.display}
          </a>
          . A person reads both.
        </p>
      </div>
    </Container>
  );
}
