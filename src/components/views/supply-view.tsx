'use client';

/**
 * Supply View
 * 
 * Maturity wall showing upcoming refinancing needs.
 */

import { Card, CardContent } from '@/components/ui/card';
import { MaturityWallChart } from '@/components/charts/maturity-wall-chart';

export function SupplyView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-50">
          Supply & Maturity Wall
        </h2>
        <p className="text-stone-500 dark:text-zinc-400 text-sm mt-1">
          Live Data from MSPD (Marketable Securities Table 3). Aggregated by Year.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <MaturityWallChart />
        </CardContent>
      </Card>
    </div>
  );
}

