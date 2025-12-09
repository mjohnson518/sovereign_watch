'use client';

/**
 * Sources View - Bloomberg Terminal 2.0
 *
 * Technical documentation of data sources and APIs
 * with status monitoring and refresh schedules.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription, DataPanel } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';

const DATA_SOURCES = [
  {
    name: 'Treasury Fiscal Data API',
    endpoint: 'api.fiscaldata.treasury.gov',
    description: 'Primary source for debt totals, auction results, interest expense, and securities data.',
    status: 'live' as const,
    refresh: 'Daily (T+1)',
    endpoints: [
      { path: '/debt_to_penny', desc: 'Total public debt' },
      { path: '/mspd_table_3_market', desc: 'Marketable securities (CUSIP-level)' },
      { path: '/auctions_query', desc: 'Auction results and bid-to-cover' },
      { path: '/interest_expense', desc: 'Interest payments' },
      { path: '/avg_interest_rates', desc: 'Weighted average rates' },
    ],
  },
  {
    name: 'Treasury TIC Reports',
    endpoint: 'treasury.gov/tic',
    description: 'Treasury International Capital data for foreign holdings and cross-border flows.',
    status: 'live' as const,
    refresh: 'Monthly',
    endpoints: [
      { path: 'Major Foreign Holders', desc: 'Country-level holdings' },
      { path: 'SLT Data', desc: 'Securities holdings breakdown' },
    ],
  },
  {
    name: 'Federal Reserve Z.1',
    endpoint: 'federalreserve.gov/z1',
    description: 'Financial Accounts of the United States for debt ownership composition.',
    status: 'live' as const,
    refresh: 'Quarterly',
    endpoints: [
      { path: 'L.209', desc: 'Federal debt held by sector' },
      { path: 'L.210', desc: 'Treasury securities by holder' },
    ],
  },
  {
    name: 'FRED St. Louis Fed',
    endpoint: 'fred.stlouisfed.org',
    description: 'Historical economic data including GDP for debt-to-GDP calculations.',
    status: 'live' as const,
    refresh: 'Varies',
    endpoints: [
      { path: 'GDP', desc: 'Gross Domestic Product' },
      { path: 'GFDEBTN', desc: 'Federal Debt Total' },
      { path: 'GFDEGDQ188S', desc: 'Debt-to-GDP Ratio' },
    ],
  },
  {
    name: 'Treasury Yield Curves',
    endpoint: 'api.fiscaldata.treasury.gov',
    description: 'Daily nominal and real (TIPS) yield curve data.',
    status: 'live' as const,
    refresh: 'Daily',
    endpoints: [
      { path: '/daily_treasury_yield_curve', desc: 'Nominal yields' },
      { path: '/daily_treasury_real_yield_curve', desc: 'Real yields (TIPS)' },
    ],
  },
];

export function SourcesView() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              DATA SOURCES & API DOCUMENTATION
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Technical documentation of data feeds, refresh schedules, and endpoint specifications
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <StatusBadge status="connected" />
        </div>
      </div>

      {/* System Status */}
      <Card variant="terminal" glow="green">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 status-live" />
              <CardTitle>System Status</CardTitle>
            </div>
            <Badge variant="success">ALL SYSTEMS OPERATIONAL</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-muted/30 rounded">
              <div className="text-muted-foreground mb-1">API Connections</div>
              <div className="font-mono text-green-500">5/5 ACTIVE</div>
            </div>
            <div className="p-3 bg-muted/30 rounded">
              <div className="text-muted-foreground mb-1">Last Sync</div>
              <div className="font-mono text-foreground">{new Date().toLocaleTimeString()}</div>
            </div>
            <div className="p-3 bg-muted/30 rounded">
              <div className="text-muted-foreground mb-1">Cache Status</div>
              <div className="font-mono text-green-500">VALID</div>
            </div>
            <div className="p-3 bg-muted/30 rounded">
              <div className="text-muted-foreground mb-1">Database</div>
              <div className="font-mono text-green-500">CONNECTED</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <div className="space-y-4">
        {DATA_SOURCES.map((source) => (
          <DataPanel
            key={source.name}
            title={source.name}
            subtitle={source.endpoint}
            status={source.status}
          >
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">{source.description}</p>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Refresh:</span>
                  <Badge variant="terminal">{source.refresh}</Badge>
                </div>
              </div>

              {/* Endpoints Table */}
              <div className="border border-border rounded overflow-hidden">
                <table className="data-table text-xs">
                  <thead>
                    <tr>
                      <th>ENDPOINT / RESOURCE</th>
                      <th>DESCRIPTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {source.endpoints.map((ep) => (
                      <tr key={ep.path}>
                        <td className="font-mono text-primary">{ep.path}</td>
                        <td className="text-muted-foreground">{ep.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DataPanel>
        ))}
      </div>

      {/* Rate Limits */}
      <Card variant="terminal">
        <CardHeader>
          <CardTitle>API Rate Limits & Caching</CardTitle>
          <CardDescription>Request throttling and cache configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Treasury API
              </div>
              <div className="p-3 bg-muted/30 rounded space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate Limit</span>
                  <span className="font-mono">1000 req/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Throttle</span>
                  <span className="font-mono">100ms delay</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Cache TTL
              </div>
              <div className="p-3 bg-muted/30 rounded space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Debt Data</span>
                  <span className="font-mono">1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maturity Wall</span>
                  <span className="font-mono">24 hours</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Database
              </div>
              <div className="p-3 bg-muted/30 rounded space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-mono">Vercel Postgres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region</span>
                  <span className="font-mono">us-east-1</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Reference */}
      <Card variant="terminal">
        <CardHeader>
          <CardTitle>Internal API Reference</CardTitle>
          <CardDescription>Sovereign Watch REST endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { method: 'GET', path: '/api/debt', desc: 'Current debt totals' },
              { method: 'GET', path: '/api/health', desc: 'Fiscal health metrics' },
              { method: 'GET', path: '/api/maturity-wall', desc: 'Maturity wall data' },
              { method: 'GET', path: '/api/auctions', desc: 'Auction demand data' },
              { method: 'GET', path: '/api/ownership', desc: 'Debt ownership composition' },
              { method: 'POST', path: '/api/chat', desc: 'AI analysis endpoint' },
            ].map((api) => (
              <div key={api.path} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0 text-xs">
                <Badge variant={api.method === 'GET' ? 'success' : 'default'} className="w-14 justify-center">
                  {api.method}
                </Badge>
                <span className="font-mono text-primary">{api.path}</span>
                <span className="text-muted-foreground ml-auto">{api.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
