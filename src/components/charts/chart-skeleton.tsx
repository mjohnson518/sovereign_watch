'use client';

/**
 * Chart Skeleton Loaders - Bloomberg Terminal 2.0
 *
 * Terminal-style skeleton placeholders with shimmer animation.
 */

import { cn } from '@/lib/utils';

interface ChartSkeletonProps {
  type: 'bar' | 'line' | 'sankey' | 'area';
  className?: string;
}

export function ChartSkeleton({ type, className }: ChartSkeletonProps) {
  return (
    <div className={cn('w-full h-full flex flex-col rounded border border-border bg-card', className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
        <div className="skeleton-shimmer h-4 w-32 rounded" />
        <div className="skeleton-shimmer h-4 w-16 rounded" />
      </div>

      {/* Chart area skeleton */}
      <div className="flex-1 flex items-end gap-2 p-4">
        {type === 'bar' && <BarChartSkeleton />}
        {type === 'line' && <LineChartSkeleton />}
        {type === 'sankey' && <SankeySkeleton />}
        {type === 'area' && <AreaChartSkeleton />}
      </div>

      {/* X-axis skeleton */}
      <div className="flex justify-between px-4 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-3 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

function BarChartSkeleton() {
  const heights = [60, 80, 45, 90, 70, 85, 55, 75, 65, 50];

  return (
    <div className="flex-1 flex items-end gap-2 h-full">
      {heights.map((height, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end">
          <div
            className="w-full rounded-t skeleton-shimmer"
            style={{ height: `${height}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function LineChartSkeleton() {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <svg className="w-full h-full opacity-30" viewBox="0 0 100 50" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M 0 40 Q 10 35, 20 30 T 40 25 T 60 20 T 80 15 T 100 10"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

function SankeySkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-between px-8">
      {/* Left nodes */}
      <div className="flex flex-col gap-4">
        <div className="skeleton-shimmer h-24 w-16 rounded" />
      </div>

      {/* Middle connections */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
        <div className="skeleton-shimmer h-2 w-full rounded opacity-30" />
        <div className="skeleton-shimmer h-4 w-full rounded opacity-40" />
        <div className="skeleton-shimmer h-3 w-full rounded opacity-35" />
      </div>

      {/* Middle nodes */}
      <div className="flex flex-col gap-3">
        <div className="skeleton-shimmer h-16 w-14 rounded" />
        <div className="skeleton-shimmer h-12 w-14 rounded" />
      </div>

      {/* Right connections */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
        <div className="skeleton-shimmer h-3 w-full rounded opacity-35" />
        <div className="skeleton-shimmer h-2 w-full rounded opacity-30" />
        <div className="skeleton-shimmer h-4 w-full rounded opacity-40" />
        <div className="skeleton-shimmer h-2 w-full rounded opacity-30" />
      </div>

      {/* Right nodes */}
      <div className="flex flex-col gap-2">
        <div className="skeleton-shimmer h-10 w-12 rounded" />
        <div className="skeleton-shimmer h-8 w-12 rounded" />
        <div className="skeleton-shimmer h-6 w-12 rounded" />
        <div className="skeleton-shimmer h-10 w-12 rounded" />
      </div>
    </div>
  );
}

function AreaChartSkeleton() {
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 skeleton-shimmer opacity-20 rounded-t" />
        <div className="h-1/3 skeleton-shimmer opacity-30" />
        <div className="h-1/4 skeleton-shimmer opacity-40" />
        <div className="h-1/5 skeleton-shimmer opacity-50" />
      </div>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
