import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /lp duplicates the course page's content for ad traffic; letting it
        // be indexed would split ranking signals between the two.
        disallow: ["/api/", "/checkout/", "/thank-you", "/lp/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
