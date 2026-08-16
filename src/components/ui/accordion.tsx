"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Radix accordion, restyled. Keyboard operable out of the box (arrow keys,
 * Home/End, Enter/Space) and the trigger is a real <button> inside a heading,
 * so the FAQ and curriculum both keep a sane document outline.
 */
export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "overflow-hidden rounded-card border border-line bg-white transition-colors data-[state=open]:border-blue-200",
        className
      )}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  headingLevel: Heading = "h3",
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  headingLevel?: "h2" | "h3";
}) {
  return (
    <AccordionPrimitive.Header asChild>
      <Heading className="!tracking-normal">
        <AccordionPrimitive.Trigger
          className={cn(
            "group flex w-full items-start justify-between gap-4 px-5 py-5 text-left text-[1.0625rem] font-semibold text-ink transition-colors hover:bg-blue-50/50 sm:px-6",
            className
          )}
          {...props}
        >
          {children}
          <Plus
            className="mt-0.5 size-5 shrink-0 text-blue transition-transform duration-200 group-data-[state=open]:rotate-45"
            aria-hidden="true"
          />
        </AccordionPrimitive.Trigger>
      </Heading>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        "overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      {...props}
    >
      <div className="px-5 pb-5 text-[0.9375rem] leading-relaxed text-ink-400 sm:px-6">
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}
