'use client';

/**
 * Inflation & Yields View - Bloomberg Terminal 2.0
 *
 * Real yields, nominal yields, and inflation expectations
 * with professional charting and analysis.
 */

import { DataPanel, Card, CardContent, CardHeader, CardTitle, CardDescription, MetricCard } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { RealYieldChart } from '@/components/charts/real-yield-chart';
import { BreakevenChart } from '@/components/charts/breakeven-chart';

export function InflationView() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              YIELDS & INFLATION MONITOR
            </h2>
            <StatusBadge status="live" />
          </div>
          <p className="text-xs text-muted-foreground">
            Real yields, nominal yields, and market-implied inflation expectations
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="terminal">SOURCE: TREASURY YIELD CURVES</Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="10Y Nominal Yield"
          value="4.28%"
          color="blue"
          delta="+2bps"
          deltaType="negative"
        />
        <MetricCard
          label="10Y Real Yield (TIPS)"
          value="1.92%"
          color="green"
          delta="+5bps"
          deltaType="negative"
        />
        <MetricCard
          label="10Y Breakeven"
          value="2.36%"
          color="amber"
          delta="-3bps"
          deltaType="positive"
        />
        <MetricCard
          label="Fed Funds Target"
          value="4.25-4.50%"
          color="purple"
          delta="HOLD"
          deltaType="neutral"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Real Yields Chart */}
        <DataPanel
          title="Nominal vs Real Yield Curves"
          subtitle="Treasury yields across the curve"
          status="live"
        >
          <div className="mb-4 flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-primary" />
              <span className="text-muted-foreground">Nominal (Treasury)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-500" />
              <span className="text-muted-foreground">Real (TIPS)</span>
            </div>
          </div>
          <RealYieldChart />
        </DataPanel>

        {/* Breakeven Chart */}
        <DataPanel
          title="Inflation Breakeven Rates"
          subtitle="Market-implied inflation expectations"
          status="live"
        >
          <BreakevenChart />
        </DataPanel>
      </div>

      {/* Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="default">CONCEPT</Badge>
              <CardTitle>Understanding Real Yields</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="leading-relaxed">
              <span className="font-mono text-primary">Nominal yields</span> are the headline rates you see quoted.
              <span className="font-mono text-green-500"> Real yields</span> (TIPS) are adjusted for inflation.
            </CardDescription>
            <div className="p-3 bg-muted/30 rounded text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">Positive Real Yield</span>
                <span className="text-muted-foreground">→ Tighter financial conditions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500">Negative Real Yield</span>
                <span className="text-muted-foreground">→ Stimulative conditions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="default">CONCEPT</Badge>
              <CardTitle>Breakeven Inflation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="leading-relaxed">
              The <span className="font-mono text-amber-500">breakeven</span> is the difference between
              nominal and real yields. It represents what the bond market expects inflation to
              average over that time period.
            </CardDescription>
            <div className="p-3 bg-muted/30 rounded text-xs">
              <div className="font-mono text-foreground mb-1">
                Breakeven = Nominal - Real
              </div>
              <div className="text-muted-foreground">
                Example: 4.28% - 1.92% = 2.36% expected inflation
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Commentary */}
      <Card variant="terminal">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="warning">ANALYSIS</Badge>
            <CardTitle>Current Market Conditions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Yield Curve Shape
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The curve remains relatively flat with the 2Y-10Y spread near zero.
                Historically, inversion precedes recessions by 12-18 months.
              </p>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Real Rates
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Positive real rates across the curve indicate restrictive monetary policy.
                This increases the real cost of servicing government debt.
              </p>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Inflation Expectations
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Breakevens around 2.3-2.4% suggest markets believe the Fed will keep
                inflation near target over the next decade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
