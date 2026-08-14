import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui's Button primitive, restyled to the RTechX system:
 * one radius language, a real pressed state, and lift only on hover.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-field font-semibold whitespace-nowrap transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-600 text-white shadow-[0_1px_2px_rgba(10,31,68,0.16),0_8px_24px_-12px_rgba(21,96,224,0.7)] hover:bg-blue-700 hover:shadow-[0_2px_4px_rgba(10,31,68,0.18),0_14px_32px_-14px_rgba(21,96,224,0.8)]",
        secondary:
          "border border-line bg-white text-ink hover:border-blue-200 hover:bg-blue-50",
        ghost: "text-ink hover:bg-ink/5",
        onNavy:
          "bg-white text-ink hover:bg-blue-50 shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
        onNavyOutline:
          "border border-line-navy bg-ink-800 text-white hover:border-cyan hover:bg-ink-700",
      },
      size: {
        sm: "h-10 px-4 text-sm [&_svg]:size-4",
        md: "h-12 px-5 text-[0.9375rem] [&_svg]:size-4",
        lg: "h-14 px-7 text-base [&_svg]:size-5",
      },
      full: {
        true: "w-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export function Button({
  className,
  variant,
  size,
  full,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, full }), className)} {...props} />
  );
}

export { buttonVariants };
