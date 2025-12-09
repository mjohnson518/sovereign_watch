'use client';

/**
 * Health Dashboard View
 * 
 * High-level metrics on the sustainability of the debt.
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import type { HealthMetrics } from '@/lib/types/treasury';

export function HealthView() {
  const [data, setData] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartSkeleton type="bar" className="h-[200px]" />
      <ChartSkeleton type="bar" className="h-[200px]" />
    </div>;
  }

  if (!data) return <div className="text-red-500">Failed to load health metrics.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-50">
          Sovereign Health Dashboard
        </h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm mt-1">
          Key sustainability metrics indicating the fiscal health of the United States.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Interest Expense Card */}
        <Card className="border-t-4 border-t-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500 dark:text-zinc-400">
              Annualized Interest Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900 dark:text-zinc-50">
              ${(data.interestExpense! / 1e9).toFixed(0)} Billion
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Cost to service the debt. Now exceeds Defense spending.
            </p>
          </CardContent>
        </Card>

        {/* Debt to GDP Card */}
        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500 dark:text-zinc-400">
              Debt-to-GDP Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900 dark:text-zinc-50">
              {data.debtToGdp!.toFixed(1)}%
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Measures ability to pay. &gt;100% indicates potential drag on growth.
            </p>
          </CardContent>
        </Card>

        {/* Average Interest Rate */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500 dark:text-zinc-400">
              Avg. Interest Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900 dark:text-zinc-50">
              {data.averageInterestRate!.toFixed(2)}%
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Weighted average cost. Rising as old debt matures.
            </p>
          </CardContent>
        </Card>

        {/* Yield Curve */}
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500 dark:text-zinc-400">
              Yield Curve (10Y-2Y)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.yieldCurveSpread! < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {data.yieldCurveSpread!.toFixed(2)}%
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {data.yieldCurveSpread! < 0 ? 'Inverted (Recession Signal)' : 'Normal (Growth Signal)'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Context Block */}
      <Card className="bg-stone-50 dark:bg-zinc-900 border-none">
        <CardContent className="p-6">
          <h3 className="font-bold mb-2">Why do these metrics matter?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-stone-600 dark:text-zinc-400">
            <div>
              <strong className="text-stone-900 dark:text-zinc-200">Interest Expense:</strong> Unlike the total debt number, this is the cash flow impact. As rates rise, this number compounds, potentially crowding out other government spending.
            </div>
            <div>
              <strong className="text-stone-900 dark:text-zinc-200">Debt-to-GDP:</strong> A country can handle high debt if its economy grows faster. If this ratio is rising, debt is growing faster than the ability to pay it back.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

