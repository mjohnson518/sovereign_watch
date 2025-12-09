'use client';

/**
 * Supply View - Bloomberg Terminal 2.0
 *
 * Maturity wall visualization showing upcoming refinancing needs
 * with professional data-dense terminal aesthetic.
 */

import { DataPanel, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { MaturityWallChart } from '@/components/charts/maturity-wall-chart';

export function SupplyView() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              MATURITY WALL ANALYSIS
            </h2>
            <StatusBadge status="live" />
          </div>
          <p className="text-xs text-muted-foreground">
            Treasury securities maturing by year - MSPD Table 3 (Marketable Securities)
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="terminal">SOURCE: FISCALDATA.TREASURY.GOV</Badge>
        </div>
      </div>

      {/* Main Chart */}
      <DataPanel
        title="Debt Maturity Schedule"
        subtitle="Next 10 Years Refinancing Requirements"
        status="live"
      >
        <MaturityWallChart />
      </DataPanel>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">HIGH RISK</Badge>
              <CardTitle>2025 Maturity Spike</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="leading-relaxed">
              Over <span className="font-mono text-foreground">$8.9T</span> in debt matures in 2025,
              requiring refinancing at current elevated rates. This represents the largest
              single-year refinancing need in US history.
            </CardDescription>
          </CardContent>
        </Card>

        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="warning">WATCH</Badge>
              <CardTitle>Bills Dominance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="leading-relaxed">
              Short-term Treasury Bills represent <span className="font-mono text-foreground">~30%</span> of
              total debt, creating rollover risk. The Treasury is attempting to extend
              duration but faces market absorption limits.
            </CardDescription>
          </CardContent>
        </Card>

        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="default">INFO</Badge>
              <CardTitle>Weighted Avg Maturity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="leading-relaxed">
              Current WAM is <span className="font-mono text-foreground">~6.2 years</span>, near
              historical lows. A lower WAM means more frequent refinancing exposure to
              interest rate changes.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Legend / Key */}
      <Card variant="terminal">
        <CardHeader>
          <CardTitle>Security Type Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#94a3b8]" />
              <div>
                <div className="font-medium text-foreground">Bills</div>
                <div className="text-muted-foreground">T &lt; 1 Year</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#475569]" />
              <div>
                <div className="font-medium text-foreground">Notes</div>
                <div className="text-muted-foreground">2-10 Years</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#1e293b]" />
              <div>
                <div className="font-medium text-foreground">Bonds</div>
                <div className="text-muted-foreground">20-30 Years</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#14b8a6]" />
              <div>
                <div className="font-medium text-foreground">TIPS</div>
                <div className="text-muted-foreground">Inflation Protected</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#f59e0b]" />
              <div>
                <div className="font-medium text-foreground">FRN</div>
                <div className="text-muted-foreground">Floating Rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
