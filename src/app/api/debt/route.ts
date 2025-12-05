/**
 * API Route: /api/debt
 * 
 * Returns the latest total debt snapshot.
 * Fetches live from Treasury API if database is empty.
 */

import { NextResponse } from 'next/server';
import { fetchDebtToPenny } from '@/lib/etl/treasury-client';
import { cleanDebtRecord } from '@/lib/etl/sanitizers';
import type { DebtSummary } from '@/lib/types/treasury';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

/**
 * Format large numbers to human-readable strings
 */
function formatTrillions(amount: number): string {
  const trillions = amount / 1_000_000_000_000;
  return `$${trillions.toFixed(2)}T`;
}

export async function GET() {
  try {
    // Fetch live data from Treasury API
    const rawDebt = await fetchDebtToPenny();
    
    if (!rawDebt) {
      return NextResponse.json(
        { error: 'No debt data available' },
        { status: 404 }
      );
    }
    
    const cleaned = cleanDebtRecord(rawDebt);
    
    if (!cleaned) {
      return NextResponse.json(
        { error: 'Failed to parse debt data' },
        { status: 500 }
      );
    }
    
    const response: DebtSummary = {
      totalDebt: cleaned.totalPublicDebt,
      totalDebtFormatted: formatTrillions(cleaned.totalPublicDebt),
      debtHeldByPublic: cleaned.debtHeldByPublic,
      intragovernmental: cleaned.intragovernmentalHoldings,
      lastUpdated: cleaned.recordDate,
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[API /debt] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debt data' },
      { status: 500 }
    );
  }
}

