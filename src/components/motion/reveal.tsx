"use client";

import { motion } from "framer-motion";

/**
 * Scroll reveal used across marketing sections.
 *
 * The markup is identical on server and client — reduced motion is handled
 * globally by MotionProvider, not by branching here. Never wrap the LCP
 * element in this: it starts at opacity 0 and would delay the largest paint.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "figure" | "ul";
}) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}
