"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"
import { useMagneticEffect } from "@/hooks/useMagneticEffect"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { Motion, framerTransition } from "@/lib/animations"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-ds-body font-medium ring-offset-warm-off-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-charcoal-ink text-warm-off-white shadow-premium hover:bg-fountain-navy hover:shadow-paper",
        destructive:
          "bg-terracotta text-warm-off-white shadow-paper hover:bg-terracotta/90",
        outline:
          "border border-charcoal-ink bg-transparent text-charcoal-ink hover:bg-charcoal-ink hover:text-warm-off-white",
        secondary:
          "bg-cream text-charcoal-ink shadow-paper hover:bg-linen",
        ghost: "text-charcoal-ink hover:bg-linen",
        link: "rounded-none text-fountain-navy underline-offset-4 hover:underline",
        glass:
          "glass-panel text-charcoal-ink shadow-paper hover:shadow-premium",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4 text-ds-caption",
        lg: "h-12 px-10 text-ds-product",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type MagneticVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>

const MAGNETIC_VARIANTS: MagneticVariant[] = [
  "default",
  "outline",
  "secondary",
  "glass",
]

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return
  if (typeof ref === "function") {
    ref(value)
    return
  }
  ;(ref as React.MutableRefObject<T | null>).current = value
}

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, ...props },
    forwardedRef
  ) => {
    const prefersReduced = useReducedMotion()
    const magneticRef = useMagneticEffect<HTMLButtonElement>({
      strength: 0.2,
      radius: 80,
    })

    const resolvedVariant = variant ?? "default"
    const enableMagnetic =
      !asChild && MAGNETIC_VARIANTS.includes(resolvedVariant)

    const classes = cn(buttonVariants({ variant: resolvedVariant, size, className }))

    const handleRef = (node: HTMLButtonElement | null) => {
      if (enableMagnetic) {
        assignRef(magneticRef, node)
      }
      assignRef(forwardedRef, node)
    }

    if (asChild) {
      return (
        <Slot
          className={cn(classes, "active:scale-[0.97]")}
          ref={forwardedRef}
          {...props}
        />
      )
    }

    const motionProps: HTMLMotionProps<"button"> = {
      className: classes,
      ref: handleRef,
      transition: framerTransition("click"),
      whileTap: prefersReduced ? undefined : Motion.Click.whileTap,
      ...props,
    }

    return <motion.button {...motionProps} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
