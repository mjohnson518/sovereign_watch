'use client';

/**
 * Bidder Composition Chart Component
 * 
 * Stacked area chart showing who is buying the debt (Direct vs Indirect vs Dealers).
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';
import { Button } from '@/components/ui/button';
import type { AuctionDemandData } from '@/lib/types/treasury';

const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => <ChartSkeleton type="area" className="h-[400px]" />
});

interface AuctionsResponse {
  data: AuctionDemandData[];
}

const TIMEFRAMES = ['1y', '3y', '5y', '10y'] as const;
type Timeframe = typeof TIMEFRAMES[number];

export function BidderChart() {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState<Timeframe>('3y');
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
  const textColor = isDark ? '#A1A1AA' : '#57534E';
  const gridColor = isDark ? '#3F3F46' : '#E7E5E4';
  const bgColor = isDark ? '#27272A' : '#FFFFFF';

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center text-red-500">
        Failed to load bidder data: {error}
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
      name: 'Indirect (Foreign/Central Banks)',
      stackgroup: 'one',
      mode: 'none',
      fillcolor: '#059669', // Green
    },
    {
      x: processedData.map(d => d.date),
      y: processedData.map(d => d.directPct),
      name: 'Direct (Domestic Funds)',
      stackgroup: 'one',
      mode: 'none',
      fillcolor: '#3b82f6', // Blue
    },
    {
      x: processedData.map(d => d.date),
      y: processedData.map(d => d.dealersPct),
      name: 'Primary Dealers (Market Makers)',
      stackgroup: 'one',
      mode: 'none',
      fillcolor: '#ef4444', // Red
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    title: { text: 'Bidder Composition (%)', font: { color: textColor } },
    yaxis: { 
      title: { text: '% of Accepted Bids' }, 
      range: [0, 100], 
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
    <div className="w-full">
      <div className="flex space-x-2 mb-4 justify-end">
        {TIMEFRAMES.map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe(tf)}
            className="text-xs"
          >
            {tf.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="h-[400px]">
        {loading ? (
          <ChartSkeleton type="area" className="h-full" />
        ) : (
          <Plot
            data={plotData}
            layout={layout}
            config={{ responsive: true, displayModeBar: false }}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}

