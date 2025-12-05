'use client';

/**
 * About View
 * 
 * Project information, methodology, and disclaimers.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function AboutView() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-zinc-50">
          About Sovereign Watch
        </h1>
        <p className="text-lg text-stone-600 dark:text-zinc-400 max-w-2xl mx-auto">
          A real-time analytical terminal for monitoring the fiscal health, debt composition, and sustainability of the United States Government.
        </p>
      </div>

      {/* Mission */}
      <Card>
        <CardHeader>
          <CardTitle>Mission</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-stone-600 dark:text-zinc-400 space-y-4">
          <p>
            Sovereign debt is the bedrock of the global financial system. Yet, the data surrounding it is often fragmented, delayed, or buried in PDF reports. 
            <strong>Sovereign Watch</strong> aims to democratize this data by providing institutional-grade visualizations for everyone.
          </p>
          <p>
            We believe that understanding the "Plumbing of Finance" - from auction demand to maturity walls—is critical for investors, policymakers, and citizens alike.
          </p>
        </CardContent>
      </Card>

      {/* Methodology */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-stone-600 dark:text-zinc-400">
            <div>
              <h4 className="font-bold text-stone-900 dark:text-zinc-200">Ingestion Engine</h4>
              <p>
                Data is ingested daily from the US Treasury Fiscal Data API. We clean, normalize, and cross-reference this raw data against historical baselines.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-bold text-stone-900 dark:text-zinc-200">Real-Time vs. Estimates</h4>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>Total Debt:</strong> Updated Daily (Live).</li>
                <li><strong>Auctions:</strong> Updated as they occur (Live).</li>
                <li><strong>Ownership:</strong> Monthly/Quarterly snapshots (TIC & Z.1 reports).</li>
                <li><strong>GDP Ratios:</strong> Based on latest official BEA release.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-stone-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Frontend</span>
              <span className="font-mono text-xs bg-stone-100 dark:bg-zinc-800 px-2 py-1 rounded">Next.js 14+ (App Router)</span>
            </div>
            <div className="flex justify-between">
              <span>Styling</span>
              <span className="font-mono text-xs bg-stone-100 dark:bg-zinc-800 px-2 py-1 rounded">Tailwind CSS + Shadcn/UI</span>
            </div>
            <div className="flex justify-between">
              <span>Visualization</span>
              <span className="font-mono text-xs bg-stone-100 dark:bg-zinc-800 px-2 py-1 rounded">Plotly.js</span>
            </div>
            <div className="flex justify-between">
              <span>Intelligence</span>
              <span className="font-mono text-xs bg-stone-100 dark:bg-zinc-800 px-2 py-1 rounded">Google Gemini Pro</span>
            </div>
            <div className="flex justify-between">
              <span>Database</span>
              <span className="font-mono text-xs bg-stone-100 dark:bg-zinc-800 px-2 py-1 rounded">PostgreSQL (Drizzle ORM)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-400 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
          <p>
            <strong>Not Financial Advice.</strong> This application is for informational and educational purposes only. 
            While we strive for accuracy, data from external APIs may be delayed or subject to revision. 
            Do not make investment decisions based solely on this dashboard. 
            Sovereign Watch is not affiliated with the US Department of the Treasury or the Federal Reserve.
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-stone-400 dark:text-zinc-600 pb-8">
        <p>&copy; {new Date().getFullYear()} Sovereign Watch. Open Source.</p>
      </div>
    </div>
  );
}

