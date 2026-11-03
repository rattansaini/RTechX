import "server-only";
import { Resend } from "resend";
import {
  COACHING_BASE_PAISE,
  COACHING_GST_PAISE,
  REFUND_RULE,
  formatRupees2,
} from "@/content/coaching";
import type { CoachingRow } from "@/lib/coaching-fulfilment";
import { BLUE, INK, LINE, MUTED, escapeHtml, shell } from "@/lib/email";
import { site } from "@/lib/site";

/**
 * Coaching emails. Same sender, shell and disclaimer as the enrolment email.
 * None of these throw: the payment is already recorded, and a failed email is
 * a support task, not a failed purchase.
 */

const baseUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
const notifyTo = () => process.env.COACHING_NOTIFY_EMAIL || site.supportEmail;
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").slice(0, 120);

export function formatIST(iso: string) {
  return (
    new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso)) + " IST"
  );
}

async function send(opts: { to: string; subject: string; html: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[coaching-email] RESEND_API_KEY unset — skipping:", opts.subject);
    return { skipped: true as const };
  }
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? `RTechX <${site.supportEmail}>`,
      to: [opts.to],
      subject: oneLine(opts.subject),
      html: opts.html,
      text: opts.text,
    });
    if (error) {
      console.error("[coaching-email] send failed:", error);
      return { skipped: false as const, error };
    }
    return { skipped: false as const };
  } catch (err) {
    console.error("[coaching-email] threw:", err);
    return { skipped: true as const };
  }
}

const row2 = (k: string, v: string, last = false) =>
  `<tr><td style="padding:10px 0;${last ? "" : `border-bottom:1px solid ${LINE};`}color:${MUTED}">${k}</td>
   <td style="padding:10px 0;${last ? "" : `border-bottom:1px solid ${LINE};`}text-align:right;font-weight:600">${v}</td></tr>`;

/** To the candidate. A payment confirmation — deliberately not styled as a tax invoice. */
export async function sendCoachingReceipt(row: CoachingRow) {
  const link = `${baseUrl()}/coaching/booked?ref=${row.id}`;
  const first = row.full_name.split(" ")[0];
  const gstin = site.legal.gstRegistered && site.legal.gstin ? site.legal.gstin : null;

  const inner = `
    <p style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${MUTED};margin:0 0 10px">Payment received</p>
    <h1 style="font-size:24px;line-height:1.25;margin:0 0 16px">Thank you, ${escapeHtml(first)}. Now pick your time.</h1>
    <p style="font-size:15px;line-height:1.65;color:${MUTED};margin:0 0 24px">
      Your 20-minute call with Rattan is paid for. Choose a slot that suits you — it takes a minute.
    </p>
    <p style="margin:0 0 28px">
      <a href="${link}" style="display:inline-block;background:${BLUE};color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 24px;border-radius:12px">Pick your time</a>
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 20px">
      ${row2("20-minute coaching call", formatRupees2(COACHING_BASE_PAISE))}
      ${row2("GST @ 18%", formatRupees2(COACHING_GST_PAISE))}
      ${row2("Total paid", formatRupees2(row.amount_paise))}
      ${row2("Payment ID", `<span style="font-family:ui-monospace,monospace;font-size:12px">${escapeHtml(row.razorpay_payment_id ?? "")}</span>`, true)}
    </table>
    <p style="font-size:13px;line-height:1.6;color:${MUTED};margin:0 0 20px">
      ${gstin ? `Billed by ${escapeHtml(site.legal.entity)} · GSTIN ${escapeHtml(gstin)}. ` : ""}This is a payment confirmation, not a GST tax invoice. If your company needs an invoice, reply to this email with the company name and GSTIN.
    </p>
    <p style="font-size:14px;line-height:1.65;color:${MUTED};background:#F7F9FC;border:1px solid ${LINE};border-radius:12px;padding:16px;margin:0 0 20px">
      <strong style="color:${INK}">Refunds.</strong> ${escapeHtml(REFUND_RULE)} If you join the programme, the ₹299 is deducted from your fee.
    </p>
    <p style="font-size:14px;line-height:1.65;color:${MUTED};margin:0">If the button doesn't work, open: ${escapeHtml(link)}</p>`;

  const text = [
    `Thank you, ${first}. Your 20-minute call with Rattan is paid for.`,
    ``,
    `Pick your time: ${link}`,
    ``,
    `20-minute coaching call  ${formatRupees2(COACHING_BASE_PAISE)}`,
    `GST @ 18%                ${formatRupees2(COACHING_GST_PAISE)}`,
    `Total paid               ${formatRupees2(row.amount_paise)}`,
    `Payment ID               ${row.razorpay_payment_id ?? ""}`,
    ``,
    `This is a payment confirmation, not a GST tax invoice. If your company needs an invoice, reply with the company name and GSTIN.`,
    ``,
    `Refunds: ${REFUND_RULE} If you join the programme, the ₹299 is deducted from your fee.`,
    ``,
    site.disclaimer,
  ].join("\n");

  return send({
    to: row.email,
    subject: "Payment received — pick your time for your RTechX coaching call",
    html: shell(inner),
    text,
  });
}

/** To Rattan after payment: every answer on the form. */
export async function sendCoachingPaidNotice(row: CoachingRow) {
  const inner = `
    <h1 style="font-size:20px;margin:0 0 16px">New paid coaching call</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${row2("Name", escapeHtml(row.full_name))}
      ${row2("Email", escapeHtml(row.email))}
      ${row2("Mobile", escapeHtml(row.mobile))}
      ${row2("Does today", escapeHtml(row.occupation))}
      ${row2("Tracks", escapeHtml(row.tracks.join(", ")))}
      ${row2("Amount", formatRupees2(row.amount_paise))}
      ${row2("Payment ID", escapeHtml(row.razorpay_payment_id ?? ""))}
      ${row2("Row", escapeHtml(row.id), true)}
    </table>
    <p style="font-size:14px;line-height:1.65;margin:20px 0 4px;color:${MUTED}">Goal, in their words:</p>
    <p style="font-size:15px;line-height:1.65;margin:0;white-space:pre-wrap">${escapeHtml(row.goal)}</p>`;
  const text = [
    `New paid coaching call`,
    `Name: ${row.full_name}`,
    `Email: ${row.email}`,
    `Mobile: ${row.mobile}`,
    `Does today: ${row.occupation}`,
    `Tracks: ${row.tracks.join(", ")}`,
    `Amount: ${formatRupees2(row.amount_paise)}`,
    `Payment ID: ${row.razorpay_payment_id ?? ""}`,
    `Row: ${row.id}`,
    ``,
    `Goal: ${row.goal}`,
  ].join("\n");
  return send({
    to: notifyTo(),
    subject: `Coaching call paid — ${row.full_name}`,
    html: shell(inner),
    text,
  });
}

/** Supabase dashboard link for the project, derived from the public URL. */
function dashboardLink() {
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
    const ref = host.split(".")[0];
    return ref ? `https://supabase.com/dashboard/project/${ref}/editor` : null;
  } catch {
    return null;
  }
}

/** To Rattan after a Cal.com booking (created or rescheduled). */
export async function sendCoachingBookedNotice(input: {
  row: CoachingRow;
  startTime: string;
  rescheduled: boolean;
}) {
  const when = formatIST(input.startTime);
  const dash = dashboardLink();
  const inner = `
    <h1 style="font-size:20px;margin:0 0 16px">Coaching call ${input.rescheduled ? "rescheduled" : "booked"}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${row2("Name", escapeHtml(input.row.full_name))}
      ${row2("Call time", escapeHtml(when))}
      ${row2("Row", escapeHtml(input.row.id), true)}
    </table>
    ${dash ? `<p style="margin:20px 0 0"><a href="${dash}" style="color:${BLUE};font-weight:600">Open the database (coaching_calls)</a></p>` : ""}`;
  return send({
    to: notifyTo(),
    subject: `Coaching call ${input.rescheduled ? "rescheduled" : "booked"} — ${input.row.full_name}, ${when}`,
    html: shell(inner),
    text: `Coaching call ${input.rescheduled ? "rescheduled" : "booked"}\nName: ${input.row.full_name}\nCall time: ${when}\nRow: ${input.row.id}${dash ? `\n${dash}` : ""}`,
  });
}

/** To Rattan when a Cal.com booking has no matching paid row. */
export async function sendUnpaidBookingWarning(input: {
  attendeeName: string;
  attendeeEmail: string;
  startTime: string | null;
  bookingUid: string;
  detail: string;
}) {
  const when = input.startTime ? formatIST(input.startTime) : "unknown";
  const inner = `
    <h1 style="font-size:20px;margin:0 0 8px;color:#B91C1C">Unpaid booking — please check or cancel</h1>
    <p style="font-size:15px;line-height:1.65;color:${MUTED};margin:0 0 16px">A Cal.com booking came in with no matching paid coaching row. ${escapeHtml(input.detail)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${row2("Name", escapeHtml(input.attendeeName))}
      ${row2("Email", escapeHtml(input.attendeeEmail))}
      ${row2("Call time", escapeHtml(when))}
      ${row2("Cal booking", escapeHtml(input.bookingUid), true)}
    </table>`;
  return send({
    to: notifyTo(),
    subject: "Unpaid booking — please check or cancel",
    html: shell(inner),
    text: `Unpaid booking — please check or cancel\n${input.detail}\nName: ${input.attendeeName}\nEmail: ${input.attendeeEmail}\nCall time: ${when}\nCal booking: ${input.bookingUid}`,
  });
}

/** To Rattan: one ₹299 payment is being used for a second, separate booking. */
export async function sendSecondBookingWarning(input: {
  name: string;
  email: string;
  firstStart: string | null;
  secondStart: string | null;
  firstUid: string;
  secondUid: string;
}) {
  const first = input.firstStart ? formatIST(input.firstStart) : "unknown";
  const second = input.secondStart ? formatIST(input.secondStart) : "unknown";
  const inner = `
    <h1 style="font-size:20px;margin:0 0 8px;color:#B91C1C">Second booking on one payment — please check</h1>
    <p style="font-size:15px;line-height:1.65;color:${MUTED};margin:0 0 16px">This candidate already has a booked call and has booked another slot on the same ₹299 payment. The record still shows the first booking. Cancel one of them in Cal.com.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${row2("Name", escapeHtml(input.name))}
      ${row2("Email", escapeHtml(input.email))}
      ${row2("First booking", escapeHtml(first))}
      ${row2("Second booking", escapeHtml(second))}
      ${row2("Cal booking (new)", escapeHtml(input.secondUid), true)}
    </table>`;
  return send({
    to: notifyTo(),
    subject: `Second booking on one payment — ${input.name}`,
    html: shell(inner),
    text: `Second booking on one payment — please check\nName: ${input.name}\nEmail: ${input.email}\nFirst booking: ${first} (${input.firstUid})\nSecond booking: ${second} (${input.secondUid})\nCancel one of them in Cal.com.`,
  });
}
