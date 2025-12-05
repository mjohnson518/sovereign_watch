'use client';

/**
 * Sidebar Navigation Component
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/theme-provider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenAI: () => void;
}

const NAV_ITEMS = [
  { id: 'health', label: 'Health Dashboard', icon: 'pulse' },
  { id: 'inflation', label: 'Inflation & Yields', icon: 'activity' },
  { id: 'composition', label: 'Ownership (Sankey)', icon: 'chart' },
  { id: 'historical', label: '50-Year History', icon: 'history' },
  { id: 'supply', label: 'Supply (Maturity)', icon: 'stack' },
  { id: 'demand', label: 'Demand (Auctions)', icon: 'trend' },
  { id: 'sources', label: 'Data Sources', icon: 'database' },
  { id: 'about', label: 'About', icon: 'info' },
];

export function Sidebar({ currentView, onViewChange, onOpenAI }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-stone-200 dark:border-zinc-800 flex flex-col hidden md:flex z-20">
      <SidebarContent 
        currentView={currentView} 
        onViewChange={onViewChange} 
        onOpenAI={onOpenAI} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />
    </aside>
  );

  // Mobile Navigation (Hamburger)
  const MobileNav = () => (
    <div className="md:hidden fixed top-3 left-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent 
            currentView={currentView} 
            onViewChange={onViewChange} 
            onOpenAI={onOpenAI} 
            theme={theme} 
            toggleTheme={toggleTheme} 
          />
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileNav />
    </>
  );
}

function SidebarContent({ currentView, onViewChange, onOpenAI, theme, toggleTheme }: any) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Logo */}
      <div className="p-6 border-b border-stone-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-zinc-50">
          Sovereign<span className="text-stone-500 dark:text-zinc-400 font-light">Watch</span>
        </h1>
        <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">
          Live Treasury Analytics
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              currentView === item.id
                ? 'bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-zinc-50'
                : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800/50'
            )}
          >
            <NavIcon type={item.icon} className="mr-3 h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* AI Button */}
      <div className="px-3 pb-2">
        <Button
          onClick={onOpenAI}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          size="sm"
        >
          <SparklesIcon className="mr-2 h-4 w-4" />
          Ask Sovereign AI
        </Button>
      </div>

      {/* Theme Toggle */}
      <div className="px-3 pb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="w-full"
        >
          {theme === 'light' ? (
            <>
              <MoonIcon className="mr-2 h-4 w-4" />
              Dark Mode
            </>
          ) : (
            <>
              <SunIcon className="mr-2 h-4 w-4" />
              Light Mode
            </>
          )}
        </Button>
      </div>

      {/* Status Footer */}
      <div className="p-4 border-t border-stone-200 dark:border-zinc-800 text-xs text-stone-500 dark:text-zinc-500">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live API Connection</span>
        </div>
        <div>Fiscal Data: Connected</div>
        <div>Update Frequency: Daily</div>
      </div>
    </div>
  );
}

// Simple icon components
function NavIcon({ type, className }: { type: string; className?: string }) {
  const iconClass = cn('inline-block', className);
  
  switch (type) {
    case 'pulse':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'activity':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case 'info':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'chart':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'history':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'stack':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case 'trend':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    case 'database':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      );
    default:
      return null;
  }
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
