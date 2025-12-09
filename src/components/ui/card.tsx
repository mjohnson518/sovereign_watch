import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "terminal" | "metric" | "glass";
  glow?: "blue" | "green" | "red" | "amber" | "none";
}

function Card({ className, variant = "default", glow = "none", ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative flex flex-col rounded border overflow-hidden transition-all",
        // Base styles
        variant === "default" && "bg-card text-card-foreground border-border",
        variant === "terminal" && "bg-card text-card-foreground border-border terminal-panel",
        variant === "metric" && "bg-card text-card-foreground border-border metric-card",
        variant === "glass" && "bg-card/50 backdrop-blur-sm text-card-foreground border-border/50",
        // Glow effects (dark mode only)
        glow === "blue" && "dark:box-glow-blue",
        glow === "green" && "dark:box-glow-green",
        glow === "red" && "dark:box-glow-red",
        glow === "amber" && "dark:box-glow-amber",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 p-4 border-b border-border/50 bg-muted/20",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-foreground",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "absolute top-3 right-3",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-4 pt-0", className)}
      {...props}
    />
  )
}

// Terminal-specific card components
function TerminalCard({ className, title, badge, children, ...props }: CardProps & { title?: string; badge?: string }) {
  return (
    <Card variant="terminal" className={className} {...props}>
      {title && (
        <div className="terminal-panel-header">
          <span className="terminal-panel-title">{title}</span>
          {badge && <span className="terminal-panel-badge">{badge}</span>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </Card>
  )
}

// Metric card for KPI display
interface MetricCardProps extends React.ComponentProps<"div"> {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  color?: "blue" | "green" | "red" | "amber" | "purple";
  icon?: React.ReactNode;
}

function MetricCard({
  className,
  label,
  value,
  delta,
  deltaType = "neutral",
  color = "blue",
  icon,
  ...props
}: MetricCardProps) {
  const colorStyles = {
    blue: "border-l-primary",
    green: "border-l-green-500",
    red: "border-l-red-500",
    amber: "border-l-amber-500",
    purple: "border-l-purple-500",
  };

  return (
    <div
      className={cn(
        "metric-card border-l-[3px]",
        colorStyles[color],
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="metric-card-label">{label}</div>
          <div className="metric-card-value">{value}</div>
          {delta && (
            <div className={cn(
              "metric-card-delta",
              deltaType === "positive" && "positive",
              deltaType === "negative" && "negative"
            )}>
              {deltaType === "positive" && "+"}{delta}
            </div>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground opacity-40">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// Data panel for detailed information
interface DataPanelProps extends React.ComponentProps<"div"> {
  title: string;
  subtitle?: string;
  status?: "live" | "static" | "error";
  children: React.ReactNode;
}

function DataPanel({ className, title, subtitle, status, children, ...props }: DataPanelProps) {
  return (
    <Card variant="terminal" className={className} {...props}>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {status && (
            <div className={cn(
              "w-2 h-2 rounded-full",
              status === "live" && "bg-green-500 status-live",
              status === "static" && "bg-amber-500",
              status === "error" && "bg-red-500"
            )} />
          )}
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardDescription className="mt-0.5">{subtitle}</CardDescription>}
          </div>
        </div>
        {status && (
          <span className={cn(
            "text-[10px] font-mono font-medium px-2 py-0.5 rounded",
            status === "live" && "bg-green-500/10 text-green-500",
            status === "static" && "bg-amber-500/10 text-amber-500",
            status === "error" && "bg-red-500/10 text-red-500"
          )}>
            {status.toUpperCase()}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  TerminalCard,
  MetricCard,
  DataPanel,
}
