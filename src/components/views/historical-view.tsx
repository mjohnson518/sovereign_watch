'use client';

/**
 * Historical View
 * 
 * 50-year debt composition history.
 */

import { Card, CardContent } from '@/components/ui/card';
import { HistoricalChart } from '@/components/charts/historical-chart';

export function HistoricalView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-50">
          50-Year Debt Composition
        </h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm mt-1">
          Data Source: FRED (Federal Reserve Economic Data) Annual Checkpoints (1980-2025).
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <HistoricalChart />
        </CardContent>
      </Card>
    </div>
  );
}

