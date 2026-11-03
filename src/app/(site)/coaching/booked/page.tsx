import type { Metadata } from "next";
import { CalEmbed } from "@/components/coaching/cal-embed";
import { Container } from "@/components/ui/container";
import { formatIST } from "@/lib/coaching-email";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Pick your time — RTechX" },
  robots: { index: false, follow: false },
};

// Reads the live payment status; must never be cached.
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-xl rounded-card border border-line bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h1>
        <div className="mt-4 space-y-3 text-[1.0625rem] leading-relaxed text-ink-400">{children}</div>
      </div>
    </Container>
  );
}

const whatsapp = (
  <p>
    Questions? WhatsApp us on{" "}
    <a
      className="font-semibold text-blue-700 underline underline-offset-4"
      href={`https://wa.me/${site.whatsapp.e164}`}
    >
      {site.whatsapp.display}
    </a>{" "}
    or email{" "}
    <a
      className="font-semibold text-blue-700 underline underline-offset-4"
      href={`mailto:${site.supportEmail}`}
    >
      {site.supportEmail}
    </a>
    .
  </p>
);

export default async function BookedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  let row: {
    id: string;
    full_name: string;
    email: string;
    payment_status: string;
    call_status: string | null;
    call_start_at: string | null;
  } | null = null;

  if (ref && UUID.test(ref) && isSupabaseConfigured()) {
    const { data } = await supabaseAdmin()
      .from("coaching_calls")
      .select("id, full_name, email, payment_status, call_status, call_start_at")
      .eq("id", ref)
      .maybeSingle();
    row = data;
  }

  if (!row) {
    return (
      <Message title="We couldn't find that booking">
        <p>The link may be incomplete. Check the email we sent after payment and use the button in it.</p>
        {whatsapp}
      </Message>
    );
  }

  if (row.payment_status !== "paid") {
    return (
      <Message title="We're confirming your payment">
        <p>
          We haven&rsquo;t seen your payment come through yet. If you just paid, wait a minute and
          refresh this page. UPI confirmations can take a moment.
        </p>
        <p>If you were not charged, you can start again from the coaching page.</p>
        {whatsapp}
      </Message>
    );
  }

  const calLink = process.env.NEXT_PUBLIC_CAL_COACHING_LINK;
  if (!calLink) {
    return (
      <Message title="Payment received">
        <p>
          Thank you, {row.full_name.split(" ")[0]}. Our calendar isn&rsquo;t switched on yet, so
          Rattan will email you to fix a time.
        </p>
        {whatsapp}
      </Message>
    );
  }

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">Step 2 of 2</p>
        <h1 className="mt-3 text-[1.875rem] font-extrabold leading-[1.12] sm:text-4xl">
          Payment received — now pick your time
        </h1>
        {row.call_status === "booked" && row.call_start_at && (
          <p className="mt-4 rounded-field border border-blue-200 bg-blue-50 px-4 py-3 text-[0.9375rem] text-ink">
            You&rsquo;re booked for {formatIST(row.call_start_at)}. Pick a different time below to
            reschedule.
          </p>
        )}
        <div className="mt-8">
          <CalEmbed calLink={calLink} name={row.full_name} email={row.email} refId={row.id} />
        </div>
        <div className="mt-6 text-[0.9375rem] text-ink-400">{whatsapp}</div>
      </div>
    </Container>
  );
}
