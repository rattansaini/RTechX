import "server-only";
import { Resend } from "resend";
import type { Course, Tier } from "@/content/courses";
import { buildBatchIcs } from "@/lib/ics";
import { site } from "@/lib/site";
import { formatBatchDate, formatINR } from "@/lib/utils";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

const INK = "#0A1F44";
const MUTED = "#55688D";
const LINE = "#E2E8F3";
const BLUE = "#0060F0";

function shell(inner: string) {
  return `<div style="background:#F7F9FC;padding:32px 16px">
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid ${LINE};border-radius:16px;padding:32px;color:${INK}">
    ${inner}
    <p style="font-size:12px;line-height:1.6;color:${MUTED};border-top:1px solid ${LINE};padding-top:20px;margin:32px 0 0">
      ${site.disclaimer}<br>
      ${site.legal.entity} · <a href="mailto:${site.supportEmail}" style="color:${BLUE}">${site.supportEmail}</a>
    </p>
  </div>
</div>`;
}

export async function sendEnrolmentEmail(input: {
  to: string;
  name: string;
  course: Course;
  tier: Tier;
  batchStartDate: string;
  timeIST: string;
  amountPaise: number;
  orderId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY unset — skipping enrolment email");
    return { skipped: true as const };
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? `RTechX <${site.supportEmail}>`;
  const whatsappGroup = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || null;

  const ics = buildBatchIcs({
    course: input.course,
    tier: input.tier,
    batchStartDate: input.batchStartDate,
    timeIST: input.timeIST,
    attendeeEmail: input.to,
    organiserEmail: site.supportEmail,
  });

  const steps = [
    `Save the calendar invite attached to this email — it has every session, with a 30-minute reminder.`,
    whatsappGroup
      ? `<a href="${whatsappGroup}" style="color:${BLUE};font-weight:600">Join the batch WhatsApp group</a> — the joining link and your Resume Playbook go out there before Day 1, then the rest of your materials as each day finishes.`
      : `We'll WhatsApp you the joining link and your Resume Playbook before Day 1 on the number you gave us, then the rest of your materials as each day finishes.`,
    `Turn up on ${formatBatchDate(input.batchStartDate)} at ${input.timeIST} with a laptop. No paid tools needed.`,
  ];

  const inner = `
    <p style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${MUTED};margin:0 0 10px">
      Enrolment confirmed
    </p>
    <h1 style="font-size:24px;line-height:1.25;margin:0 0 16px">You're in, ${escapeHtml(input.name.split(" ")[0])}.</h1>
    <p style="font-size:15px;line-height:1.65;color:${MUTED};margin:0 0 24px">
      Your seat on the <strong style="color:${INK}">${escapeHtml(input.course.title)}</strong> is booked.
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 28px">
      <tr><td style="padding:10px 0;border-bottom:1px solid ${LINE};color:${MUTED}">Option</td>
          <td style="padding:10px 0;border-bottom:1px solid ${LINE};text-align:right;font-weight:600">${escapeHtml(input.tier.name)}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid ${LINE};color:${MUTED}">Format</td>
          <td style="padding:10px 0;border-bottom:1px solid ${LINE};text-align:right;font-weight:600">${escapeHtml(input.tier.durationLabel)}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid ${LINE};color:${MUTED}">Starts</td>
          <td style="padding:10px 0;border-bottom:1px solid ${LINE};text-align:right;font-weight:600">${formatBatchDate(input.batchStartDate)} · ${escapeHtml(input.timeIST)}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid ${LINE};color:${MUTED}">Paid</td>
          <td style="padding:10px 0;border-bottom:1px solid ${LINE};text-align:right;font-weight:600">${formatINR(input.amountPaise / 100)}</td></tr>
      <tr><td style="padding:10px 0;color:${MUTED}">Order</td>
          <td style="padding:10px 0;text-align:right;font-family:ui-monospace,monospace;font-size:12px">${escapeHtml(input.orderId)}</td></tr>
    </table>

    <h2 style="font-size:16px;margin:0 0 12px">What happens next</h2>
    <ol style="font-size:15px;line-height:1.7;color:${MUTED};margin:0 0 24px;padding-left:20px">
      ${steps.map((s) => `<li style="margin-bottom:8px">${s}</li>`).join("")}
    </ol>

    ${
      input.course.guarantee
        ? `<p style="font-size:14px;line-height:1.65;color:${MUTED};background:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:16px;margin:0">
             <strong style="color:${INK}">${escapeHtml(input.course.guarantee.label)}</strong><br>${escapeHtml(input.course.guarantee.body)}
           </p>`
        : ""
    }
  `;

  const text = [
    `You're in, ${input.name.split(" ")[0]}.`,
    ``,
    `${input.course.title} — ${input.tier.name}`,
    `${input.tier.durationLabel}`,
    `Starts ${formatBatchDate(input.batchStartDate)} at ${input.timeIST}`,
    `Paid ${formatINR(input.amountPaise / 100)} · Order ${input.orderId}`,
    ``,
    `What happens next:`,
    `1. Save the attached calendar invite.`,
    whatsappGroup ? `2. Join the WhatsApp group: ${whatsappGroup}` : `2. We'll WhatsApp you the joining link and your Resume Playbook before Day 1.`,
    `3. Turn up with a laptop. No paid tools needed.`,
    ``,
    input.course.guarantee ? `${input.course.guarantee.label} ${input.course.guarantee.body}` : ``,
    ``,
    site.disclaimer,
  ].join("\n");

  const { data, error } = await resend.emails.send({
    from,
    to: [input.to],
    subject: `You're in — ${input.course.title} starts ${formatBatchDate(input.batchStartDate)}`,
    html: shell(inner),
    text,
    attachments: [
      {
        filename: "rtechx-batch.ics",
        content: Buffer.from(ics, "utf8").toString("base64"),
      },
    ],
  });

  if (error) {
    // Never throw: the payment already succeeded and the enrolment is recorded.
    // A failed email is a support task, not a failed purchase.
    console.error("[email] enrolment email failed:", error);
    return { skipped: false as const, error };
  }
  return { skipped: false as const, id: data?.id };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Delivers a lead magnet.
 *
 * If the resource has no URL configured yet, this sends an honest holding
 * email rather than silently doing nothing — which is what the site did
 * before, while the page promised "one email with the PDF".
 */
export async function sendResourceEmail(input: {
  to: string;
  resourceName: string;
  resourceUrl: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY unset — skipping resource email");
    return { skipped: true as const };
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? `RTechX <${site.supportEmail}>`;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
  const ready = Boolean(input.resourceUrl);
  const href = input.resourceUrl?.startsWith("http")
    ? input.resourceUrl
    : `${base}${input.resourceUrl ?? ""}`;

  const inner = ready
    ? `
      <p style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${MUTED};margin:0 0 10px">Your free download</p>
      <h1 style="font-size:23px;line-height:1.25;margin:0 0 16px">${escapeHtml(input.resourceName)}</h1>
      <p style="font-size:15px;line-height:1.65;color:${MUTED};margin:0 0 24px">
        Here it is. Keep it open in a tab the next time you're building a search — the operators are the part people get wrong first.
      </p>
      <p style="margin:0 0 28px">
        <a href="${href}" style="display:inline-block;background:${BLUE};color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 24px;border-radius:12px">Download the PDF</a>
      </p>
      <p style="font-size:14px;line-height:1.65;color:${MUTED};margin:0">
        If you want to watch this done live against real requirements, that's Day 2 of the
        <a href="${base}/courses/it-recruitment-masterclass" style="color:${BLUE};font-weight:600">IT Recruitment Masterclass</a>.
      </p>`
    : `
      <p style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${MUTED};margin:0 0 10px">You're on the list</p>
      <h1 style="font-size:23px;line-height:1.25;margin:0 0 16px">${escapeHtml(input.resourceName)} is on its way</h1>
      <p style="font-size:15px;line-height:1.65;color:${MUTED};margin:0 0 24px">
        We're finishing it off. You'll get it by email the moment it's ready — no follow-up sequence, just the file.
      </p>
      <p style="font-size:14px;line-height:1.65;color:${MUTED};margin:0">
        In the meantime, the same skill is taught live on Day 2 of the
        <a href="${base}/courses/it-recruitment-masterclass" style="color:${BLUE};font-weight:600">IT Recruitment Masterclass</a>.
      </p>`;

  const { data, error } = await resend.emails.send({
    from,
    to: [input.to],
    subject: ready
      ? `${input.resourceName}`
      : `${input.resourceName} — you're on the list`,
    html: shell(inner),
    text: ready
      ? `${input.resourceName}\n\nDownload: ${href}\n\nThe same skill is taught live on Day 2 of the IT Recruitment Masterclass: ${base}/courses/it-recruitment-masterclass\n\n${site.disclaimer}`
      : `${input.resourceName} is on its way.\n\nWe're finishing it off and you'll get it by email the moment it's ready.\n\n${base}/courses/it-recruitment-masterclass\n\n${site.disclaimer}`,
  });

  if (error) {
    console.error("[email] resource email failed:", error);
    return { skipped: false as const, error };
  }
  return { skipped: false as const, id: data?.id };
}
