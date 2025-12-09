'use client';

/**
 * Sidebar Navigation Component - Bloomberg Terminal 2.0
 *
 * Command-style navigation with keyboard shortcuts,
 * status indicators, and professional terminal aesthetic.
 */

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenAI: () => void;
}

const NAV_ITEMS = [
  { id: 'health', label: 'Health Monitor', shortcut: '1', icon: 'pulse', category: 'ANALYSIS' },
  { id: 'inflation', label: 'Yields & Inflation', shortcut: '2', icon: 'activity', category: 'ANALYSIS' },
  { id: 'composition', label: 'Debt Ownership', shortcut: '3', icon: 'chart', category: 'ANALYSIS' },
  { id: 'historical', label: '50Y Historical', shortcut: '4', icon: 'history', category: 'ANALYSIS' },
  { id: 'supply', label: 'Maturity Wall', shortcut: '5', icon: 'stack', category: 'SUPPLY' },
  { id: 'demand', label: 'Auction Demand', shortcut: '6', icon: 'trend', category: 'DEMAND' },
  { id: 'sources', label: 'Data Sources', shortcut: '7', icon: 'database', category: 'SYSTEM' },
  { id: 'about', label: 'About', shortcut: '8', icon: 'info', category: 'SYSTEM' },
];

export function Sidebar({ currentView, onViewChange, onOpenAI }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Number key shortcuts (1-8)
      const num = parseInt(e.key);
      if (num >= 1 && num <= 8) {
        const item = NAV_ITEMS[num - 1];
        if (item) {
          onViewChange(item.id);
        }
      }

      // AI Panel shortcut (A key)
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        onOpenAI();
      }

      // Theme toggle (T key)
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onViewChange, onOpenAI, toggleTheme]);

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col hidden md:flex z-20 relative">
      {/* Left accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent" />

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
    <div className="md:hidden fixed top-2 left-2 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 bg-card border border-border rounded hover:bg-muted transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0 bg-sidebar border-sidebar-border">
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

interface SidebarContentProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenAI: () => void;
  theme: string;
  toggleTheme: () => void;
}

function SidebarContent({ currentView, onViewChange, onOpenAI, theme, toggleTheme }: SidebarContentProps) {
  // Group nav items by category
  const categories = NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof NAV_ITEMS>);

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
            <span className="font-mono text-primary font-bold text-sm">SW</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              SOVEREIGN<span className="text-primary">WATCH</span>
            </h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Treasury Analytics Terminal
            </p>
          </div>
        </div>
      </div>

      {/* Command Input Hint */}
      <div className="px-3 py-2 border-b border-sidebar-border bg-muted/20">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="kbd">1-8</span>
          <span>Navigate</span>
          <span className="mx-1">•</span>
          <span className="kbd">A</span>
          <span>AI</span>
          <span className="mx-1">•</span>
          <span className="kbd">T</span>
          <span>Theme</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category} className="mb-2">
            {/* Category Header */}
            <div className="px-4 py-1.5">
              <span className="text-[9px] font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
                {category}
              </span>
            </div>

            {/* Nav Items */}
            <div className="px-2 space-y-0.5">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-all group',
                    currentView === item.id
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-2 border-transparent'
                  )}
                >
                  {/* Shortcut Badge */}
                  <span className={cn(
                    'w-4 h-4 rounded text-[10px] font-mono font-medium flex items-center justify-center shrink-0',
                    currentView === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                  )}>
                    {item.shortcut}
                  </span>

                  {/* Icon */}
                  <NavIcon type={item.icon} className="h-3.5 w-3.5 shrink-0 opacity-60" />

                  {/* Label */}
                  <span className="truncate font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* AI Assistant Button */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <button
          onClick={onOpenAI}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded text-xs font-medium text-primary hover:from-primary/30 hover:to-purple-500/30 transition-all group"
        >
          <SparklesIcon className="h-4 w-4" />
          <span>Ask Sovereign AI</span>
          <span className="ml-auto kbd group-hover:bg-primary/20">A</span>
        </button>
      </div>

      {/* Theme Toggle */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded transition-colors group"
        >
          {theme === 'light' ? (
            <>
              <MoonIcon className="h-3.5 w-3.5" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <SunIcon className="h-3.5 w-3.5" />
              <span>Light Mode</span>
            </>
          )}
          <span className="ml-auto kbd group-hover:bg-primary/20">T</span>
        </button>
      </div>

      {/* Status Footer */}
      <div className="p-3 border-t border-sidebar-border bg-muted/20">
        <div className="space-y-1.5 text-[10px]">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 status-live" />
            <span className="text-muted-foreground">TREASURY API</span>
            <span className="ml-auto text-green-500 font-mono">CONNECTED</span>
          </div>

          {/* Update Info */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Daily Updates</span>
            <span className="ml-auto font-mono">T+1</span>
          </div>

          {/* Version */}
          <div className="flex items-center justify-between text-muted-foreground/60">
            <span>v2.0.0</span>
            <span className="font-mono">BLOOMBERG TERMINAL</span>
          </div>
        </div>
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'activity':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
