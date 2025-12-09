'use client';

/**
 * Sankey Diagram Component - Bloomberg Terminal 2.0
 *
 * Displays debt ownership flow using Plotly.js
 * with professional terminal styling.
 */

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';
import { Button } from '@/components/ui/button';

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

  const isDark = theme === 'dark';

  // Terminal-style colors
  const colors = {
    text: isDark ? '#8B99A6' : '#57534E',
    title: isDark ? '#E4E8ED' : '#1C1917',
    background: 'transparent',
    nodeLine: isDark ? 'rgba(51, 144, 255, 0.3)' : '#E7E5E4',
    // Custom node colors for terminal aesthetic
    nodeColors: isDark
      ? ['#60A5FA', '#A78BFA', '#2DD4BF', '#FBBF24', '#F472B6', '#818CF8']
      : ['#3B82F6', '#8B5CF6', '#14B8A6', '#F59E0B', '#EC4899', '#6366F1'],
  };

  if (loading) {
    return <ChartSkeleton type="sankey" className="h-[500px]" />;
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

  // Apply terminal colors to nodes
  const terminalNodeColors = data.sankey.nodes.map((_, i) =>
    colors.nodeColors[i % colors.nodeColors.length]
  );

  const plotData: Plotly.Data[] = [{
    type: 'sankey',
    orientation: 'h',
    node: {
      pad: 20,
      thickness: 24,
      line: {
        color: colors.nodeLine,
        width: 1
      },
      label: data.sankey.nodes,
      color: terminalNodeColors,
      hovertemplate: '<b>%{label}</b><br>$%{value:.2f}T<extra></extra>',
    },
    link: {
      source: data.sankey.links.map(l => l.source),
      target: data.sankey.links.map(l => l.target),
      value: data.sankey.links.map(l => l.value),
      color: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.15)',
      hovertemplate: '<b>%{source.label}</b> → <b>%{target.label}</b><br>$%{value:.2f}T<extra></extra>',
    },
  }];

  const layout: Partial<Plotly.Layout> = {
    font: {
      size: 11,
      family: 'JetBrains Mono, monospace',
      color: colors.text
    },
    margin: { t: 20, b: 20, l: 10, r: 10 },
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
    <div ref={containerRef} className="w-full h-[500px] chart-container">
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
