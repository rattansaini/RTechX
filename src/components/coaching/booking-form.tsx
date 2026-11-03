"use client";

import Script from "next/script";
import Link from "next/link";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GOAL_MAX,
  OCCUPATIONS,
  REFUND_RULE,
  TOTAL_LABEL,
  TRACK_OPTIONS,
} from "@/content/coaching";
import { coachingBookingSchema } from "@/lib/coaching";
import { cn } from "@/lib/utils";

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
  theme?: { color: string };
  handler: (r: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayCtor = new (options: RazorpayOptions) => { open: () => void };
const getRazorpay = () =>
  (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay;

type FieldKey =
  | "fullName"
  | "email"
  | "mobile"
  | "occupation"
  | "tracks"
  | "goal"
  | "consent";
type Errors = Partial<Record<FieldKey, string>>;

const FIELD_ORDER: FieldKey[] = [
  "fullName",
  "email",
  "mobile",
  "occupation",
  "tracks",
  "goal",
  "consent",
];

export function BookingForm({
  paymentsEnabled,
  supportEmail,
}: {
  paymentsEnabled: boolean;
  supportEmail: string;
}) {
  const router = useRouter();
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "+91 ",
    occupation: "",
    tracks: [] as string[],
    goal: "",
    consent: false,
    company: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const parsed = coachingBookingSchema.safeParse(form);
    if (parsed.success) return {};
    const out: Errors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as FieldKey;
      if (key && !out[key]) out[key] = issue.message;
    }
    return out;
  }

  function focusField(key: FieldKey) {
    const target =
      key === "tracks"
        ? document.getElementById(id("tracks-0"))
        : document.getElementById(id(key));
    target?.focus();
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    const found = validate();
    setErrors(found);
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) {
      focusField(first);
      return;
    }
    if (!paymentsEnabled) {
      setFormError(
        `Payments aren't switched on yet. Email ${supportEmail} and we'll arrange your call.`
      );
      return;
    }
    const Razorpay = getRazorpay();
    if (!scriptReady || !Razorpay) {
      setFormError("The payment window is still loading. Give it a second and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/coaching/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, company: form.company || undefined }),
      });
      const order = await res.json();
      if (!res.ok) {
        setFormError(order.error ?? "Couldn't start the payment. Please try again.");
        setSubmitting(false);
        return;
      }

      const rzp = new Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "RTechX",
        description: "Custom 1:1 Coaching — 20-minute call",
        order_id: order.razorpayOrderId,
        prefill: order.prefill,
        theme: { color: "#0060F0" },
        modal: { ondismiss: () => setSubmitting(false) },
        handler: async (response) => {
          try {
            const verify = await fetch("/api/coaching/verify", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(response),
            });
            const result = await verify.json();
            if (!verify.ok) {
              setFormError(result.error ?? "We couldn't verify that payment.");
              setSubmitting(false);
              return;
            }
            router.push(`/coaching/booked?ref=${encodeURIComponent(order.ref)}`);
          } catch {
            setFormError(
              `Payment went through but confirmation failed. Email ${supportEmail} with your payment id and we'll sort it immediately.`
            );
            setSubmitting(false);
          }
        },
      });
      rzp.open();
    } catch {
      setFormError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const field =
    "h-12 w-full rounded-field border bg-white px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-400/70 focus:border-blue";
  const border = (k: FieldKey) => (errors[k] ? "border-red-600" : "border-line");

  const err = (k: FieldKey) =>
    errors[k] ? (
      <p id={id(`${k}-err`)} className="mt-1.5 text-sm text-red-700">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: FieldKey) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? id(`${k}-err`) : undefined,
  });

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />

      <form
        onSubmit={onSubmit}
        noValidate
        className="rounded-card border border-line bg-white p-5 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={id("fullName")} className="mb-1.5 block text-sm font-medium text-ink">
              Full name
            </label>
            <input
              id={id("fullName")}
              className={cn(field, border("fullName"))}
              autoComplete="name"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              {...aria("fullName")}
            />
            {err("fullName")}
          </div>

          <div>
            <label htmlFor={id("email")} className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id={id("email")}
              type="email"
              inputMode="email"
              autoComplete="email"
              className={cn(field, border("email"))}
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              {...aria("email")}
            />
            {err("email")}
          </div>

          <div>
            <label htmlFor={id("mobile")} className="mb-1.5 block text-sm font-medium text-ink">
              Mobile number with country code
            </label>
            <input
              id={id("mobile")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={cn(field, border("mobile"))}
              required
              placeholder="+91 98765 43210"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              {...aria("mobile")}
            />
            {err("mobile")}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={id("occupation")} className="mb-1.5 block text-sm font-medium text-ink">
              What do you do today?
            </label>
            <select
              id={id("occupation")}
              className={cn(field, border("occupation"))}
              required
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              {...aria("occupation")}
            >
              <option value="">Select…</option>
              {OCCUPATIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            {err("occupation")}
          </div>

          <fieldset
            className="sm:col-span-2"
            aria-describedby={errors.tracks ? id("tracks-err") : undefined}
          >
            <legend className="mb-1.5 text-sm font-medium text-ink">
              Which tracks interest you?
            </legend>
            <div className="space-y-2">
              {TRACK_OPTIONS.map((t, i) => (
                <label
                  key={t}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-field border border-line px-4 py-2 text-[0.9375rem] text-ink has-[:checked]:border-blue has-[:checked]:bg-blue-50"
                >
                  <input
                    id={id(`tracks-${i}`)}
                    type="checkbox"
                    className="size-4 accent-[#0060F0]"
                    checked={form.tracks.includes(t)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tracks: e.target.checked
                          ? [...form.tracks, t]
                          : form.tracks.filter((x) => x !== t),
                      })
                    }
                  />
                  {t}
                </label>
              ))}
            </div>
            {err("tracks")}
          </fieldset>

          <div className="sm:col-span-2">
            <label htmlFor={id("goal")} className="mb-1.5 block text-sm font-medium text-ink">
              In one or two lines, what do you want to be able to do after coaching?
            </label>
            <textarea
              id={id("goal")}
              rows={3}
              maxLength={GOAL_MAX}
              required
              className={cn(field, "h-auto py-3", border("goal"))}
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              {...aria("goal")}
            />
            <p className="mt-1 text-right text-xs text-ink-400">
              {form.goal.length}/{GOAL_MAX}
            </p>
            {err("goal")}
          </div>

          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-snug text-ink">
              <input
                id={id("consent")}
                type="checkbox"
                className="mt-0.5 size-5 shrink-0 accent-[#0060F0]"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                {...aria("consent")}
              />
              <span>
                I agree that RTechX stores my name, email and mobile number to arrange this
                call and contact me about it. See the{" "}
                <Link
                  href="/legal/privacy"
                  className="font-semibold text-blue-700 underline underline-offset-4"
                >
                  Privacy policy
                </Link>
                .
              </span>
            </label>
            {err("consent")}
          </div>
        </div>

        {/* Honeypot — hidden from people, irresistible to bots. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={id("company")}>Company</label>
          <input
            id={id("company")}
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>

        {formError && (
          <p
            role="alert"
            className="mt-5 flex gap-2 rounded-field border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{formError}</span>
          </p>
        )}

        <Button type="submit" size="lg" full className="mt-6" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Opening payment…
            </>
          ) : (
            <>Pay {TOTAL_LABEL} and pick a time</>
          )}
        </Button>

        <p className="mt-3 text-center text-[0.8125rem] leading-relaxed text-ink-400">
          ₹299 + GST ({TOTAL_LABEL}). {REFUND_RULE}
        </p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[0.8125rem] text-ink-400">
          <Lock className="size-3.5" aria-hidden="true" />
          Secure payment via Razorpay · UPI, cards, netbanking
        </p>
      </form>
    </>
  );
}
