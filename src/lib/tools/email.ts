import "server-only";
import { Resend } from "resend";
import { BLUE, INK, MUTED, shell } from "@/lib/email";
import { site } from "@/lib/site";

export async function sendToolsLoginCode(to: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[tools-email] RESEND_API_KEY unset — cannot send login code");
    return { ok: false as const };
  }
  const inner = `
    <h1 style="font-size:22px;line-height:1.3;margin:0 0 12px;color:${INK}">Your RTechX Recruiter Toolkit code</h1>
    <p style="font-size:15px;line-height:1.65;color:${MUTED};margin:0 0 20px">Enter this code on the RTechX website to sign in. It works for 10 minutes.</p>
    <p style="font-family:SFMono-Regular,Menlo,Consolas,monospace;font-size:34px;letter-spacing:8px;font-weight:700;color:${INK};margin:0 0 24px">${code}</p>
    <p style="font-size:14px;line-height:1.65;color:${MUTED};margin:0">Didn't ask for this? Ignore this email — nobody can sign in without the code.<br>
    Tools: <a href="${site.url}/tools" style="color:${BLUE}">${site.url.replace("https://", "")}/tools</a></p>`;
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? `RTechX <${site.supportEmail}>`,
      to: [to],
      subject: `${code} is your RTechX Toolkit code`,
      html: shell(inner),
      text: `Your RTechX Recruiter Toolkit code is ${code}. It works for 10 minutes.\n\nDidn't ask for this? Ignore this email.\n${site.url}/tools`,
    });
    if (error) {
      console.error("[tools-email] send failed:", error);
      return { ok: false as const };
    }
    return { ok: true as const };
  } catch (err) {
    console.error("[tools-email] threw:", err);
    return { ok: false as const };
  }
}
