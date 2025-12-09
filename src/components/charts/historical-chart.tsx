'use client';

/**
 * Historical Debt Composition Chart - Bloomberg Terminal 2.0
 *
 * Stacked area chart showing 50-year debt composition history
 * with professional terminal styling.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';
import { Button } from '@/components/ui/button';
import type { HistoricalDataPoint } from '@/lib/types/treasury';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <ChartSkeleton type="area" className="h-[500px]" />
});

interface OwnershipResponse {
  historical: HistoricalDataPoint[];
}

export function HistoricalChart() {
  const { theme } = useTheme();
  const [data, setData] = useState<HistoricalDataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/ownership');
        if (!res.ok) throw new Error('Failed to fetch historical data');
        const ownershipData: OwnershipResponse = await res.json();
        setData(ownershipData.historical);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const isDark = theme === 'dark';

  // Terminal-style colors
  const colors = {
    text: isDark ? '#8B99A6' : '#57534E',
    grid: isDark ? 'rgba(51, 144, 255, 0.1)' : '#E7E5E4',
    background: 'transparent',
    title: isDark ? '#E4E8ED' : '#1C1917',
    // Stacked area colors
    intragovernmental: isDark ? '#64748B' : '#94A3B8',
    federalReserve: isDark ? '#A78BFA' : '#8B5CF6',
    foreign: isDark ? '#2DD4BF' : '#14B8A6',
    domesticPrivate: isDark ? '#60A5FA' : '#3B82F6',
  };

  if (loading) {
    return <ChartSkeleton type="area" className="h-[500px]" />;
  }

  if (error || !data) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center border border-border rounded bg-card">
        <div className="text-destructive font-mono text-sm mb-2">ERROR: FAILED TO LOAD DATA</div>
        <p className="text-muted-foreground text-xs mb-4">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          RETRY CONNECTION
        </Button>
      </div>
    );
  }

  const years = data.map(d => d.year);

  const plotData: Plotly.Data[] = [
    {
      x: years,
      y: data.map(d => d.intragovernmental),
      name: 'Intragovernmental',
      stackgroup: 'one',
      mode: 'none' as const,
      fillcolor: colors.intragovernmental,
      hovertemplate: '<b>%{x}</b><br>Intragovt: $%{y:.2f}T<extra></extra>',
    },
    {
      x: years,
      y: data.map(d => d.federalReserve),
      name: 'Federal Reserve',
      stackgroup: 'one',
      mode: 'none' as const,
      fillcolor: colors.federalReserve,
      hovertemplate: '<b>%{x}</b><br>Fed: $%{y:.2f}T<extra></extra>',
    },
    {
      x: years,
      y: data.map(d => d.foreign),
      name: 'Foreign',
      stackgroup: 'one',
      mode: 'none' as const,
      fillcolor: colors.foreign,
      hovertemplate: '<b>%{x}</b><br>Foreign: $%{y:.2f}T<extra></extra>',
    },
    {
      x: years,
      y: data.map(d => d.domesticPrivate),
      name: 'Domestic Private',
      stackgroup: 'one',
      mode: 'none' as const,
      fillcolor: colors.domesticPrivate,
      hovertemplate: '<b>%{x}</b><br>Domestic: $%{y:.2f}T<extra></extra>',
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    yaxis: {
      title: {
        text: 'Trillions ($)',
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
        text: 'Year',
        font: { size: 11, color: colors.text }
      },
      color: colors.text,
      gridcolor: colors.grid,
      tickfont: { size: 10, family: 'JetBrains Mono, monospace' },
    },
    margin: { t: 20, b: 60, l: 70, r: 20 },
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
    <div className="w-full h-[500px] chart-container">
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
    </div>
  );
}
