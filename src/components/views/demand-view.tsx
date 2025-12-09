'use client';

/**
 * Demand View - Bloomberg Terminal 2.0
 *
 * Auction demand analysis with bid-to-cover ratios,
 * bidder composition, and market sentiment indicators.
 */

import { DataPanel, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { DemandChart } from '@/components/charts/demand-chart';
import { BidderChart } from '@/components/charts/bidder-chart';

export function DemandView() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              AUCTION DEMAND MONITOR
            </h2>
            <StatusBadge status="live" />
          </div>
          <p className="text-xs text-muted-foreground">
            Real-time bid-to-cover ratios and bidder composition from Treasury auctions
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="terminal">SOURCE: TREASURY AUCTIONS API</Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Explainer Panel */}
        <Card variant="terminal" className="lg:row-span-2">
          <CardHeader>
            <CardTitle>Bid-to-Cover Explained</CardTitle>
            <CardDescription>Market appetite indicator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Think of a Treasury auction like selling concert tickets. The government offers
              a set amount of debt (e.g., $50B). The ratio shows demand vs supply.
            </p>

            {/* Zone indicators */}
            <div className="space-y-3">
              <div className="p-3 rounded bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-green-500">STRONG (≥2.5x)</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Investors offered $2.50+ for every $1 of debt. High confidence.
                </p>
              </div>

              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-medium text-amber-500">ADEQUATE (2.0-2.5x)</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Normal demand levels. Market is functional.
                </p>
              </div>

              <div className="p-3 rounded bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-medium text-red-500">WEAK (&lt;2.0x)</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Barely enough buyers. Risk of failed auction or price concession.
                </p>
              </div>
            </div>

            {/* Key insight */}
            <div className="pt-3 border-t border-border">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Key Insight
              </div>
              <p className="text-xs text-foreground">
                A ratio below 2.0x indicates potential stress in the Treasury market.
                Watch for trends, not single auctions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bid-to-Cover Chart */}
        <DataPanel
          title="Bid-to-Cover Ratio Timeline"
          subtitle="All security types"
          status="live"
          className="lg:col-span-3"
        >
          <DemandChart />
        </DataPanel>

        {/* Bidder Composition Chart */}
        <DataPanel
          title="Bidder Composition Analysis"
          subtitle="Who is buying the debt?"
          status="live"
          className="lg:col-span-3"
        >
          <div className="mb-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-muted-foreground">Indirect (Foreign/Funds)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-muted-foreground">Direct (Domestic)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-muted-foreground">Primary Dealers</span>
            </div>
          </div>
          <BidderChart />
        </DataPanel>
      </div>

      {/* Bottom Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="success">POSITIVE</Badge>
              <CardTitle>Indirect Bidders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="leading-relaxed">
              Foreign central banks and large institutions. High indirect participation
              signals <span className="font-mono text-green-500">global confidence</span> in
              US Treasuries as a safe haven asset.
            </CardDescription>
          </CardContent>
        </Card>

        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="default">NEUTRAL</Badge>
              <CardTitle>Direct Bidders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="leading-relaxed">
              Domestic money market funds, banks, and institutions. Reflects
              <span className="font-mono text-foreground"> domestic demand</span> and
              portfolio allocation decisions.
            </CardDescription>
          </CardContent>
        </Card>

        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="warning">WATCH</Badge>
              <CardTitle>Primary Dealers</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="leading-relaxed">
              Required to bid at auctions. High dealer takedowns suggest
              <span className="font-mono text-red-500"> weak organic demand</span>. Watch
              for sustained elevation above 20%.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
