import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { instructor } from "@/lib/site";

export function InstructorTeaser() {
  return (
    <Section tone="white">
      <Reveal>
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-card border border-line bg-paper lg:mx-0">
              <Image
                src={instructor.photo}
                alt={`${instructor.name}, ${instructor.role}`}
                width={1000}
                height={1250}
                sizes="(min-width: 1024px) 420px, (min-width: 640px) 384px, 90vw"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan-ink">
              Your instructor
            </p>
            <h2 className="mt-3 text-[1.75rem] font-extrabold leading-[1.15] sm:text-4xl">
              {instructor.name}
            </h2>
            <p className="mt-2 text-[1.0625rem] text-ink-400">
              {instructor.role}
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-3">
              {instructor.stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-card border border-line bg-paper px-4 py-4"
                >
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-2xl font-extrabold text-ink">
                      {s.value}
                    </span>
                    <span className="mt-1 block text-[0.8125rem] leading-snug text-ink-400">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 text-[1.0625rem] leading-relaxed text-ink-400">
              Rattan hires for tech roles every week — the same requirements,
              the same hiring managers, the same rejections you&rsquo;ll learn to
              avoid. He teaches this course between live searches, not from a
              slide deck written three years ago.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 py-1 text-[0.9375rem] font-semibold text-blue-700 hover:text-blue"
              >
                Read the full story
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href={instructor.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-1 text-[0.9375rem] font-semibold text-ink-400 underline underline-offset-4 hover:text-ink"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
