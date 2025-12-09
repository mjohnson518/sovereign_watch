'use client';

/**
 * Header Ticker Component - Bloomberg Terminal 2.0
 *
 * Professional financial terminal header with real-time data ticker,
 * status indicators, and system time display.
 */

import { useEffect, useState } from 'react';

interface DebtData {
  totalDebt: number;
  totalDebtFormatted: string;
  lastUpdated: string;
}

interface TickerItem {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  live?: boolean;
}

export function Header() {
  const [debtData, setDebtData] = useState<DebtData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    async function fetchDebt() {
      try {
        const res = await fetch('/api/debt');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setDebtData(data);
      } catch (e) {
        console.error('Failed to fetch debt:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchDebt();
  }, []);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tickerItems: TickerItem[] = [
    {
      label: 'US TOTAL DEBT',
      value: loading ? '---' : error ? 'OFFLINE' : debtData?.totalDebtFormatted || '---',
      live: !error && !loading,
    },
    {
      label: 'FED HOLDINGS',
      value: '$4.19T',
      change: '-$95B QT',
      changeType: 'negative',
    },
    {
      label: 'STABLECOIN MKT',
      value: '$307B',
      change: '+$12B',
      changeType: 'positive',
    },
    {
      label: '10Y YIELD',
      value: '4.28%',
      change: '+2bps',
      changeType: 'negative',
    },
    {
      label: '2Y YIELD',
      value: '4.15%',
      change: '-1bp',
      changeType: 'positive',
    },
    {
      label: 'DXY',
      value: '106.42',
      change: '+0.12%',
      changeType: 'positive',
    },
  ];

  return (
    <header className="bg-card border-b border-border h-12 flex items-center shrink-0 relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Left section - Logo/Brand mark */}
      <div className="flex items-center gap-3 px-4 h-full border-r border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary status-live" />
          <span className="font-mono text-[10px] font-semibold tracking-widest text-muted-foreground">
            SVGN
          </span>
        </div>
      </div>

      {/* Ticker Section */}
      <div className="flex-1 flex items-center overflow-hidden">
        <div className="flex items-center gap-6 px-4 ticker-scroll whitespace-nowrap">
          {/* Duplicate for seamless scroll */}
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <TickerItemDisplay key={`${item.label}-${index}`} item={item} />
          ))}
        </div>
      </div>

      {/* Right section - System info */}
      <div className="flex items-center gap-4 px-4 h-full border-l border-border bg-muted/30">
        {/* API Status */}
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-destructive' : 'bg-green-500 status-live'}`} />
          <span className="font-mono text-[10px] text-muted-foreground">
            {error ? 'OFFLINE' : 'LIVE'}
          </span>
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-border" />

        {/* Current Time */}
        <div className="font-mono text-xs tabular-nums text-foreground">
          {currentTime}
          <span className="text-muted-foreground ml-1 text-[10px]">UTC-5</span>
        </div>
      </div>
    </header>
  );
}

function TickerItemDisplay({ item }: { item: TickerItem }) {
  return (
    <div className="flex items-center gap-2">
      {/* Live indicator */}
      {item.live && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary blink" />
      )}

      {/* Label */}
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {item.label}
      </span>

      {/* Value */}
      <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
        {item.value}
      </span>

      {/* Change indicator */}
      {item.change && (
        <span className={`font-mono text-[10px] tabular-nums ${
          item.changeType === 'positive'
            ? 'text-green-500'
            : item.changeType === 'negative'
            ? 'text-red-500'
            : 'text-muted-foreground'
        }`}>
          {item.change}
        </span>
      )}

      {/* Separator dot */}
      <span className="text-border mx-2">•</span>
    </div>
  );
}
