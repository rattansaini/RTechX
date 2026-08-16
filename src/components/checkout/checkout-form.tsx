"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureAttribution, readAttribution } from "@/lib/attribution";
import { cn, formatINR } from "@/lib/utils";

type TierOption = {
  id: "core" | "full";
  name: string;
  durationLabel: string;
  priceINR: number;
  highlight?: boolean;
};

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  notes?: Record<string, string>;
  theme?: { color: string };
  handler: (r: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const STATUS_OPTIONS = [
  { value: "student", label: "Student / fresher" },
  { value: "working-recruiter", label: "Working recruiter" },
  { value: "other", label: "Other" },
] as const;

export function CheckoutForm({
  courseSlug,
  courseTitle,
  tiers,
  initialTierId,
  isUpgrade,
  paymentsEnabled,
  supportEmail,
}: {
  courseSlug: string;
  courseTitle: string;
  tiers: TierOption[];
  initialTierId: "core" | "full";
  isUpgrade: boolean;
  paymentsEnabled: boolean;
  supportEmail: string;
}) {
  const router = useRouter();
  const uid = useId();

  const [tierId, setTierId] = useState<"core" | "full">(initialTierId);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    status: "" as "" | (typeof STATUS_OPTIONS)[number]["value"],
    company: "", // honeypot
  });

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; label: string; discountPaise: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);

  const [scriptReady, setScriptReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  const tier = useMemo(
    () => tiers.find((t) => t.id === tierId) ?? tiers[0],
    [tiers, tierId]
  );

  // Mirrors the server's calculation so the displayed figure matches what is
  // actually charged. The server remains the authority — this is display only.
  const { subtotalPaise, totalPaise } = useMemo(() => {
    const list = Math.round(tier.priceINR * 100);
    let subtotal = list;
    if (isUpgrade && tier.id === "full") {
      const core = tiers.find((t) => t.id === "core");
      if (core) subtotal = list - Math.round(core.priceINR * 100);
    }
    return {
      subtotalPaise: subtotal,
      totalPaise: Math.max(0, subtotal - (coupon?.discountPaise ?? 0)),
    };
  }, [tier, tiers, isUpgrade, coupon]);

  // A coupon validated against one tier may not apply to another.
  useEffect(() => {
    setCoupon(null);
    setCouponMsg(null);
  }, [tierId]);

  async function applyCoupon() {
    if (!couponInput.trim() || couponChecking) return;
    setCouponChecking(true);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: couponInput, courseSlug, tierId, upgrade: isUpgrade }),
      });
      const body = await res.json();
      if (body.ok) {
        setCoupon({ code: body.code, label: body.label, discountPaise: body.discountPaise });
        setCouponMsg(`${body.label} applied.`);
      } else {
        setCoupon(null);
        setCouponMsg(body.reason ?? "That code isn't valid.");
      }
    } catch {
      setCouponMsg("Couldn't check that code. Try again.");
    } finally {
      setCouponChecking(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!paymentsEnabled) {
      setError(`Payments aren't switched on yet. Email ${supportEmail} and we'll book you in.`);
      return;
    }
    if (!scriptReady || !window.Razorpay) {
      setError("Payment window is still loading. Give it a second and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          tierId,
          upgrade: isUpgrade,
          couponCode: coupon?.code ?? null,
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city || undefined,
          status: form.status || undefined,
          attribution: readAttribution(),
          company: form.company || undefined,
        }),
      });

      const order = await res.json();
      if (!res.ok) {
        setError(order.error ?? "Couldn't start the payment.");
        setSubmitting(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "RTechX",
        description: `${order.courseTitle} — ${order.tierName}`,
        order_id: order.razorpayOrderId,
        prefill: order.prefill,
        theme: { color: "#0060F0" },
        modal: {
          ondismiss: () => {
            // Not an error: they closed the window. The lead is already saved.
            setSubmitting(false);
          },
        },
        handler: async (response) => {
          try {
            const verify = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(response),
            });
            const result = await verify.json();
            if (!verify.ok) {
              setError(result.error ?? "We couldn't verify that payment.");
              setSubmitting(false);
              return;
            }
            router.push(`/thank-you?order=${encodeURIComponent(response.razorpay_order_id)}`);
          } catch {
            setError(
              `Payment went through but confirmation failed. Email ${supportEmail} with your payment id and we'll sort it immediately.`
            );
            setSubmitting(false);
          }
        },
      });

      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const field =
    "h-12 w-full rounded-field border border-line bg-white px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-400/70 focus:border-blue";

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />

      <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-12" noValidate>
        <div className="lg:col-span-7">
          <fieldset className="border-0 p-0">
            <legend className="text-lg font-bold text-ink">Your details</legend>
            <p className="mt-1 text-[0.9375rem] text-ink-400">
              No account needed. We use these to send your joining link and certificate.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor={`${uid}-name`} className="mb-1.5 block text-sm font-medium text-ink">
                  Full name
                </label>
                <input
                  id={`${uid}-name`}
                  className={field}
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor={`${uid}-email`} className="mb-1.5 block text-sm font-medium text-ink">
                  Email
                </label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  inputMode="email"
                  className={field}
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor={`${uid}-phone`} className="mb-1.5 block text-sm font-medium text-ink">
                  WhatsApp number
                </label>
                <input
                  id={`${uid}-phone`}
                  type="tel"
                  inputMode="tel"
                  className={field}
                  required
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor={`${uid}-status`} className="mb-1.5 block text-sm font-medium text-ink">
                  You are
                </label>
                <select
                  id={`${uid}-status`}
                  className={field}
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as typeof form.status })
                  }
                >
                  <option value="">Select…</option>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={`${uid}-city`} className="mb-1.5 block text-sm font-medium text-ink">
                  City
                </label>
                <input
                  id={`${uid}-city`}
                  className={field}
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>

            {/* Honeypot — hidden from people, irresistible to bots. */}
            <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
              <label htmlFor={`${uid}-company`}>Company</label>
              <input
                id={`${uid}-company`}
                tabIndex={-1}
                autoComplete="off"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
          </fieldset>
        </div>

        {/* Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-card border border-line bg-white p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-ink">{courseTitle}</h2>

            {!isUpgrade && tiers.length > 1 && (
              <div role="radiogroup" aria-label="Choose your option" className="mt-5 space-y-2.5">
                {tiers.map((t) => (
                  <label
                    key={t.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-field border p-4 transition-colors",
                      tierId === t.id
                        ? "border-blue bg-blue-50/60"
                        : "border-line hover:border-blue-200"
                    )}
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={t.id}
                      checked={tierId === t.id}
                      onChange={() => setTierId(t.id)}
                      className="mt-1 size-4 accent-[#0060F0]"
                    />
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-[0.9375rem] font-semibold text-ink">{t.name}</span>
                        <span className="font-display text-lg font-extrabold text-ink">
                          {formatINR(t.priceINR)}
                        </span>
                      </span>
                      <span className="mt-0.5 block font-mono text-[0.6875rem] text-ink-400">
                        {t.durationLabel}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {isUpgrade && (
              <p className="mt-4 rounded-field border border-blue-200 bg-blue-50 px-4 py-3 text-[0.9375rem] text-ink">
                Upgrading to <strong>{tier.name}</strong> — you only pay the difference.
              </p>
            )}

            {/* Coupon */}
            <div className="mt-5">
              <label htmlFor={`${uid}-coupon`} className="mb-1.5 block text-sm font-medium text-ink">
                Coupon code
              </label>
              <div className="flex gap-2">
                <input
                  id={`${uid}-coupon`}
                  className={cn(field, "uppercase")}
                  placeholder="Optional"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void applyCoupon();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={applyCoupon}
                  disabled={couponChecking}
                >
                  {couponChecking ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
              {couponMsg && (
                <p
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "mt-2 flex items-center gap-1.5 text-sm",
                    coupon ? "text-green-ink" : "text-red-600"
                  )}
                >
                  {coupon && <Tag className="size-3.5" aria-hidden="true" />}
                  {couponMsg}
                </p>
              )}
            </div>

            <dl className="mt-6 space-y-2 border-t border-line pt-5 text-[0.9375rem]">
              <div className="flex justify-between">
                <dt className="text-ink-400">Subtotal</dt>
                <dd className="text-ink">{formatINR(subtotalPaise / 100)}</dd>
              </div>
              {coupon && (
                <div className="flex justify-between">
                  <dt className="text-green-ink">Discount ({coupon.code})</dt>
                  <dd className="text-green-ink">−{formatINR(coupon.discountPaise / 100)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="font-display text-2xl font-extrabold text-ink">
                  {formatINR(totalPaise / 100)}
                </dd>
              </div>
            </dl>

            {error && (
              <p
                role="alert"
                className="mt-5 flex gap-2 rounded-field border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}

            <Button type="submit" size="lg" full className="mt-6" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Opening payment…
                </>
              ) : (
                <>Pay {formatINR(totalPaise / 100)}</>
              )}
            </Button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.8125rem] text-ink-400">
              <Lock className="size-3.5" aria-hidden="true" />
              Secure payment via Razorpay · UPI, cards, netbanking
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
