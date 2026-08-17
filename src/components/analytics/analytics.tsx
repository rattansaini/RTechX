"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { readConsent, writeConsent, type ConsentState } from "@/lib/analytics";

const GA4 = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Consent-gated analytics.
 *
 * No GA4 or Meta script is added to the document until the visitor accepts.
 * That is the point of doing it this way rather than pasting the vendors'
 * snippets: declining means the third-party code is never fetched at all, not
 * merely told to behave. It also keeps these scripts off the critical path for
 * everyone, which is worth real Lighthouse points on a mid-range phone.
 */
export function Analytics() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(readConsent());
    const onChange = (e: Event) => setConsent((e as CustomEvent).detail as ConsentState);
    window.addEventListener("rtx:consent", onChange);
    return () => window.removeEventListener("rtx:consent", onChange);
  }, []);

  const configured = Boolean(GA4 || PIXEL);
  const granted = consent === "granted";

  // Render nothing at all until mounted, so the server and client agree and
  // the banner can't flash for someone who already decided.
  if (!mounted || !configured) return null;

  return (
    <>
      {granted && GA4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
              gtag('js',new Date());
              gtag('config','${GA4}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {granted && PIXEL && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${PIXEL}');fbq('track','PageView');`}
        </Script>
      )}

      {consent === null && <ConsentBanner onDecide={setConsent} />}
    </>
  );
}

function ConsentBanner({ onDecide }: { onDecide: (s: ConsentState) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  // Publish this banner's height so the sticky purchase bar can sit above it
  // instead of underneath it. Both are fixed to the bottom of the viewport, and
  // this one is on top — so without this the banner hides the buy button on the
  // course page for every visitor who hasn't chosen yet.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () =>
      document.documentElement.style.setProperty(
        "--consent-height",
        `${el.offsetHeight}px`
      );
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--consent-height");
    };
  }, []);

  function decide(state: "granted" | "denied") {
    writeConsent(state);
    onDecide(state);
  }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_-16px_rgba(10,31,68,0.25)]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[0.9375rem] leading-relaxed text-ink-400">
          We&rsquo;d like to measure which ads bring people who actually enrol.
          Decline and no analytics or advertising script loads at all — the site
          works identically.{" "}
          <Link
            href="/legal/privacy"
            className="font-semibold text-blue-700 underline underline-offset-4"
          >
            Privacy policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2.5">
          <Button variant="secondary" size="sm" onClick={() => decide("denied")}>
            Decline
          </Button>
          <Button size="sm" onClick={() => decide("granted")}>
            Allow
          </Button>
        </div>
      </div>
    </div>
  );
}
