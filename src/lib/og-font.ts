import "server-only";

/**
 * Loads a font for next/og that actually contains the rupee sign (U+20B9).
 *
 * The build container's default sans-serif does not, so `₹499` rendered as a
 * tofu box on every social card — on the one element that matters most.
 *
 * Satori cannot read woff2, so this asks Google Fonts with an old user agent,
 * which makes it serve TrueType instead. The whole thing is best-effort: if
 * the network is unavailable at build time the caller falls back to a system
 * font and an ASCII "Rs", so a card is never broken and a build never fails
 * over a font.
 */
export type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

const GOOGLE_CSS = "https://fonts.googleapis.com/css2";

async function fetchOne(family: string, weight: 400 | 700): Promise<OgFont | null> {
  try {
    const cssUrl = `${GOOGLE_CSS}?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
    // Deliberately no user-agent header. Google serves the format it thinks
    // the caller supports: modern agents get woff2 and an ancient IE string
    // gets EOT — Satori can read neither. Sending nothing yields TrueType.
    const css = await fetch(cssUrl, {
      // Fonts are immutable; let the build cache them across pages.
      cache: "force-cache",
    }).then((r) => (r.ok ? r.text() : ""));

    // Google omits the format() declaration entirely for legacy agents — the
    // src is a bare url(...) pointing at TrueType. Matching on format() found
    // nothing and silently fell back to the ASCII path.
    const match = css.match(/src:\s*url\(([^)]+)\)/);
    if (!match) return null;

    const data = await fetch(match[1], { cache: "force-cache" }).then((r) =>
      r.ok ? r.arrayBuffer() : null
    );
    if (!data) return null;

    // Confirm it really is TrueType/OpenType before handing it to Satori,
    // which cannot parse woff2 and would throw mid-render.
    const magic = new Uint8Array(data.slice(0, 4));
    const isTtf = magic[0] === 0x00 && magic[1] === 0x01 && magic[2] === 0x00 && magic[3] === 0x00;
    const isOtf = String.fromCharCode(...magic) === "OTTO";
    const isTtcOrTrue = String.fromCharCode(...magic) === "true";
    if (!isTtf && !isOtf && !isTtcOrTrue) return null;

    return { name: family, data, weight, style: "normal" };
  } catch {
    return null;
  }
}

/** Returns [] when unavailable — callers must handle that, not assume. */
export async function loadOgFonts(): Promise<OgFont[]> {
  const [regular, bold] = await Promise.all([
    fetchOne("Inter", 400),
    fetchOne("Inter", 700),
  ]);
  return [regular, bold].filter((f): f is OgFont => f !== null);
}

/**
 * `₹` when the loaded font can draw it, `Rs` otherwise. Never returns a glyph
 * that would render as a box.
 */
export function rupee(hasFont: boolean) {
  return hasFont ? "₹" : "Rs ";
}
