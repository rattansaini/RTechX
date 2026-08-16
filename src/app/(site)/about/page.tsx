import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/cta-band";
import { Container } from "@/components/ui/container";
import { instructor, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Rattan Saini",
  description:
    "Why RTechX exists, written by the person who teaches it — a working talent acquisition specialist in Gurugram with 10+ years in recruitment.",
  alternates: { canonical: "/about" },
};

/**
 * First-person, written from the facts Rattan supplied: role, location, years,
 * qualification, roles closed. Nothing biographical is invented beyond that.
 * This is his voice, so it is written to be edited by him rather than treated
 * as final.
 */
export default function AboutPage() {
  return (
    <>
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="overflow-hidden rounded-card border border-line bg-paper lg:sticky lg:top-24">
              <Image
                src={instructor.photo}
                alt={`${instructor.name}, ${instructor.role}`}
                width={1000}
                height={1250}
                priority
                sizes="(min-width: 1024px) 360px, 90vw"
                className="h-auto w-full object-cover"
              />
              <div className="border-t border-line p-5">
                <p className="font-display text-lg font-extrabold text-ink">
                  {instructor.name}
                </p>
                <p className="mt-1 text-[0.9375rem] text-ink-400">{instructor.role}</p>
                <p className="mt-0.5 text-[0.9375rem] text-ink-400">
                  {instructor.location}
                </p>
                <a
                  href={instructor.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block py-1 text-[0.9375rem] font-semibold text-blue-700 underline underline-offset-4"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <h1 className="text-[2rem] font-extrabold leading-[1.12] sm:text-[2.75rem]">
              I still hire every week. That&rsquo;s the whole reason this exists.
            </h1>

            <div className="legal-prose mt-8">
              <h2>What I do now</h2>
              <p>
                I&rsquo;m a talent acquisition specialist based in Gurugram. I&rsquo;ve
                spent over ten years in recruitment and closed more than a thousand
                tech roles. I&rsquo;m not a full-time trainer who used to recruit
                &mdash; I run live requirements, sit in intake calls with hiring
                managers, and get profiles rejected, in the same week I teach.
              </p>

              <h2>What I kept noticing</h2>
              <p>
                Every new recruiter I worked with hit the same wall, and it was never
                effort. They&rsquo;d work hard, send twenty profiles, and hear
                nothing. Not because they were lazy, but because nobody had ever
                shown them how to read a job description and tell which four things
                actually matter out of a list of twenty.
              </p>
              <p>
                So they&rsquo;d search the JD&rsquo;s exact words. They&rsquo;d go
                quiet when a hiring manager asked something technical. They&rsquo;d
                screen on keyword matches because nobody had taught them what
                evidence looks like in a real resume.
              </p>
              <p>
                Meanwhile the training available was either a full-time course
                costing more than a month&rsquo;s salary, or free YouTube videos that
                explain what sourcing <em>is</em> without ever showing you one being
                done.
              </p>

              <h2>Why RTechX exists</h2>
              <p>
                I built the course I kept having to deliver informally to people on
                my own team. It starts where the work starts &mdash; a real
                requirement &mdash; and ends where the work ends: a candidate
                submitted to a hiring manager.
              </p>
              <p>
                Three evenings, because that&rsquo;s genuinely how long the
                foundations take when nobody pads them. ₹499, because the barrier
                shouldn&rsquo;t be money for someone trying to get into this field.
                Live, because the part that actually teaches you is watching a search
                fail and then get fixed &mdash; and you cannot record that honestly.
              </p>
              <p>
                Everything you build during the course is yours to keep. The intake
                sheet, the Boolean strings, the scored resumes, the submission. On
                day one of a job you open your own files, not your notes.
              </p>

              <h2>What I refuse to promise</h2>
              <p>
                I will not promise you a job. I have no hiring partners who owe you an
                interview, and any course telling you otherwise is selling you
                something it can&rsquo;t deliver.
              </p>
              <p>
                I won&rsquo;t claim you&rsquo;ll be an expert in three evenings
                either. You&rsquo;ll be competent at a specific set of things, and
                you&rsquo;ll know what you still don&rsquo;t know &mdash; which, in
                this job, is most of the battle.
              </p>
              <p>
                What I will promise: I&rsquo;ll teach it the way I actually do it,
                including the parts that go wrong. And if it isn&rsquo;t what you
                expected after the first evening,{" "}
                <Link href="/legal/refund-policy">ask for your money back</Link> and
                you&rsquo;ll get it.
              </p>

              <h2>Say hello</h2>
              <p>
                Questions before you book? Email{" "}
                <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> or
                WhatsApp{" "}
                <a href={`https://wa.me/${site.whatsapp.e164}`}>
                  {site.whatsapp.display}
                </a>
                . I read them myself.
              </p>
            </div>
          </div>
        </div>
      </Container>

      <FinalCtaBand />
    </>
  );
}
