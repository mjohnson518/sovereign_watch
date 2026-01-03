'use client';

/**
 * Bidder Composition Chart - Bloomberg Terminal 2.0
 *
 * Stacked area chart showing who is buying the debt
 * (Direct vs Indirect vs Dealers) with terminal styling.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';
import { TimeframeButtons } from '@/components/ui/button';
import type { AuctionDemandData } from '@/lib/types/treasury';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <ChartSkeleton type="area" className="h-[400px]" />
});

// Response type for auction API (used in fetch typing)
type AuctionsResponse = {
  data: AuctionDemandData[];
};

const TIMEFRAMES = ['1y', '3y', '5y', '10y'];

export function BidderChart() {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState('3y');
  const [data, setData] = useState<AuctionDemandData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/auctions?timeframe=${timeframe}&types=NOTE,BOND`);
        if (!res.ok) throw new Error('Failed to fetch auction data');
        const json = await res.json();
        setData(json.data);
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
    title: isDark ? '#E4E8ED' : '#1C1917',
    // Bidder type colors
    indirect: isDark ? '#2DD4BF' : '#14B8A6',
    direct: isDark ? '#60A5FA' : '#3B82F6',
    dealers: isDark ? '#F87171' : '#EF4444',
  };

  if (error) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center border border-border rounded bg-card">
        <div className="text-destructive font-mono text-sm mb-2">ERROR: FAILED TO LOAD DATA</div>
        <p className="text-muted-foreground text-xs">{error}</p>
      </div>
    );
  }

  // Process data for stacked area
  const processedData = data?.filter(d => d.accepted && d.indirect && d.dealers).map(d => {
    const total = d.accepted || 1;
    return {
      date: d.date,
      indirectPct: ((d.indirect || 0) / total) * 100,
      directPct: ((d.direct || 0) / total) * 100,
      dealersPct: ((d.dealers || 0) / total) * 100,
    };
  }) || [];

  const plotData: Plotly.Data[] = [
    {
      x: processedData.map(d => d.date),
      y: processedData.map(d => d.indirectPct),
      name: 'Indirect (Foreign)',
      stackgroup: 'one',
      mode: 'none',
      fillcolor: colors.indirect,
      hovertemplate: '<b>%{x}</b><br>Indirect: %{y:.1f}%<extra></extra>',
    },
    {
      x: processedData.map(d => d.date),
      y: processedData.map(d => d.directPct),
      name: 'Direct (Domestic)',
      stackgroup: 'one',
      mode: 'none',
      fillcolor: colors.direct,
      hovertemplate: '<b>%{x}</b><br>Direct: %{y:.1f}%<extra></extra>',
    },
    {
      x: processedData.map(d => d.date),
      y: processedData.map(d => d.dealersPct),
      name: 'Primary Dealers',
      stackgroup: 'one',
      mode: 'none',
      fillcolor: colors.dealers,
      hovertemplate: '<b>%{x}</b><br>Dealers: %{y:.1f}%<extra></extra>',
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    yaxis: {
      title: {
        text: '% of Accepted',
        font: { size: 11, color: colors.text }
      },
      range: [0, 100],
      fixedrange: true,
      color: colors.text,
      gridcolor: colors.grid,
      gridwidth: 1,
      tickfont: { size: 10, family: 'JetBrains Mono, monospace' },
      zeroline: false,
    },
    xaxis: {
      title: {
        text: 'Auction Date',
        font: { size: 11, color: colors.text }
      },
      color: colors.text,
      gridcolor: colors.grid,
      tickfont: { size: 10, family: 'JetBrains Mono, monospace' },
    },
    margin: { t: 20, b: 60, l: 60, r: 20 },
    legend: {
      orientation: 'h',
      y: -0.15,
      x: 0.5,
      xanchor: 'center',
      font: { size: 10, color: colors.text, family: 'IBM Plex Sans, sans-serif' },
      bgcolor: 'transparent',
    },
    hovermode: 'x unified',
    paper_bgcolor: colors.background,
    plot_bgcolor: colors.background,
    hoverlabel: {
      bgcolor: isDark ? '#1a1f2e' : '#ffffff',
      bordercolor: isDark ? 'rgba(51, 144, 255, 0.3)' : '#e7e5e4',
      font: {
        family: 'JetBrains Mono, monospace',
        size: 11,
        color: colors.title,
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
          <ChartSkeleton type="area" className="h-full" />
        ) : (
          <Plot
            data={plotData}
            layout={layout}
            config={{
              responsive: true,
              displayModeBar: false,
              staticPlot: false,
            }}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}
