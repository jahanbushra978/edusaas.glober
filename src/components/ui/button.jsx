import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md hover:-translate-y-0.5",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
        premium:
          "bg-gradient-to-r from-[#052E2B] to-[#031A18] text-white shadow-lg shadow-[#052E2B]/25 hover:shadow-xl hover:shadow-[#052E2B]/30 hover:-translate-y-0.5 border border-[#D4AF37]/20 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        gold:
          "bg-gradient-to-r from-[#D4AF37] via-[#c9a227] to-[#b8962e] text-[#052E2B] font-semibold shadow-lg shadow-[#D4AF37]/25 hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 border border-[#D4AF37]/50 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        glass:
          "bg-white/70 backdrop-blur-xl text-[#052E2B] shadow-md shadow-black/5 border border-white/50 hover:bg-white/90 hover:shadow-lg hover:-translate-y-0.5 dark:bg-white/10 dark:text-white dark:border-white/10",
        "premium-outline":
          "border-2 border-[#D4AF37]/40 bg-transparent text-[#052E2B] shadow-sm hover:bg-gradient-to-r hover:from-[#052E2B] hover:to-[#031A18] hover:text-[#D4AF37] hover:border-[#D4AF37] hover:shadow-lg hover:shadow-[#052E2B]/20 hover:-translate-y-0.5 dark:text-white dark:hover:text-[#D4AF37]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-xl px-10 text-base gap-3",
        icon: "h-9 w-9",
        "icon-lg": "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
