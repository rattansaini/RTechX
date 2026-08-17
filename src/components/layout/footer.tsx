import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { liveCourses } from "@/content/courses";
import { nav, site } from "@/lib/site";

const columns = [
  {
    heading: "Courses",
    links: [
      ...liveCourses.map((c) => ({
        href: `/courses/${c.slug}`,
        label: c.shortTitle,
      })),
      { href: "/courses", label: "All courses" },
      { href: "/free-resources", label: "Free Boolean cheat-sheet" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Rattan" },
      { href: "/contact", label: "Contact" },
      // No Blog link until a /blog route exists. It pointed at a 404 from
      // every page on the site, footer links being sitewide.
    ],
  },
];

export function Footer() {
  const socials = Object.entries(site.socials).filter(([, href]) => href);

  return (
    <footer className="on-navy relative overflow-hidden bg-ink text-ink-300">
      <div className="pointer-events-none absolute inset-0 grid-field-navy" aria-hidden="true" />

      <Container className="relative">
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
          <div className="lg:col-span-2 lg:max-w-xs">
            <Logo tone="white" />
            <p className="mt-4 font-display text-lg font-semibold text-white">
              {site.tagline}
            </p>
            <div className="mt-5 space-y-2 text-[0.9375rem]">
              <p>
                <a
                  href={`mailto:${site.supportEmail}`}
                  className="inline-block py-1 transition-colors hover:text-cyan"
                >
                  {site.supportEmail}
                </a>
              </p>
              <p>
                <a
                  href={`https://wa.me/${site.whatsapp.e164}`}
                  className="inline-block py-1 transition-colors hover:text-cyan"
                >
                  WhatsApp {site.whatsapp.display}
                </a>
              </p>
            </div>
            {socials.length > 0 && (
              <div className="mt-5 flex gap-4 text-[0.9375rem]">
                {socials.map(([key, href]) => (
                  <a
                    key={key}
                    href={href as string}
                    className="inline-block py-1 capitalize hover:text-cyan"
                  >
                    {key}
                  </a>
                ))}
              </div>
            )}
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-white">
                {col.heading}
              </h2>
              <ul className="mt-3 space-y-1 text-[0.9375rem]">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block py-1.5 transition-colors hover:text-cyan"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-line-navy py-8">
          <p className="max-w-3xl text-sm leading-relaxed">{site.disclaimer}</p>

          <div className="mt-6 flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {site.legal.entity}
              {site.legal.gstRegistered && " · GST registered"}
            </p>
            <ul className="flex flex-wrap gap-x-6">
              {nav.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-1.5 transition-colors hover:text-cyan"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
