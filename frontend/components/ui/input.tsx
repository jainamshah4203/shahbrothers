import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border border-charcoal-ink/15 bg-cream px-4 py-2 text-ds-body text-charcoal-ink ring-offset-warm-off-white transition-all duration-300 file:border-0 file:bg-transparent file:text-ds-body file:font-medium file:text-charcoal-ink placeholder:text-muted-sepia/70 hover:border-charcoal-ink/25 hover:bg-linen/70 hover:shadow-paper focus-visible:outline-none focus-visible:border-brass focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:shadow-paper disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
