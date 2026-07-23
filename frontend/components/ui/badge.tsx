import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-ds-caption font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brass focus:ring-offset-2 focus:ring-offset-warm-off-white",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-charcoal-ink text-warm-off-white shadow-paper hover:bg-fountain-navy",
        secondary:
          "border-transparent bg-cream text-charcoal-ink shadow-paper hover:bg-linen",
        destructive:
          "border-transparent bg-terracotta text-warm-off-white shadow-paper hover:bg-terracotta/90",
        outline:
          "border-charcoal-ink/20 bg-warm-off-white text-charcoal-ink hover:bg-linen",
        glass:
          "border-charcoal-ink/10 glass-panel text-charcoal-ink shadow-paper",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
