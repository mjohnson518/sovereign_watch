'use client';

/**
 * Breakeven Inflation Chart - Bloomberg Terminal 2.0
 *
 * Displays 10Y Breakeven Inflation Rate (Market Expectations)
 * with 2% target line and professional terminal styling.
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

export function BreakevenChart() {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState('1y');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/health/history?timeframe=${timeframe}`);
        if (!res.ok) throw new Error('Failed to fetch inflation data');
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
    inflation: isDark ? '#FBBF24' : '#F59E0B',
    inflationFill: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(245, 158, 11, 0.1)',
    target: '#EF4444',
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
      y: data.map(d => d.breakeven10y),
      name: '10Y Breakeven',
      type: 'scatter',
      mode: 'lines',
      fill: 'tozeroy',
      fillcolor: colors.inflationFill,
      line: { color: colors.inflation, width: 2 },
      hovertemplate: '<b>%{x}</b><br>Breakeven: %{y:.2f}%<extra></extra>',
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    yaxis: {
      title: {
        text: 'Rate (%)',
        font: { size: 11, color: colors.text }
      },
      color: colors.text,
      gridcolor: colors.grid,
      gridwidth: 1,
      tickfont: { size: 10, family: 'JetBrains Mono, monospace' },
      zeroline: false,
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
    shapes: [
      // 2% Fed Target Line
      {
        type: 'line',
        xref: 'paper',
        x0: 0,
        x1: 1,
        yref: 'y',
        y0: 2.0,
        y1: 2.0,
        line: {
          color: colors.target,
          width: 1,
          dash: 'dot'
        }
      }
    ],
    annotations: [
      {
        x: 1,
        y: 2.0,
        xref: 'paper',
        yref: 'y',
        text: '2% TARGET',
        showarrow: false,
        xanchor: 'right',
        font: {
          size: 9,
          color: colors.target,
          family: 'JetBrains Mono, monospace'
        },
        bgcolor: isDark ? 'rgba(26, 31, 46, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderpad: 2,
      }
    ],
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
