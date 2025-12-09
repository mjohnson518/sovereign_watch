import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/50",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 border border-destructive/50",
        outline:
          "border border-border bg-transparent hover:bg-muted hover:border-muted-foreground/30 text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
        ghost:
          "hover:bg-muted hover:text-foreground text-muted-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        terminal:
          "bg-card border border-border text-foreground hover:bg-muted hover:border-primary/50 font-mono",
      },
      size: {
        default: "h-8 px-3 py-1.5 rounded",
        sm: "h-7 rounded px-2.5 gap-1.5 text-[11px]",
        lg: "h-9 rounded px-4",
        icon: "h-8 w-8 rounded",
        "icon-sm": "h-7 w-7 rounded",
        "icon-lg": "h-9 w-9 rounded",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// Terminal-style action button
function TerminalButton({
  className,
  children,
  shortcut,
  ...props
}: React.ComponentProps<typeof Button> & {
  shortcut?: string
}) {
  return (
    <Button
      variant="terminal"
      className={cn("group", className)}
      {...props}
    >
      {children}
      {shortcut && (
        <span className="ml-auto kbd text-[9px] group-hover:bg-primary/20 group-hover:text-primary transition-colors">
          {shortcut}
        </span>
      )}
    </Button>
  )
}

// Timeframe selector button group
interface TimeframeButtonProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  className?: string
}

function TimeframeButtons({ options, value, onChange, className }: TimeframeButtonProps) {
  return (
    <div className={cn("flex items-center gap-0.5 p-0.5 bg-muted rounded", className)}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "px-2 py-1 text-[10px] font-mono font-medium rounded transition-all",
            value === option
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
          )}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export { Button, buttonVariants, TerminalButton, TimeframeButtons }
