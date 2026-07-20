import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-ds-caption font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-[1.02]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-elevation-1 hover:bg-primary/90 hover:shadow-elevation-2",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-elevation-1 hover:bg-secondary/80 hover:shadow-elevation-2",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-elevation-1 hover:bg-destructive/80 hover:shadow-elevation-2",
        outline: "text-foreground hover:bg-accent/50",
        glass: "border-white/20 glass text-foreground shadow-glass hover:bg-white/20",
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
