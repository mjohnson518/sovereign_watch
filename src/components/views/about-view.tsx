'use client';

/**
 * About View - Bloomberg Terminal 2.0
 *
 * Project information, methodology, and disclaimers
 * with professional terminal styling.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription, DataPanel } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AboutView() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
            <span className="font-mono text-primary font-bold text-xl">SW</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          SOVEREIGN<span className="text-primary">WATCH</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Next-generation real-time analytics terminal for monitoring the fiscal health,
          debt composition, and sustainability of the United States Treasury.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Badge variant="terminal">v2.0.0</Badge>
          <Badge variant="default">BLOOMBERG TERMINAL</Badge>
        </div>
      </div>

      {/* Mission */}
      <DataPanel title="Mission Statement" status="static">
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <p>
            Sovereign debt is the bedrock of the global financial system. Yet, the data
            surrounding it is often fragmented, delayed, or buried in PDF reports.
          </p>
          <p>
            <span className="font-mono text-foreground">SOVEREIGN WATCH</span> aims to democratize
            this data by providing institutional-grade visualizations for everyone — investors,
            policymakers, researchers, and citizens.
          </p>
          <p>
            We believe understanding the "plumbing of finance" — from auction demand to maturity
            walls — is critical for navigating an increasingly complex fiscal landscape.
          </p>
        </div>
      </DataPanel>

      {/* Methodology */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="default">DATA</Badge>
              <CardTitle>Ingestion Engine</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p>
              Data is ingested daily from the US Treasury Fiscal Data API. We clean, normalize,
              and cross-reference raw data against historical baselines.
            </p>
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span>Update Frequency</span>
                <span className="font-mono text-foreground">Daily (T+1)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Data Retention</span>
                <span className="font-mono text-foreground">50+ Years</span>
              </div>
              <div className="flex items-center justify-between">
                <span>API Latency</span>
                <span className="font-mono text-green-500">&lt;200ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="default">ACCURACY</Badge>
              <CardTitle>Data Sources</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><span className="font-mono text-foreground">Total Debt:</span> Updated Daily (Live API)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><span className="font-mono text-foreground">Auctions:</span> Updated as they occur (Live)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><span className="font-mono text-foreground">Ownership:</span> Monthly/Quarterly (TIC & Z.1)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><span className="font-mono text-foreground">GDP Ratios:</span> Latest BEA release</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Tech Stack */}
      <Card variant="terminal">
        <CardHeader>
          <CardTitle>Technical Architecture</CardTitle>
          <CardDescription>Production-grade infrastructure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TechItem label="Frontend" items={['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS']} />
            <TechItem label="Visualization" items={['Plotly.js', 'Recharts', 'D3 Sankey']} />
            <TechItem label="Backend" items={['API Routes', 'Server Actions', 'Drizzle ORM', 'PostgreSQL']} />
            <TechItem label="AI" items={['Vercel AI SDK', 'Google Gemini', 'Streaming']} />
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card variant="terminal" className="border-red-500/30 bg-red-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <CardTitle className="text-red-500">Legal Disclaimer</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed">
          <p className="mb-2">
            <span className="font-mono text-red-400">NOT FINANCIAL ADVICE.</span> This application is
            for informational and educational purposes only.
          </p>
          <p className="mb-2">
            While we strive for accuracy, data from external APIs may be delayed or subject to revision.
            Do not make investment decisions based solely on this dashboard.
          </p>
          <p>
            Sovereign Watch is not affiliated with the US Department of the Treasury, the Federal
            Reserve, or any government agency.
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-6 text-[10px] text-muted-foreground/60 space-y-1">
        <p>&copy; {new Date().getFullYear()} Sovereign Watch. Open Source.</p>
        <p className="font-mono">BLOOMBERG TERMINAL 2.0 DESIGN SYSTEM</p>
      </div>
    </div>
  );
}

function TechItem({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item} className="text-xs font-mono text-foreground bg-muted/50 px-2 py-1 rounded">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
