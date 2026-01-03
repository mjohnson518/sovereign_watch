'use client';

/**
 * Historical View - Bloomberg Terminal 2.0
 *
 * 50-year debt composition history with trend analysis.
 */

import { DataPanel, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HistoricalChart } from '@/components/charts/historical-chart';

export function HistoricalView() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              50-YEAR HISTORICAL ANALYSIS
            </h2>
            <Badge variant="secondary">1974-2024</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Long-term debt composition trends from FRED (Federal Reserve Economic Data)
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="terminal">SOURCE: FRED / ST. LOUIS FED</Badge>
        </div>
      </div>

      {/* Main Chart */}
      <DataPanel
        title="Debt Composition Over Time"
        subtitle="By holder category (1974-2024)"
        status="static"
      >
        <HistoricalChart />
      </DataPanel>

      {/* Key Historical Events */}
      <Card variant="terminal">
        <CardHeader>
          <CardTitle>Key Historical Events</CardTitle>
          <CardDescription>Major inflection points in US debt history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-6 pl-10">
              <TimelineEvent
                year="1971"
                title="Nixon Shock"
                description="End of Bretton Woods gold standard. USD becomes fiat currency."
                impact="negative"
              />
              <TimelineEvent
                year="1981"
                title="Volcker Shock"
                description="Fed raises rates to 20% to fight inflation. Debt service costs spike."
                impact="negative"
              />
              <TimelineEvent
                year="2008"
                title="Global Financial Crisis"
                description="Fed begins QE. Debt explodes as government bails out financial system."
                impact="negative"
              />
              <TimelineEvent
                year="2020"
                title="COVID-19 Response"
                description="$5T+ in stimulus. Fed holdings peak at $8.5T. Debt-to-GDP hits WWII levels."
                impact="negative"
              />
              <TimelineEvent
                year="2022"
                title="QT Begins"
                description="Fed starts unwinding balance sheet. Private markets must absorb supply."
                impact="neutral"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">TREND</Badge>
              <CardTitle>Declining Foreign Share</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="leading-relaxed mb-3">
              Foreign holders as a share of total debt peaked around 2014 at ~34% and has
              declined to ~24%. This is driven by:
            </CardDescription>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>China reducing holdings amid geopolitical tensions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Reserve diversification away from USD</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Total debt growing faster than foreign appetite</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card variant="terminal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="warning">TREND</Badge>
              <CardTitle>Fed as Marginal Buyer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="leading-relaxed mb-3">
              The Federal Reserve went from holding ~5% of debt (2008) to ~20% (2022).
              Now reversing via QT. Key implications:
            </CardDescription>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Private markets must absorb record supply</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Higher yields required to clear auctions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Interest expense compounds as debt rolls</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface TimelineEventProps {
  year: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

function TimelineEvent({ year, title, description, impact }: TimelineEventProps) {
  const impactColors = {
    positive: 'bg-green-500',
    negative: 'bg-red-500',
    neutral: 'bg-amber-500',
  };

  return (
    <div className="relative">
      {/* Dot */}
      <div className={`absolute -left-10 top-1 w-3 h-3 rounded-full ${impactColors[impact]} border-2 border-background`} />

      {/* Content */}
      <div className="flex items-start gap-3">
        <span className="font-mono text-xs text-primary font-semibold min-w-[3rem]">{year}</span>
        <div>
          <div className="text-sm font-medium text-foreground">{title}</div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}
