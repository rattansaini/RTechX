import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { courseSlugs, getCourse, nextBatch, tierById } from "@/content/courses";
import { loadOgFonts, rupee } from "@/lib/og-font";

export const runtime = "nodejs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "RTechX course";

export function generateStaticParams() {
  return courseSlugs().map((slug) => ({ slug }));
}

/**
 * Social card. Built from the content collection so the price and batch date
 * on a shared link can never drift from the page itself.
 *
 * Loads Inter rather than relying on the build container's system font, which
 * has no rupee glyph and rendered the price as a tofu box. The load is
 * best-effort: if it fails the card still generates, with a system font and an
 * ASCII "Rs" instead of a broken character.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);

  if (!course) {
    return new ImageResponse(<div style={{ background: "#0A1F44", width: "100%", height: "100%" }} />, size);
  }

  const core = tierById(course, "core");
  const batch = nextBatch(course);
  const fonts = await loadOgFonts();
  const hasFont = fonts.length > 0;

  // Inlined as a data URI so the card doesn't depend on the site being
  // reachable at the moment a scraper renders it.
  let logo: string | null = null;
  try {
    const bytes = readFileSync(join(process.cwd(), "public/brand/rtechx-logo.png"));
    logo = `data:image/png;base64,${bytes.toString("base64")}`;
  } catch {
    logo = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A1F44",
          backgroundImage:
            "radial-gradient(circle at 85% 12%, rgba(0,168,240,0.30), transparent 55%)",
          padding: 64,
          fontFamily: hasFont ? "Inter" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {logo ? (
            <img src={logo} alt="" width={44} height={35} />
          ) : (
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                background: "linear-gradient(135deg,#0060F0,#00A8F0)",
                display: "flex",
              }}
            />
          )}
          <div style={{ color: "#fff", fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>
            RTechX
          </div>
          <div style={{ color: "#8B9AB6", fontSize: 22, marginLeft: 8 }}>
            Live online
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#fff",
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              maxWidth: 980,
              display: "flex",
            }}
          >
            {course.title}
          </div>
          <div
            style={{
              color: "#B3D1FD",
              fontSize: 28,
              lineHeight: 1.35,
              marginTop: 20,
              maxWidth: 900,
              display: "flex",
            }}
          >
            Read a tech JD, build the Boolean, screen the candidate — taught live by a
            recruiter who still hires every week.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {core && (
            <div
              style={{
                display: "flex",
                background: "#0060F0",
                color: "#fff",
                fontSize: 28,
                fontWeight: 700,
                padding: "14px 26px",
                borderRadius: 999,
              }}
            >
              From {rupee(hasFont)}{core.priceINR}
            </div>
          )}
          {batch && (
            <div
              style={{
                display: "flex",
                border: "1px solid #1E3564",
                color: "#8B9AB6",
                fontSize: 26,
                padding: "13px 26px",
                borderRadius: 999,
              }}
            >
              Starts {new Date(batch.startDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                timeZone: "Asia/Kolkata",
              })}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts: hasFont ? fonts : undefined }
  );
}
