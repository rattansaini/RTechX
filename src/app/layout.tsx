import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@/components/analytics/analytics";
import { site } from "@/lib/site";
import "./globals.css";

/* Self-hosted by next/font — no external requests, no FOUT, no layout shift. */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "Live online IT recruitment training from a working talent acquisition specialist. Decode tech JDs, build Boolean searches, screen candidates on evidence — in 3 live evenings.",
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: site.url,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A1F44",
  colorScheme: "light",
};

/**
 * Root layout holds only the document shell and fonts. Page chrome lives in
 * the (site) route group, so /lp can opt out of it entirely.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body
        className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable} flex min-h-dvh flex-col`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
