'use client';

/**
 * Sankey Diagram Component
 * 
 * Displays debt ownership flow using Plotly.js
 */

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => <ChartSkeleton type="sankey" className="h-[500px]" />
});

interface OwnershipData {
  sankey: {
    nodes: string[];
    nodeColors: string[];
    nodeValues: number[];
    links: { source: number; target: number; value: number }[];
  };
  meta: {
    totalDebt: number;
    totalDebtFormatted: string;
  };
}

export function SankeyChart() {
  const { theme } = useTheme();
  const [data, setData] = useState<OwnershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/ownership');
        if (!res.ok) throw new Error('Failed to fetch ownership data');
        const ownershipData = await res.json();
        setData(ownershipData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return <ChartSkeleton type="sankey" className="h-[500px]" />;
  }

  if (error || !data) {
    return (
      <div className="h-[500px] flex items-center justify-center text-red-500">
        Failed to load ownership data: {error}
      </div>
    );
  }

  const isDark = theme === 'dark';
  const textColor = isDark ? '#A1A1AA' : '#57534E';
  const bgColor = isDark ? '#27272A' : '#FFFFFF';

  const plotData: Plotly.Data[] = [{
    type: 'sankey',
    orientation: 'h',
    node: {
      pad: 15,
      thickness: 20,
      line: { color: isDark ? '#3F3F46' : '#000000', width: 0.5 },
      label: data.sankey.nodes,
      color: data.sankey.nodeColors,
    },
    link: {
      source: data.sankey.links.map(l => l.source),
      target: data.sankey.links.map(l => l.target),
      value: data.sankey.links.map(l => l.value),
    },
  }];

  const layout: Partial<Plotly.Layout> = {
    font: { size: 12, family: 'Inter, sans-serif', color: textColor },
    margin: { t: 20, b: 20, l: 10, r: 10 },
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
  };

  return (
    <div ref={containerRef} className="w-full h-[500px]">
      <Plot
        data={plotData}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full h-full"
      />
    </div>
  );
}

