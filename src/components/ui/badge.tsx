import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2 py-0.5 text-[10px] font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors overflow-hidden font-mono tracking-wide",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary rounded",
        secondary:
          "border-border bg-muted text-muted-foreground rounded",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive rounded",
        success:
          "border-green-500/30 bg-green-500/10 text-green-500 rounded",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-500 rounded",
        outline:
          "border-border text-foreground bg-transparent rounded",
        live:
          "border-green-500/30 bg-green-500/10 text-green-500 rounded animate-pulse",
        terminal:
          "border-primary/30 bg-card text-foreground rounded font-mono",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

// Status indicator badge
interface StatusBadgeProps extends React.ComponentProps<"span"> {
  status: "live" | "connected" | "offline" | "error" | "pending";
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const statusConfig = {
    live: { color: "bg-green-500", text: "LIVE", variant: "success" as const },
    connected: { color: "bg-green-500", text: "CONNECTED", variant: "success" as const },
    offline: { color: "bg-muted-foreground", text: "OFFLINE", variant: "secondary" as const },
    error: { color: "bg-red-500", text: "ERROR", variant: "destructive" as const },
    pending: { color: "bg-amber-500", text: "PENDING", variant: "warning" as const },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1.5", className)}
      {...props}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.color, status === "live" && "status-live")} />
      {config.text}
    </Badge>
  );
}

// Data label badge for displaying key-value pairs
interface DataBadgeProps extends React.ComponentProps<"span"> {
  label: string;
  value: string | number;
}

function DataBadge({ label, value, className, ...props }: DataBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-mono",
        className
      )}
      {...props}
    >
      <span className="px-1.5 py-0.5 bg-muted text-muted-foreground border border-border border-r-0 rounded-l">
        {label}
      </span>
      <span className="px-1.5 py-0.5 bg-card text-foreground border border-border rounded-r">
        {value}
      </span>
    </span>
  );
}

export { Badge, badgeVariants, StatusBadge, DataBadge }
