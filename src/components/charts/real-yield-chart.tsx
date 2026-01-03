'use client';

/**
 * Real Yield Chart - Bloomberg Terminal 2.0
 *
 * Compares 10Y Nominal vs 10Y Real (TIPS) yields
 * with professional terminal styling.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';
import { TimeframeButtons } from '@/components/ui/button';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <ChartSkeleton type="line" className="h-[400px]" />
});

const TIMEFRAMES = ['1y', '3y', '5y'];

interface YieldDataPoint {
  date: string;
  yield10y: number;
  realYield10y: number;
}

export function RealYieldChart() {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState('1y');
  const [data, setData] = useState<YieldDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/health/history?timeframe=${timeframe}`);
        if (!res.ok) throw new Error('Failed to fetch yield data');
        const json = await res.json();
        setData(json);
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
    nominal: isDark ? '#60A5FA' : '#3B82F6',
    real: isDark ? '#2DD4BF' : '#14B8A6',
  };

  if (error) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center border border-border rounded bg-card">
        <div className="text-destructive font-mono text-sm mb-2">ERROR: FAILED TO LOAD DATA</div>
        <p className="text-muted-foreground text-xs">{error}</p>
      </div>
    );
  }

  const plotData: Plotly.Data[] = [
    {
      x: data.map(d => d.date),
      y: data.map(d => d.yield10y),
      name: '10Y Nominal',
      type: 'scatter',
      mode: 'lines',
      line: { color: colors.nominal, width: 2 },
      hovertemplate: '<b>%{x}</b><br>Nominal: %{y:.2f}%<extra></extra>',
    },
    {
      x: data.map(d => d.date),
      y: data.map(d => d.realYield10y),
      name: '10Y Real (TIPS)',
      type: 'scatter',
      mode: 'lines',
      line: { color: colors.real, width: 2 },
      hovertemplate: '<b>%{x}</b><br>Real: %{y:.2f}%<extra></extra>',
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    yaxis: {
      title: {
        text: 'Yield (%)',
        font: { size: 11, color: colors.text }
      },
      color: colors.text,
      gridcolor: colors.grid,
      gridwidth: 1,
      tickfont: { size: 10, family: 'JetBrains Mono, monospace' },
      zeroline: true,
      zerolinecolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    xaxis: {
      title: {
        text: 'Date',
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
          <ChartSkeleton type="line" className="h-full" />
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
