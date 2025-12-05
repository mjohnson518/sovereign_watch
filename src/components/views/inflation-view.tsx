'use client';

/**
 * Inflation & Real Yields View
 * 
 * Analysis of inflation expectations and real returns.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealYieldChart } from '@/components/charts/real-yield-chart';
import { BreakevenChart } from '@/components/charts/breakeven-chart';

export function InflationView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-50">
          Inflation & Real Yields
        </h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm mt-1">
          Monitoring the market&apos;s inflation expectations and the real cost of capital.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Real Yields */}
        <Card>
          <CardHeader>
            <CardTitle>Nominal vs. Real Yields</CardTitle>
            <CardDescription>
              <span className="text-blue-500 font-bold">Nominal</span> is the headline rate. 
              <span className="text-emerald-500 font-bold"> Real</span> (TIPS) is adjusted for inflation. 
              Positive real yields restrict the economy; negative real yields stimulate it.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <RealYieldChart />
          </CardContent>
        </Card>

        {/* Breakevens */}
        <Card>
          <CardHeader>
            <CardTitle>Inflation Expectations (Breakeven)</CardTitle>
            <CardDescription>
              The difference between Nominal and Real yields. This is what the bond market *expects* inflation to average over the next 10 years.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <BreakevenChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

