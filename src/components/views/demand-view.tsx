'use client';

/**
 * Demand View
 * 
 * Auction bid-to-cover ratios showing market appetite.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DemandChart } from '@/components/charts/demand-chart';
import { BidderChart } from '@/components/charts/bidder-chart';

export function DemandView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-50">
          Demand: The &quot;Popularity Contest&quot;
        </h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm mt-1">
          Live Bid-to-Cover Ratios and Bidder Composition from Treasury Auctions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Explainer Card */}
        <Card className="border-l-4 border-l-slate-700 dark:border-l-slate-500 h-fit">
          <CardHeader>
            <CardTitle className="text-sm">What is the &quot;Bid-to-Cover&quot; Ratio?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              Think of a Treasury Auction like selling tickets to a concert. The government 
              offers a set amount of debt tickets (e.g., $50 Billion).
            </CardDescription>
            
            <div className="bg-white dark:bg-zinc-900 p-3 rounded border text-sm space-y-3">
              <div>
                <strong>Ratio of 3.0:</strong> Investors offered $3 for every $1 of debt.
                <div className="text-green-600 dark:text-green-400 font-bold mt-1">
                  Strong Demand.
                </div>
              </div>
              <div>
                <strong>Ratio of 1.0:</strong> Barely enough buyers showed up.
                <div className="text-red-600 dark:text-red-400 font-bold mt-1">
                  Danger Zone.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Card */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <DemandChart />
          </CardContent>
        </Card>

        {/* Bidder Composition */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Bidder Composition</CardTitle>
            <CardDescription>
              Who is buying the debt? <span className="text-emerald-600 font-bold">Indirect</span> (Foreign/Central Banks) vs 
              <span className="text-blue-600 font-bold"> Direct</span> (Domestic Funds) vs 
              <span className="text-red-600 font-bold"> Primary Dealers</span> (Forced Buyers).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <BidderChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

