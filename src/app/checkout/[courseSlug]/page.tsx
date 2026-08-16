import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Container } from "@/components/ui/container";
import { courseSlugs, getCourse, nextBatch } from "@/content/courses";
import { site } from "@/lib/site";
import { formatBatchDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return courseSlugs().map((courseSlug) => ({ courseSlug }));
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ tier?: string; upgrade?: string }>;
}) {
  const { courseSlug } = await params;
  const { tier, upgrade } = await searchParams;

  const course = getCourse(courseSlug);
  if (!course) notFound();

  const initialTierId = tier === "full" ? "full" : "core";
  const isUpgrade = upgrade === "true" && initialTierId === "full";
  const batch = nextBatch(course);

  // Read at request time, not build time, so adding keys doesn't need a rebuild.
  const paymentsEnabled = Boolean(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );

  return (
    <Container className="py-10 sm:py-14">
      <Link
        href={`/courses/${course.slug}`}
        className="inline-flex items-center gap-1.5 py-1 text-[0.9375rem] font-medium text-ink-400 hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to the course
      </Link>

      <h1 className="mt-6 text-[1.875rem] font-extrabold leading-tight sm:text-4xl">
        {isUpgrade ? "Upgrade to all 5 days" : "Book your seat"}
      </h1>
      {batch && (
        <p className="mt-3 text-[1.0625rem] text-ink-400">
          Live online · Batch starts {formatBatchDate(batch.startDate)} · {batch.timeIST}
        </p>
      )}

      {!paymentsEnabled && (
        <p
          role="alert"
          className="mt-6 rounded-card border border-amber-300 bg-amber-50 p-4 text-[0.9375rem] text-amber-900"
        >
          Online payment isn&rsquo;t switched on yet. Email{" "}
          <a href={`mailto:${site.supportEmail}`} className="font-semibold underline">
            {site.supportEmail}
          </a>{" "}
          or WhatsApp {site.whatsapp.display} and we&rsquo;ll book you in directly.
        </p>
      )}

      <div className="mt-10">
        <CheckoutForm
          courseSlug={course.slug}
          courseTitle={course.title}
          tiers={course.tiers.map((t) => ({
            id: t.id,
            name: t.name,
            durationLabel: t.durationLabel,
            priceINR: t.priceINR,
            highlight: t.highlight,
          }))}
          initialTierId={initialTierId}
          isUpgrade={isUpgrade}
          paymentsEnabled={paymentsEnabled}
          supportEmail={site.supportEmail}
        />
      </div>

      {course.guarantee && (
        <div className="mt-10 flex max-w-2xl gap-3.5 rounded-card border border-green/30 bg-green/8 p-5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-ink" aria-hidden="true" />
          <p className="text-[0.9375rem] leading-relaxed text-ink">
            <strong className="font-semibold">{course.guarantee.label}</strong>{" "}
            {course.guarantee.body}
          </p>
        </div>
      )}

      <p className="mt-8 max-w-2xl text-[0.8125rem] leading-relaxed text-ink-400">
        By paying you agree to our{" "}
        <Link href="/legal/terms" className="underline hover:text-ink">terms</Link>,{" "}
        <Link href="/legal/privacy" className="underline hover:text-ink">privacy policy</Link> and{" "}
        <Link href="/legal/refund-policy" className="underline hover:text-ink">refund policy</Link>.{" "}
        {site.disclaimer}
      </p>
    </Container>
  );
}
