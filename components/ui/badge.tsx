import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--accent-primary)] text-white",
        secondary:
          "border-transparent bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
        outline: "border-[var(--border-default)] text-[var(--text-secondary)]",
        success:
          "border-transparent bg-[var(--success-light)] text-[var(--success)]",
        warning:
          "border-transparent bg-[var(--warning-light)] text-[var(--warning)]",
        danger:
          "border-transparent bg-[var(--danger-light)] text-[var(--danger)]",
        info: "border-transparent bg-[var(--info-light)] text-[var(--info)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
