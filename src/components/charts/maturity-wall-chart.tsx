'use client';

/**
 * Maturity Wall Chart Component
 * 
 * Stacked bar chart showing debt maturing by year and security type.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';
import type { MaturityWallData } from '@/lib/types/treasury';

const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => <ChartSkeleton type="bar" className="h-[450px]" />
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
    return <ChartSkeleton type="bar" className="h-[450px]" />;
  }

  if (error || !data) {
    return (
      <div className="h-[450px] flex flex-col items-center justify-center text-red-500">
        <span className="mb-2">Failed to load maturity data</span>
        <button 
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-stone-100 dark:bg-zinc-800 border rounded hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-900 dark:text-zinc-100"
        >
          Retry
        </button>
      </div>
    );
  }

  const isDark = theme === 'dark';
  const textColor = isDark ? '#A1A1AA' : '#57534E';
  const gridColor = isDark ? '#3F3F46' : '#E7E5E4';
  const bgColor = isDark ? '#27272A' : '#FFFFFF';
  const titleColor = isDark ? '#FAFAFA' : '#1C1917';

  const years = data.data.map(d => d.year.toString());

  const plotData: Plotly.Data[] = [
    {
      x: years,
      y: data.data.map(d => d.bills),
      name: 'Bills',
      type: 'bar',
      marker: { color: '#94a3b8' },
    },
    {
      x: years,
      y: data.data.map(d => d.notes),
      name: 'Notes',
      type: 'bar',
      marker: { color: '#475569' },
    },
    {
      x: years,
      y: data.data.map(d => d.bonds),
      name: 'Bonds',
      type: 'bar',
      marker: { color: '#1e293b' },
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    barmode: 'stack',
    title: { 
      text: 'The Maturity Wall (Next 10 Years)', 
      font: { color: titleColor } 
    },
    yaxis: { 
      title: { text: 'Amount Maturing ($)' }, 
      color: textColor, 
      gridcolor: gridColor,
      rangemode: 'tozero',
    },
    xaxis: { 
      title: { text: 'Year of Maturity' }, 
      color: textColor, 
      gridcolor: gridColor,
      type: 'category',
    },
    margin: { t: 40, b: 40, l: 60, r: 20 },
    legend: { 
      orientation: 'h', 
      y: 1.1, 
      font: { color: textColor } 
    },
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
  };

  return (
    <div className="w-full h-[450px]">
      <Plot
        data={plotData}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full h-full"
      />
    </div>
  );
}

