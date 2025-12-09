'use client';

/**
 * Maturity Wall Chart Component - Bloomberg Terminal 2.0
 *
 * Stacked bar chart showing debt maturing by year and security type
 * with professional terminal styling.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';
import { Button } from '@/components/ui/button';
import type { MaturityWallData } from '@/lib/types/treasury';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <ChartSkeleton type="bar" className="h-[400px]" />
});

interface MaturityResponse {
  data: MaturityWallData[];
  meta: {
    recordDate: string;
    totalSecuritiesProcessed: number;
  };
}

export function MaturityWallChart() {
  const { theme } = useTheme();
  const [data, setData] = useState<MaturityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/maturity-wall');
        if (!res.ok) throw new Error('Failed to fetch maturity data');
        const maturityData = await res.json();
        setData(maturityData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <ChartSkeleton type="bar" className="h-[400px]" />;
  }

  if (error || !data) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center border border-border rounded bg-card">
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

  const isDark = theme === 'dark';

  // Terminal-style colors
  const colors = {
    text: isDark ? '#8B99A6' : '#57534E',
    grid: isDark ? 'rgba(51, 144, 255, 0.1)' : '#E7E5E4',
    background: 'transparent',
    title: isDark ? '#E4E8ED' : '#1C1917',
    // Security type colors
    bills: isDark ? '#60A5FA' : '#94a3b8',
    notes: isDark ? '#A78BFA' : '#475569',
    bonds: isDark ? '#818CF8' : '#1e293b',
    tips: isDark ? '#2DD4BF' : '#14b8a6',
    frn: isDark ? '#FBBF24' : '#f59e0b',
  };

  const years = data.data.map(d => d.year.toString());

  const plotData: Plotly.Data[] = [
    {
      x: years,
      y: data.data.map(d => d.bills / 1e9),
      name: 'Bills',
      type: 'bar',
      marker: {
        color: colors.bills,
        line: { width: 0 }
      },
      hovertemplate: '%{y:.1f}B<extra>Bills</extra>',
    },
    {
      x: years,
      y: data.data.map(d => d.notes / 1e9),
      name: 'Notes',
      type: 'bar',
      marker: {
        color: colors.notes,
        line: { width: 0 }
      },
      hovertemplate: '%{y:.1f}B<extra>Notes</extra>',
    },
    {
      x: years,
      y: data.data.map(d => d.bonds / 1e9),
      name: 'Bonds',
      type: 'bar',
      marker: {
        color: colors.bonds,
        line: { width: 0 }
      },
      hovertemplate: '%{y:.1f}B<extra>Bonds</extra>',
    },
    {
      x: years,
      y: data.data.map(d => (d.tips || 0) / 1e9),
      name: 'TIPS',
      type: 'bar',
      marker: {
        color: colors.tips,
        line: { width: 0 }
      },
      hovertemplate: '%{y:.1f}B<extra>TIPS</extra>',
    },
    {
      x: years,
      y: data.data.map(d => (d.frn || 0) / 1e9),
      name: 'FRN',
      type: 'bar',
      marker: {
        color: colors.frn,
        line: { width: 0 }
      },
      hovertemplate: '%{y:.1f}B<extra>FRN</extra>',
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    barmode: 'stack',
    bargap: 0.15,
    yaxis: {
      title: {
        text: 'Amount ($B)',
        font: { size: 11, color: colors.text },
      },
      color: colors.text,
      gridcolor: colors.grid,
      gridwidth: 1,
      tickfont: { size: 10, family: 'JetBrains Mono, monospace' },
      rangemode: 'tozero',
      zeroline: false,
    },
    xaxis: {
      title: {
        text: 'Maturity Year',
        font: { size: 11, color: colors.text },
      },
      color: colors.text,
      gridcolor: colors.grid,
      tickfont: { size: 10, family: 'JetBrains Mono, monospace' },
      type: 'category',
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
    <div className="w-full h-[400px] chart-container">
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
