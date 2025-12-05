'use client';

/**
 * Chart Skeleton Loaders
 * 
 * Skeleton placeholders that mimic chart shapes for better UX.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChartSkeletonProps {
  type: 'bar' | 'line' | 'sankey' | 'area';
  className?: string;
}

export function ChartSkeleton({ type, className }: ChartSkeletonProps) {
  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* Title skeleton */}
      <Skeleton className="h-6 w-48 mb-4" />
      
      {/* Chart area skeleton */}
      <div className="flex-1 flex items-end gap-2 pb-8 px-4">
        {type === 'bar' && <BarChartSkeleton />}
        {type === 'line' && <LineChartSkeleton />}
        {type === 'sankey' && <SankeySkeleton />}
        {type === 'area' && <AreaChartSkeleton />}
      </div>
      
      {/* X-axis skeleton */}
      <div className="flex justify-between px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

function BarChartSkeleton() {
  const heights = [60, 80, 45, 90, 70, 85, 55, 75, 65, 50];
  
  return (
    <>
      {heights.map((height, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end gap-1">
          <Skeleton 
            className="w-full rounded-t" 
            style={{ height: `${height}%` }} 
          />
        </div>
      ))}
    </>
  );
}

function LineChartSkeleton() {
  return (
    <div className="w-full h-full relative">
      <Skeleton className="absolute inset-0 opacity-20" />
      <svg className="w-full h-full" viewBox="0 0 100 50">
        <path
          d="M 0 40 Q 10 35, 20 30 T 40 25 T 60 20 T 80 15 T 100 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-stone-200 dark:text-zinc-700"
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
        <Skeleton className="h-24 w-16 rounded" />
      </div>
      
      {/* Middle connections */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <Skeleton className="h-2 w-full opacity-30" />
        <Skeleton className="h-4 w-full opacity-40" />
        <Skeleton className="h-3 w-full opacity-35" />
      </div>
      
      {/* Middle nodes */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 w-14 rounded" />
        <Skeleton className="h-12 w-14 rounded" />
      </div>
      
      {/* Right connections */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <Skeleton className="h-3 w-full opacity-35" />
        <Skeleton className="h-2 w-full opacity-30" />
        <Skeleton className="h-4 w-full opacity-40" />
        <Skeleton className="h-2 w-full opacity-30" />
      </div>
      
      {/* Right nodes */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-12 rounded" />
        <Skeleton className="h-8 w-12 rounded" />
        <Skeleton className="h-6 w-12 rounded" />
        <Skeleton className="h-10 w-12 rounded" />
      </div>
    </div>
  );
}

function AreaChartSkeleton() {
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 flex flex-col">
        <Skeleton className="flex-1 opacity-20 rounded-t" />
        <Skeleton className="h-1/3 opacity-30" />
        <Skeleton className="h-1/4 opacity-40" />
        <Skeleton className="h-1/5 opacity-50" />
      </div>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="w-6 h-6 border-2 border-stone-200 dark:border-zinc-700 border-t-stone-600 dark:border-t-zinc-300 rounded-full animate-spin" />
    </div>
  );
}

