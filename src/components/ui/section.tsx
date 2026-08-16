import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * Standard section rhythm. `tone="navy"` flips to the dark surface and adds
 * the `on-navy` class that retargets focus rings to cyan.
 */
export function Section({
  id,
  tone = "paper",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  tone?: "paper" | "white" | "navy";
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative",
        tone === "navy" && "on-navy overflow-hidden bg-ink text-ink-300",
        tone === "white" && "bg-white",
        className
      )}
    >
      {tone === "navy" && (
        <div className="pointer-events-none absolute inset-0 grid-field-navy" aria-hidden="true" />
      )}
      <Container className={cn("relative py-16 sm:py-20 lg:py-24", containerClassName)}>
        {children}
      </Container>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "ink",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  tone?: "ink" | "white";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 font-mono text-xs uppercase tracking-[0.14em]",
            tone === "white" ? "text-cyan" : "text-cyan-ink"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-[1.75rem] font-extrabold leading-[1.15] sm:text-4xl",
          tone === "white" ? "text-white" : "text-ink"
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            "mt-4 text-[1.0625rem] leading-relaxed",
            tone === "white" ? "text-ink-300" : "text-ink-400"
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
