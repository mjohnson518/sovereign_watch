'use client';

/**
 * Auction Demand Chart Component - Bloomberg Terminal 2.0
 *
 * Scatter plot showing bid-to-cover ratios over time
 * with zone indicators and professional styling.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';
import { TimeframeButtons } from '@/components/ui/button';
import type { AuctionDemandData } from '@/lib/types/treasury';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <ChartSkeleton type="line" className="h-[400px]" />
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

const TIMEFRAMES = ['1y', '3y', '5y', '10y'];

export function DemandChart() {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState('1y');
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

  // Terminal-style colors
  const colors = {
    text: isDark ? '#8B99A6' : '#57534E',
    grid: isDark ? 'rgba(51, 144, 255, 0.1)' : '#E7E5E4',
    background: 'transparent',
    marker: isDark ? '#60A5FA' : '#3B82F6',
    strongZone: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(5, 150, 105, 0.08)',
    adequateZone: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)',
    weakZone: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.08)',
  };

  if (error) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center border border-border rounded bg-card">
        <div className="text-destructive font-mono text-sm mb-2">ERROR: FAILED TO LOAD DATA</div>
        <p className="text-muted-foreground text-xs">{error}</p>
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
      color: colors.marker,
      opacity: 0.8,
      line: { width: 1, color: isDark ? '#1e3a5f' : '#dbeafe' }
    },
    hovertemplate: '<b>%{x}</b><br>Ratio: %{y:.2f}<extra></extra>',
  }] : [];

  const layout: Partial<Plotly.Layout> = {
    yaxis: {
      title: { text: 'Bid-to-Cover', font: { size: 11, color: colors.text } },
      range: [1.0, 4.0],
      fixedrange: true,
      color: colors.text,
      gridcolor: colors.grid,
      tickfont: { size: 10, family: 'JetBrains Mono, monospace' },
      zeroline: false,
    },
    xaxis: {
      title: { text: 'Auction Date', font: { size: 11, color: colors.text } },
      color: colors.text,
      gridcolor: colors.grid,
      tickfont: { size: 10, family: 'JetBrains Mono, monospace' },
    },
    margin: { t: 20, b: 50, l: 60, r: 20 },
    paper_bgcolor: colors.background,
    plot_bgcolor: colors.background,
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
        fillcolor: colors.strongZone,
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
        fillcolor: colors.adequateZone,
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
        fillcolor: colors.weakZone,
        line: { width: 0 }
      },
    ],
    hoverlabel: {
      bgcolor: isDark ? '#1a1f2e' : '#ffffff',
      bordercolor: isDark ? 'rgba(51, 144, 255, 0.3)' : '#e7e5e4',
      font: {
        family: 'JetBrains Mono, monospace',
        size: 11,
        color: isDark ? '#E4E8ED' : '#1C1917',
      },
    },
  };

  return (
    <div className="w-full">
      {/* Timeframe Controls */}
      <div className="flex justify-end mb-4">
        <TimeframeButtons
          options={TIMEFRAMES}
          value={timeframe}
          onChange={setTimeframe}
        />
      </div>

      {/* Chart */}
      <div className="h-[400px] chart-container">
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
        <div className="mt-4 grid grid-cols-4 gap-4">
          <StatBox label="AUCTIONS" value={data.stats.count.toString()} />
          <StatBox label="AVG RATIO" value={data.stats.avgRatio.toFixed(2)} />
          <StatBox label="MIN" value={data.stats.minRatio.toFixed(2)} />
          <StatBox label="BELOW 2.0" value={data.stats.belowThreshold.toString()} variant="danger" />
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  variant = 'default'
}: {
  label: string;
  value: string;
  variant?: 'default' | 'danger';
}) {
  return (
    <div className="text-center p-3 bg-muted/30 rounded border border-border/50">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <div className={`font-mono text-lg font-semibold ${variant === 'danger' ? 'text-red-500' : 'text-foreground'}`}>
        {value}
      </div>
    </div>
  );
}
