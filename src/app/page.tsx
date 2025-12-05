'use client';

/**
 * Main Dashboard Page
 * 
 * Sovereign Watch - Live Treasury Analytics Dashboard
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
import { ScrollArea } from '@/components/ui/scroll-area';

type ViewType = 'composition' | 'historical' | 'supply' | 'demand' | 'sources';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<ViewType>('composition');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
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
      default:
        return <CompositionView />;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-stone-50 dark:bg-zinc-950">
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
          <div className="p-8 space-y-8 animate-fade-in">
            {renderView()}
          </div>
        </ScrollArea>
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
