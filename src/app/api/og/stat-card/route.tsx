import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-font";
import { BRAND_MARK_DATA_URI, BRAND_MARK_ASPECT } from "../brand-mark";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const NAVY = "#0A1B3D";
const TILE = "#122A5C";
const BLUE = "#0066FF";
const CYAN = "#00D4FF";
const MUTED = "#9FB3D9";
const FOOTER = "#7C93BD";
const RULE = "#24406F";

/**
 * Fonts come from the loader this project already uses for its Open Graph
 * images, not from raw GitHub URLs.
 *
 * As shipped, this route fetched five TTFs from github.com/.../raw/main/...
 * and threw `Font fetch failed` if any of them moved — which is exactly what
 * happened: the very first render returned a 500. A daily job that depends on
 * two third-party repositories keeping their branch layout stable is a job
 * that will break on a morning nobody is watching.
 *
 * `loadOgFonts()` fetches Inter from Google Fonts, validates the bytes really
 * are TrueType before handing them to Satori, and returns an empty array
 * rather than throwing when the network is unavailable. A card rendered in a
 * fallback face is a far better outcome than no card at all.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const eyebrow = p.get("eyebrow") ?? "";
  const headline = p.get("headline") ?? "";
  const takeaway = p.get("takeaway") ?? "";
  const highlight = p.get("highlight") ?? "";
  const sourceLine = p.get("source") ?? "";

  const statA = {
    value: p.get("a_value") ?? "",
    label: p.get("a_label") ?? "",
    sub: p.get("a_sub") ?? "",
  };
  const statB = {
    value: p.get("b_value") ?? "",
    label: p.get("b_label") ?? "",
    sub: p.get("b_sub") ?? "",
  };
  const hasStats = Boolean(statA.value);

  const loaded = await loadOgFonts();
  const regular = loaded.find((f) => f.weight === 400);
  const bold = loaded.find((f) => f.weight === 700);

  // Headline scales down as it lengthens so long lines never overflow the canvas.
  const headlineSize = headline.length > 72 ? 58 : headline.length > 50 ? 66 : 74;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1080,
          height: 1080,
          backgroundColor: NAVY,
          position: "relative",
        }}
      >
        {/* Gradient accent bar */}
        <div
          style={{
            display: "flex",
            width: 1080,
            height: 10,
            backgroundImage: `linear-gradient(90deg, ${BLUE} 0%, ${CYAN} 100%)`,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "74px 84px 0 84px",
            flex: 1,
          }}
        >
          {eyebrow ? (
            <div
              style={{
                display: "flex",
                fontFamily: "Mono",
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: 3,
                color: CYAN,
                textTransform: "uppercase",
                marginBottom: 28,
              }}
            >
              {eyebrow}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              fontFamily: "Display",
              fontWeight: 800,
              fontSize: headlineSize,
              lineHeight: 1.06,
              color: "#FFFFFF",
              letterSpacing: -1.5,
              maxWidth: 912,
            }}
          >
            {headline}
          </div>

          {hasStats ? (
            <div style={{ display: "flex", gap: 44, marginTop: 52 }}>
              <StatTile {...statA} accent={BLUE} />
              {statB.value ? <StatTile {...statB} accent={CYAN} /> : null}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: hasStats ? 54 : 64,
              fontFamily: "Display",
              fontWeight: 700,
              fontSize: 40,
              lineHeight: 1.3,
              color: "#FFFFFF",
              letterSpacing: -0.5,
              maxWidth: 912,
            }}
          >
            {renderTakeaway(takeaway, highlight)}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", flexDirection: "column", padding: "0 84px 74px 84px" }}>
          <div style={{ display: "flex", width: 912, height: 2, backgroundColor: RULE, marginBottom: 34 }} />
          <div style={{ display: "flex", justifyContent: "space-between", width: 912 }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Mono",
                fontWeight: 400,
                fontSize: 19,
                color: FOOTER,
                maxWidth: 560,
                lineHeight: 1.5,
              }}
            >
              {sourceLine}
            </div>
            {/* Mark + wordmark as one lockup. The mark is inlined base64, so a
                graphic can never render without the brand on it — which is the
                whole point of putting it here rather than fetching it. */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <img
                src={BRAND_MARK_DATA_URI}
                width={86}
                height={Math.round(86 / BRAND_MARK_ASPECT)}
                alt=""
                style={{ display: "flex" }}
              />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ display: "flex", fontFamily: "Display", fontWeight: 800, fontSize: 30, color: "#FFFFFF", letterSpacing: -0.5 }}>
                RTechX
              </div>
              <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 400, fontSize: 17, color: FOOTER, marginTop: 5, letterSpacing: 0.5 }}>
                rtechx.com
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      // Both families map to the same loaded face at two weights. Satori falls
      // back to its built-in font for any weight not listed, so an empty array
      // still renders a readable card rather than failing the request.
      fonts: [
        ...(regular
          ? [
              { name: "Display", data: regular.data, weight: 400 as const, style: "normal" as const },
              { name: "Mono", data: regular.data, weight: 400 as const, style: "normal" as const },
            ]
          : []),
        ...(bold
          ? [
              { name: "Display", data: bold.data, weight: 700 as const, style: "normal" as const },
              { name: "Display", data: bold.data, weight: 800 as const, style: "normal" as const },
              { name: "Mono", data: bold.data, weight: 700 as const, style: "normal" as const },
            ]
          : []),
      ],
    }
  );
}

function StatTile({
  value,
  label,
  sub,
  accent,
}: {
  value: string;
  label: string;
  sub: string;
  accent: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 434,
        backgroundColor: TILE,
        borderRadius: 18,
        borderLeft: `8px solid ${accent}`,
        padding: "38px 34px",
      }}
    >
      <div style={{ display: "flex", fontFamily: "Display", fontWeight: 700, fontSize: 25, color: MUTED }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Mono",
          fontWeight: 700,
          fontSize: value.length > 6 ? 72 : 92,
          color: "#FFFFFF",
          letterSpacing: -3,
          marginTop: 20,
        }}
      >
        {value}
      </div>
      {sub ? (
        <div style={{ display: "flex", fontFamily: "Display", fontWeight: 400, fontSize: 24, color: MUTED, marginTop: 18 }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

/** Splits the takeaway so one word can be coloured cyan, matching the brand template. */
/**
 * Colours one word of the takeaway without breaking the line badly.
 *
 * Two earlier attempts got this wrong on the rendered graphic. Splitting the
 * line into three flex children dropped the spaces, giving "Thatgapis the
 * whole argument". Adding `whiteSpace: "pre"` restored the spaces but made
 * each fragment an unbreakable block, so the whole tail wrapped to its own
 * line rather than flowing.
 *
 * Emitting one child per word lets the row wrap where a reader expects, at
 * word boundaries, while the highlight range is still coloured — including a
 * highlight spanning more than one word.
 */
function renderTakeaway(takeaway: string, highlight: string) {
  const at = highlight ? takeaway.indexOf(highlight) : -1;
  const hiStart = at;
  const hiEnd = at === -1 ? -1 : at + highlight.length;

  const words: { text: string; lit: boolean }[] = [];
  let cursor = 0;
  for (const word of takeaway.split(" ")) {
    const wordStart = cursor;
    const wordEnd = cursor + word.length;
    const lit = hiStart !== -1 && wordStart < hiEnd && wordEnd > hiStart;
    words.push({ text: word, lit });
    cursor = wordEnd + 1; // the space we split on
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {words.map((w, i) => (
        <div
          key={`${w.text}-${i}`}
          style={{ display: "flex", whiteSpace: "pre", ...(w.lit ? { color: CYAN } : {}) }}
        >
          {i < words.length - 1 ? `${w.text} ` : w.text}
        </div>
      ))}
    </div>
  );
}
