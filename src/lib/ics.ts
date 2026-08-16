import type { Course, Tier } from "@/content/courses";

/**
 * Builds a calendar invite covering every live session in the batch.
 *
 * Times are emitted in UTC (the trailing `Z`), which every calendar client
 * converts to the viewer's local zone. That avoids shipping a VTIMEZONE block
 * for Asia/Kolkata and getting the half-hour offset subtly wrong.
 */

const IST_OFFSET_MINUTES = 5 * 60 + 30;

/** Pulls "8:00–10:00 PM IST" into 24h hours. Falls back to 20:00–22:00. */
function parseSessionHours(timeIST: string): { startMin: number; endMin: number } {
  const match = timeIST.match(
    /(\d{1,2})(?::(\d{2}))?\s*[–—-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i
  );
  if (!match) return { startMin: 20 * 60, endMin: 22 * 60 };

  const meridiem = match[5].toUpperCase();
  let startH = Number(match[1]);
  let endH = Number(match[3]);
  const startM = Number(match[2] ?? 0);
  const endM = Number(match[4] ?? 0);

  // The meridiem sits at the end and governs the end time; the start shares it
  // unless that would run backwards (e.g. "11:00–1:00 PM").
  if (meridiem === "PM") {
    if (endH !== 12) endH += 12;
    startH = startH === 12 ? 12 : startH + 12;
    if (startH >= endH) startH -= 12;
  } else if (endH === 12) {
    endH = 0;
  }

  return { startMin: startH * 60 + startM, endMin: endH * 60 + endM };
}

function toIcsUtc(dateISO: string, minutesIST: number, dayOffset: number): string {
  const base = new Date(`${dateISO}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + dayOffset);
  base.setUTCMinutes(base.getUTCMinutes() + minutesIST - IST_OFFSET_MINUTES);
  return base.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 requires CRLF, escaped separators, and folding under 75 octets. */
function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function fold(line: string) {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 74));
  rest = rest.slice(74);
  while (rest.length > 73) {
    parts.push(" " + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  if (rest) parts.push(" " + rest);
  return parts.join("\r\n");
}

export function buildBatchIcs(input: {
  course: Course;
  tier: Tier;
  batchStartDate: string;
  timeIST: string;
  attendeeEmail: string;
  organiserEmail: string;
  joinUrl?: string | null;
}): string {
  const { startMin, endMin } = parseSessionHours(input.timeIST);

  // The 3-day tier attends days 1–3; the 5-day tier attends everything.
  const dayCount = input.tier.inheritsFrom ? input.course.days.length : 3;
  const days = input.course.days.slice(0, dayCount);

  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RTechX//Course Batch//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  days.forEach((day, i) => {
    const description = [
      `Day ${day.day}: ${day.title}`,
      "",
      ...day.bullets.map((b) => `• ${b}`),
      "",
      `You'll walk out with: ${day.deliverable}`,
    ].join("\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${input.course.slug}-${input.batchStartDate}-day${day.day}-${input.attendeeEmail}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toIcsUtc(input.batchStartDate, startMin, i)}`,
      `DTEND:${toIcsUtc(input.batchStartDate, endMin, i)}`,
      fold(`SUMMARY:${escapeText(`${input.course.title} — Day ${day.day}`)}`),
      fold(`DESCRIPTION:${escapeText(description)}`),
      fold(`LOCATION:${escapeText(input.joinUrl ?? "Live online — joining link sent before the session")}`),
      `ORGANIZER;CN=RTechX:mailto:${input.organiserEmail}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      "DESCRIPTION:RTechX session starts in 30 minutes",
      "END:VALARM",
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
