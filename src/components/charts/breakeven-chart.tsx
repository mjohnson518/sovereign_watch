'use client';

/**
 * Breakeven Inflation Chart
 * 
 * Displays 10Y Breakeven Inflation Rate (Market Expectations).
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/providers/theme-provider';
import { ChartSkeleton } from './chart-skeleton';
import { Button } from '@/components/ui/button';

const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => <ChartSkeleton type="line" className="h-[400px]" />
});

const TIMEFRAMES = ['1y', '3y', '5y'] as const;
type Timeframe = typeof TIMEFRAMES[number];

export function BreakevenChart() {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState<Timeframe>('1y');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/health/history?timeframe=${timeframe}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
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

  const plotData: Plotly.Data[] = [
    {
      x: data.map(d => d.date),
      y: data.map(d => d.breakeven10y),
      name: '10Y Inflation Expectation',
      type: 'scatter',
      mode: 'lines',
      fill: 'tozeroy', // Fill area
      line: { color: '#f59e0b', width: 2 },
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    title: { text: 'Market Inflation Expectations (10Y Breakeven)', font: { color: textColor } },
    yaxis: { 
      title: { text: 'Rate (%)' }, 
      color: textColor, 
      gridcolor: gridColor 
    },
    xaxis: { 
      color: textColor, 
      gridcolor: gridColor 
    },
    margin: { t: 40, b: 40, l: 60, r: 20 },
    legend: { orientation: 'h', y: 1.1, font: { color: textColor } },
    paper_bgcolor: bgColor,
    plot_bgcolor: bgColor,
    shapes: [
      { // 2% Target Line
        type: 'line',
        xref: 'paper', x0: 0, x1: 1,
        yref: 'y', y0: 2.0, y1: 2.0,
        line: { color: isDark ? '#ef4444' : '#ef4444', width: 1, dash: 'dot' }
      }
    ]
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
        {loading ? <ChartSkeleton type="line" className="h-full" /> : 
          <Plot data={plotData} layout={layout} config={{ responsive: true, displayModeBar: false }} className="w-full h-full" />
        }
      </div>
    </div>
  );
}

