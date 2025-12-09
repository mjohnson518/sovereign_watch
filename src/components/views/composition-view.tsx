'use client';

/**
 * Composition View - Bloomberg Terminal 2.0
 *
 * Sankey diagram showing debt ownership flow with
 * detailed breakdown of holder categories.
 */

import { DataPanel, Card, CardContent, CardHeader, CardTitle, CardDescription, MetricCard } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { SankeyChart } from '@/components/charts/sankey-chart';

export function CompositionView() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              DEBT OWNERSHIP COMPOSITION
            </h2>
            <StatusBadge status="live" />
          </div>
          <p className="text-xs text-muted-foreground">
            Flow of Treasury liabilities to holder categories - TIC & Fed Z.1 Reports
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="secondary">Q3 2024 DATA</Badge>
          <Badge variant="terminal">SOURCE: TIC / FED Z.1</Badge>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Federal Reserve"
          value="$4.19T"
          color="blue"
          delta="-$95B QT"
          deltaType="negative"
        />
        <MetricCard
          label="Foreign Holdings"
          value="$8.5T"
          color="amber"
          delta="-2.1% YoY"
          deltaType="negative"
        />
        <MetricCard
          label="Domestic Private"
          value="$12.8T"
          color="green"
          delta="+8.2% YoY"
          deltaType="positive"
        />
        <MetricCard
          label="Stablecoin Reserve"
          value="$155B"
          color="purple"
          delta="+45% YoY"
          deltaType="positive"
        />
      </div>

      {/* Main Sankey Chart */}
      <DataPanel
        title="Ownership Flow Diagram"
        subtitle="Treasury liabilities to holder categories"
        status="live"
      >
        <SankeyChart />
      </DataPanel>

      {/* Detailed Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="terminal" glow="blue">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="default">FED</Badge>
              <CardTitle>Federal Reserve (QT)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="leading-relaxed">
              Fed holdings have dropped to <span className="font-mono text-primary">$4.19T</span> from
              peak of $8T+. Quantitative Tightening continues at ~$60B/month.
            </CardDescription>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Peak Holdings (2022)</span>
                <span className="font-mono">$8.5T</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Current Holdings</span>
                <span className="font-mono text-primary">$4.19T</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">QT Pace</span>
                <span className="font-mono text-red-500">-$60B/mo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="terminal" glow="amber">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="warning">WATCH</Badge>
              <CardTitle>Foreign Official</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="leading-relaxed">
              Foreign central bank holdings are declining as a share of total debt.
              Key holders diversifying away from Treasuries.
            </CardDescription>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Japan (Largest)</span>
                <span className="font-mono">$1.15T</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">China</span>
                <span className="font-mono text-amber-500">$730B ↓</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">UK</span>
                <span className="font-mono">$723B</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="terminal" glow="green">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="success">GROWTH</Badge>
              <CardTitle>Stablecoin Issuers</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="leading-relaxed">
              Stablecoin issuers now hold <span className="font-mono text-green-500">~$155B</span> in
              T-Bills, making them larger than many G20 nations.
            </CardDescription>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Tether (USDT)</span>
                <span className="font-mono">~$95B</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Circle (USDC)</span>
                <span className="font-mono">~$45B</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Total Market Cap</span>
                <span className="font-mono text-green-500">$307B</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
