'use client';

/**
 * Main Dashboard Page - Bloomberg Terminal 2.0
 *
 * Sovereign Watch - Next-generation real-time US Treasury debt analytics terminal
 */

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AIPanel } from '@/components/ai/ai-panel';
import { CompositionView } from '@/components/views/composition-view';
import { HistoricalView } from '@/components/views/historical-view';
import { SupplyView } from '@/components/views/supply-view';
import { DemandView } from '@/components/views/demand-view';
import { SourcesView } from '@/components/views/sources-view';
import { HealthView } from '@/components/views/health-view';
import { InflationView } from '@/components/views/inflation-view';
import { AboutView } from '@/components/views/about-view';
import { ScrollArea } from '@/components/ui/scroll-area';

type ViewType = 'health' | 'inflation' | 'composition' | 'historical' | 'supply' | 'demand' | 'sources' | 'about';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<ViewType>('health');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'health':
        return <HealthView />;
      case 'inflation':
        return <InflationView />;
      case 'composition':
        return <CompositionView />;
      case 'historical':
        return <HistoricalView />;
      case 'supply':
        return <SupplyView />;
      case 'demand':
        return <DemandView />;
      case 'sources':
        return <SourcesView />;
      case 'about':
        return <AboutView />;
      default:
        return <HealthView />;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background terminal-grid noise-overlay">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view as ViewType)}
        onOpenAI={() => setAiPanelOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Ticker */}
        <Header />

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 pb-24 md:pb-6">
            {renderView()}
          </div>
        </ScrollArea>

        {/* Floating command hint (mobile) */}
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => setAiPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-lg hover:border-primary/50 transition-colors"
          >
            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-xs font-medium">Ask AI</span>
          </button>
        </div>
      </main>

      {/* AI Panel */}
      <AIPanel
        open={aiPanelOpen}
        onOpenChange={setAiPanelOpen}
        currentView={currentView}
      />
    </div>
  );
}
