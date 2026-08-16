import type { MetadataRoute } from "next";
import { liveCourses } from "@/content/courses";
import { site } from "@/lib/site";

/**
 * Only pages worth ranking. Checkout, thank-you and the /lp ad landing pages
 * are excluded deliberately — /lp would otherwise compete with the real course
 * page for the same queries and split its authority.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/courses`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/free-resources`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const courses: MetadataRoute.Sitemap = liveCourses.map((c) => ({
    url: `${base}/courses/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.95,
  }));

  return [...staticPages, ...courses];
}
