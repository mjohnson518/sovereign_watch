'use client';

/**
 * Health Dashboard View - Bloomberg Terminal 2.0
 *
 * Primary command center displaying critical sovereign debt metrics
 * with real-time indicators and professional data visualization.
 */

import { useEffect, useState } from 'react';
import { MetricCard, DataPanel, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import type { HealthMetrics } from '@/lib/types/treasury';

export function HealthView() {
  const [data, setData] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError(true);
        }
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <ViewHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="metric-card h-28 skeleton-shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton type="bar" className="h-[200px]" />
          <ChartSkeleton type="bar" className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <ViewHeader />
        <Card variant="terminal" className="border-destructive/50">
          <CardContent className="p-8 text-center">
            <div className="text-destructive mb-2 font-mono">ERROR: FAILED TO LOAD METRICS</div>
            <p className="text-muted-foreground text-sm">Unable to fetch health data from the Treasury API.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90"
            >
              RETRY CONNECTION
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine status colors based on thresholds
  const interestStatus = data.interestExpense! > 1000e9 ? 'red' : data.interestExpense! > 800e9 ? 'amber' : 'green';
  const debtGdpStatus = data.debtToGdp! > 120 ? 'red' : data.debtToGdp! > 100 ? 'amber' : 'green';
  const rateStatus = data.averageInterestRate! > 3.5 ? 'red' : data.averageInterestRate! > 3 ? 'amber' : 'blue';
  const yieldCurveStatus = data.yieldCurveSpread! < 0 ? 'red' : data.yieldCurveSpread! < 0.5 ? 'amber' : 'green';

  return (
    <div className="space-y-6 animate-fade-in">
      <ViewHeader />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Interest Expense */}
        <MetricCard
          label="Interest Expense (Annual)"
          value={`$${(data.interestExpense! / 1e9).toFixed(0)}B`}
          color={interestStatus}
          delta="YoY +18%"
          deltaType="negative"
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Debt-to-GDP */}
        <MetricCard
          label="Debt-to-GDP Ratio"
          value={`${data.debtToGdp!.toFixed(1)}%`}
          color={debtGdpStatus}
          delta="5Y +23%"
          deltaType="negative"
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        {/* Average Interest Rate */}
        <MetricCard
          label="Weighted Avg Rate"
          value={`${data.averageInterestRate!.toFixed(2)}%`}
          color={rateStatus}
          delta="vs 2020: +1.8%"
          deltaType="negative"
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />

        {/* Yield Curve Spread */}
        <MetricCard
          label="Yield Curve (10Y-2Y)"
          value={`${data.yieldCurveSpread! >= 0 ? '+' : ''}${data.yieldCurveSpread!.toFixed(2)}%`}
          color={yieldCurveStatus}
          delta={data.yieldCurveSpread! < 0 ? 'INVERTED' : 'NORMAL'}
          deltaType={data.yieldCurveSpread! < 0 ? 'negative' : 'positive'}
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
        />
      </div>

      {/* Secondary Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interest Expense Analysis */}
        <DataPanel
          title="Interest Cost Analysis"
          subtitle="Federal Budget Impact"
          status="live"
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground text-xs">Annualized Interest</span>
              <span className="font-mono text-foreground">${(data.interestExpense! / 1e9).toFixed(0)}B</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground text-xs">vs Defense Budget</span>
              <span className="font-mono text-red-500">EXCEEDED (+$100B)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground text-xs">Daily Cost</span>
              <span className="font-mono text-foreground">${((data.interestExpense! / 365) / 1e9).toFixed(2)}B</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-xs">Per Capita (Annual)</span>
              <span className="font-mono text-foreground">${((data.interestExpense! / 335e6)).toFixed(0)}</span>
            </div>

            {/* Visual Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>% OF FEDERAL REVENUE</span>
                <span className="font-mono">~18%</span>
              </div>
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-amber-500" style={{ width: '18%' }} />
              </div>
            </div>
          </div>
        </DataPanel>

        {/* Key Thresholds */}
        <DataPanel
          title="Risk Thresholds"
          subtitle="Warning Indicators"
          status="static"
        >
          <div className="space-y-3">
            <ThresholdIndicator
              label="Debt/GDP Critical"
              threshold="130%"
              current={data.debtToGdp!}
              unit="%"
              criticalAt={130}
              warningAt={100}
            />
            <ThresholdIndicator
              label="Interest/Revenue"
              threshold="25%"
              current={18}
              unit="%"
              criticalAt={25}
              warningAt={15}
            />
            <ThresholdIndicator
              label="Yield Curve"
              threshold="0%"
              current={data.yieldCurveSpread!}
              unit="%"
              criticalAt={0}
              warningAt={0.5}
              inverted
            />
          </div>
        </DataPanel>
      </div>

      {/* Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">CRITICAL</Badge>
              <CardTitle>Interest Expense Impact</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="leading-relaxed">
              Unlike the total debt number, interest expense represents actual cash flow impact.
              As rates rise during debt refinancing, this compounds dramatically. Interest now
              exceeds Defense spending and crowds out other federal investments.
            </CardDescription>
          </CardContent>
        </Card>

        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="warning">MONITOR</Badge>
              <CardTitle>Debt Sustainability</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="leading-relaxed">
              A country can sustain high debt if GDP growth outpaces debt growth.
              When debt-to-GDP rises, debt is growing faster than ability to service it.
              The threshold of ~130% is associated with historical sovereign crises.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ViewHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            SOVEREIGN HEALTH MONITOR
          </h2>
          <StatusBadge status="live" />
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time fiscal health indicators for the United States Treasury
        </p>
      </div>
      <div className="hidden md:flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="kbd">R</span>
        <span>Refresh</span>
      </div>
    </div>
  );
}

interface ThresholdIndicatorProps {
  label: string;
  threshold: string;
  current: number;
  unit: string;
  criticalAt: number;
  warningAt: number;
  inverted?: boolean;
}

function ThresholdIndicator({
  label,
  threshold,
  current,
  unit,
  criticalAt,
  warningAt,
  inverted = false
}: ThresholdIndicatorProps) {
  const isCritical = inverted ? current < criticalAt : current >= criticalAt;
  const isWarning = inverted
    ? current >= criticalAt && current < warningAt
    : current >= warningAt && current < criticalAt;
  const isNormal = inverted ? current >= warningAt : current < warningAt;

  const status = isCritical ? 'critical' : isWarning ? 'warning' : 'normal';
  const statusColors = {
    critical: 'text-red-500 bg-red-500',
    warning: 'text-amber-500 bg-amber-500',
    normal: 'text-green-500 bg-green-500',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[status].split(' ')[1]}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-xs ${statusColors[status].split(' ')[0]}`}>
          {current.toFixed(1)}{unit}
        </span>
        <span className="text-[10px] text-muted-foreground/60">/ {threshold}</span>
      </div>
    </div>
  );
}
