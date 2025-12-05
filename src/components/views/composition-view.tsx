'use client';

/**
 * Composition View
 * 
 * Sankey diagram showing debt ownership flow.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SankeyChart } from '@/components/charts/sankey-chart';

export function CompositionView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-50">
          Debt Composition & Ownership
        </h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm mt-1">
          Flow of Liabilities (Treasury) to Assets (Holders). Data: Treasury TIC & Fed Z.1.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <SankeyChart />
        </CardContent>
      </Card>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">The Federal Reserve (QT Effect)</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Fed holdings have dropped to <strong>$4.19T</strong> (down from &gt;$8T peak). 
              The Fed is no longer the primary buyer, forcing private markets to absorb supply.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Foreign Official (Central Banks)</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              <strong>Japan ($1.15T)</strong> and <strong>China ($730B)</strong> remain largest 
              holders, but China&apos;s share is at multi-decade lows.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Stablecoins (New Demand)</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Total Market Cap is <strong>$307B</strong>. Stablecoin issuers (Tether/Circle) are 
              now estimated to hold ~$155B in direct T-Bills, exceeding many G20 nations.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

