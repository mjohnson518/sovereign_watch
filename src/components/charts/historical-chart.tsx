'use client';

/**
 * Historical Debt Composition Chart
 * 
 * Stacked area chart showing 50-year debt composition history.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';
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

  if (loading) {
    return <ChartSkeleton type="area" className="h-[500px]" />;
  }

  if (error || !data) {
    return (
      <div className="h-[500px] flex items-center justify-center text-red-500">
        Failed to load historical data: {error}
      </div>
    );
  }

  const isDark = theme === 'dark';
  const textColor = isDark ? '#A1A1AA' : '#57534E';
  const gridColor = isDark ? '#3F3F46' : '#E7E5E4';
  const bgColor = isDark ? '#27272A' : '#FFFFFF';
  const titleColor = isDark ? '#FAFAFA' : '#1C1917';

  const years = data.map(d => d.year);

  const plotData: Plotly.Data[] = [
    {
      x: years,
      y: data.map(d => d.intragovernmental),
      name: 'Intragovernmental (Trust Funds)',
      stackgroup: 'one',
      mode: 'none' as const,
      fillcolor: '#9CA3AF',
    },
    {
      x: years,
      y: data.map(d => d.federalReserve),
      name: 'Federal Reserve (Monetary Policy)',
      stackgroup: 'one',
      mode: 'none' as const,
      fillcolor: '#64748B',
    },
    {
      x: years,
      y: data.map(d => d.foreign),
      name: 'Foreign Investors',
      stackgroup: 'one',
      mode: 'none' as const,
      fillcolor: '#059669',
    },
    {
      x: years,
      y: data.map(d => d.domesticPrivate),
      name: 'Domestic Private (Banks/Households/Funds)',
      stackgroup: 'one',
      mode: 'none' as const,
      fillcolor: '#475569',
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    title: { 
      text: '50-Year Debt Composition (Sector Breakdown)', 
      font: { color: titleColor } 
    },
    yaxis: { 
      title: { text: 'Trillions ($)' }, 
      color: textColor, 
      gridcolor: gridColor 
    },
    xaxis: { 
      color: textColor, 
      gridcolor: gridColor 
    },
    margin: { t: 40, b: 40, l: 60, r: 20 },
    legend: { 
      orientation: 'h', 
      y: 1.1, 
      font: { color: textColor } 
    },
    hovermode: 'x unified',
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
  };

  return (
    <div className="w-full h-[500px]">
      <Plot
        data={plotData}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full h-full"
      />
    </div>
  );
}

