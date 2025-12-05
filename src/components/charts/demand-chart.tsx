'use client';

/**
 * Auction Demand Chart Component
 * 
 * Scatter plot showing bid-to-cover ratios over time.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';
import { Button } from '@/components/ui/button';
import type { AuctionDemandData } from '@/lib/types/treasury';

const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => <ChartSkeleton type="line" className="h-[450px]" />
});

interface AuctionsResponse {
  data: AuctionDemandData[];
  stats: {
    count: number;
    avgRatio: number;
    minRatio: number;
    maxRatio: number;
    belowThreshold: number;
  };
}

const TIMEFRAMES = ['1y', '3y', '5y', '10y'] as const;
type Timeframe = typeof TIMEFRAMES[number];

export function DemandChart() {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState<Timeframe>('1y');
  const [data, setData] = useState<AuctionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/auctions?timeframe=${timeframe}`);
        if (!res.ok) throw new Error('Failed to fetch auction data');
        const auctionData = await res.json();
        setData(auctionData);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [timeframe]);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#A1A1AA' : '#57534E';
  const gridColor = isDark ? '#3F3F46' : '#E7E5E4';
  const bgColor = isDark ? '#27272A' : '#FFFFFF';
  const markerColor = isDark ? '#FAFAFA' : '#1C1917';

  if (error) {
    return (
      <div className="h-[450px] flex items-center justify-center text-red-500">
        Failed to load auction data: {error}
      </div>
    );
  }

  const plotData: Plotly.Data[] = data ? [{
    x: data.data.map(d => d.date),
    y: data.data.map(d => d.ratio),
    type: 'scatter',
    mode: 'markers',
    name: 'Auction Result',
    marker: { 
      size: 6, 
      color: markerColor, 
      opacity: 0.7 
    },
  }] : [];

  const layout: Partial<Plotly.Layout> = {
    yaxis: { 
      title: { text: 'Bid-to-Cover Ratio' }, 
      range: [1.0, 4.0], 
      fixedrange: true, 
      color: textColor, 
      gridcolor: gridColor 
    },
    xaxis: { 
      title: { text: 'Auction Date' }, 
      color: textColor, 
      gridcolor: gridColor 
    },
    margin: { t: 20, b: 60, l: 60, r: 20 },
    legend: { 
      orientation: 'h', 
      y: 1.1, 
      font: { color: textColor } 
    },
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    shapes: [
      // Strong demand zone (green)
      { 
        type: 'rect', 
        xref: 'paper', 
        x0: 0, 
        x1: 1, 
        yref: 'y', 
        y0: 2.5, 
        y1: 4.0, 
        fillcolor: 'rgba(5, 150, 105, 0.1)', 
        line: { width: 0 } 
      },
      // Adequate zone (yellow)
      { 
        type: 'rect', 
        xref: 'paper', 
        x0: 0, 
        x1: 1, 
        yref: 'y', 
        y0: 2.0, 
        y1: 2.5, 
        fillcolor: 'rgba(251, 191, 36, 0.1)', 
        line: { width: 0 } 
      },
      // Danger zone (red)
      { 
        type: 'rect', 
        xref: 'paper', 
        x0: 0, 
        x1: 1, 
        yref: 'y', 
        y0: 0, 
        y1: 2.0, 
        fillcolor: 'rgba(220, 38, 38, 0.1)', 
        line: { width: 0 } 
      },
    ],
  };

  return (
    <div className="w-full">
      {/* Timeframe Controls */}
      <div className="flex space-x-2 mb-4 justify-end">
        {TIMEFRAMES.map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe(tf)}
            className="text-xs"
          >
            {tf.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[450px]">
        {loading ? (
          <ChartSkeleton type="line" className="h-full" />
        ) : (
          <Plot
            data={plotData}
            layout={layout}
            config={{ responsive: true, displayModeBar: false }}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Stats */}
      {data && (
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-stone-500 dark:text-zinc-500">Auctions</div>
            <div className="font-bold">{data.stats.count}</div>
          </div>
          <div className="text-center">
            <div className="text-stone-500 dark:text-zinc-500">Avg Ratio</div>
            <div className="font-bold">{data.stats.avgRatio.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-stone-500 dark:text-zinc-500">Min</div>
            <div className="font-bold">{data.stats.minRatio.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-stone-500 dark:text-zinc-500">Below 2.0</div>
            <div className="font-bold text-red-500">{data.stats.belowThreshold}</div>
          </div>
        </div>
      )}
    </div>
  );
}

