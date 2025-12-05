'use client';

/**
 * Sources View
 * 
 * Information about data sources and API architecture.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SourcesView() {
  return (
    <div className="space-y-6">
      {/* Architecture Overview */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-6 rounded-lg">
        <h2 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">
          Live Data Architecture
        </h2>
        <p className="text-blue-800 dark:text-blue-300 text-sm">
          The charts above are powered by the following real-time and static sources.
        </p>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-700 dark:text-slate-300">
                1. Fiscal Data API (Live)
              </CardTitle>
              <Badge variant="default" className="bg-green-500">Connected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-3">
              Used for Total Debt, Maturity Breakdown, and Auction Demand.
            </CardDescription>
            <code className="block bg-stone-100 dark:bg-zinc-800 p-2 text-xs rounded font-mono">
              api.fiscaldata.treasury.gov
            </code>
            <div className="mt-3 text-xs text-stone-500 dark:text-zinc-500">
              Update Frequency: Daily
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-700 dark:text-slate-300">
                2. TIC & Fed Data (Static Snapshot)
              </CardTitle>
              <Badge variant="secondary">Static</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-3">
              Foreign Holdings (July 2025) & Fed Holdings (Nov 2025).
            </CardDescription>
            <div className="text-xs text-stone-500 dark:text-zinc-500">
              Source: Treasury.gov / FederalReserve.gov
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-emerald-600 dark:text-emerald-400">
                3. DefiLlama / CoinGecko
              </CardTitle>
              <Badge variant="secondary">Static</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-3">
              Stablecoin Market Cap (Nov 2025).
            </CardDescription>
            <div className="text-xs text-stone-500 dark:text-zinc-500">
              Value: $307 Billion
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-600 dark:text-purple-400">
                4. AI Analysis (Gemini)
              </CardTitle>
              <Badge variant="default" className="bg-purple-500">Streaming</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-3">
              Real-time macro analysis powered by Google Gemini Pro with context injection.
            </CardDescription>
            <div className="text-xs text-stone-500 dark:text-zinc-500">
              Provider: Vercel AI SDK + Google AI
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Architecture */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-stone-50 dark:bg-zinc-800 p-4 rounded">
              <h4 className="font-bold mb-2">Frontend</h4>
              <ul className="text-stone-600 dark:text-zinc-400 space-y-1">
                <li>Next.js 14+ (App Router)</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Shadcn/UI</li>
                <li>Plotly.js / Recharts</li>
              </ul>
            </div>
            <div className="bg-stone-50 dark:bg-zinc-800 p-4 rounded">
              <h4 className="font-bold mb-2">Backend</h4>
              <ul className="text-stone-600 dark:text-zinc-400 space-y-1">
                <li>Next.js API Routes</li>
                <li>Server Actions</li>
                <li>Vercel AI SDK</li>
                <li>Drizzle ORM</li>
                <li>PostgreSQL (optional)</li>
              </ul>
            </div>
            <div className="bg-stone-50 dark:bg-zinc-800 p-4 rounded">
              <h4 className="font-bold mb-2">Data Pipeline</h4>
              <ul className="text-stone-600 dark:text-zinc-400 space-y-1">
                <li>ETL Ingestion Engine</li>
                <li>Data Sanitizers</li>
                <li>Server-side Aggregation</li>
                <li>Cron Jobs (Daily)</li>
                <li>Response Caching</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

