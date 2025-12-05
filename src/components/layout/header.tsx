'use client';

/**
 * Header Ticker Component
 * 
 * Displays live debt stats in the top header bar.
 */

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface DebtData {
  totalDebt: number;
  totalDebtFormatted: string;
  lastUpdated: string;
}

export function Header() {
  const [debtData, setDebtData] = useState<DebtData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchDebt() {
      try {
        const res = await fetch('/api/debt');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setDebtData(data);
      } catch (e) {
        console.error('Failed to fetch debt:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDebt();
  }, []);

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 h-14 flex items-center px-6 justify-between shrink-0">
      <div className="flex space-x-8 text-sm">
        {/* Total Debt */}
        <div className="flex items-center gap-2">
          <span className="text-stone-500 dark:text-zinc-500">Total Debt:</span>
          {loading ? (
            <Skeleton className="h-5 w-20" />
          ) : error ? (
            <span className="font-bold text-red-500">Offline</span>
          ) : (
            <span className="font-bold text-slate-700 dark:text-zinc-300">
              {debtData?.totalDebtFormatted}
            </span>
          )}
        </div>
        
        {/* Fed Holdings - Static for now */}
        <div className="flex items-center gap-2">
          <span className="text-stone-500 dark:text-zinc-500">Fed Holdings:</span>
          <span className="font-bold text-slate-700 dark:text-zinc-300">$4.19T (Nov &apos;25)</span>
        </div>
        
        {/* Stablecoin Market Cap */}
        <div className="flex items-center gap-2">
          <span className="text-stone-500 dark:text-zinc-500">Stablecoin Mkt Cap:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">$307B (Nov &apos;25)</span>
        </div>
      </div>
      
      <div className="text-xs text-stone-400 dark:text-zinc-600">
        Source: FiscalData.Treasury.Gov & St. Louis Fed
      </div>
    </header>
  );
}

