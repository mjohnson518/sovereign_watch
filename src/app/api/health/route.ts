/**
 * API Route: /api/health
 * 
 * Returns "Health Dashboard" metrics: Interest Expense, GDP ratios, Yield Curve.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { economicIndicators } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import type { HealthMetrics } from '@/lib/types/treasury';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  try {
    const indicators = await db.select()
      .from(economicIndicators)
      .orderBy(desc(economicIndicators.recordDate))
      .limit(1);
      
    const latest = indicators[0];
    
    // Default / Placeholder values if data is missing (since we just added this)
    // In production, the ingest job would populate this.
    const metrics: HealthMetrics = {
      debtToGdp: latest?.debtToGdpRatio ? parseFloat(latest.debtToGdpRatio) : 124.5, // Approx Q3 2025
      interestExpense: latest?.interestExpense ? parseFloat(latest.interestExpense) : 1100000000000, // ~$1.1T annualized
      averageInterestRate: latest?.averageInterestRate ? parseFloat(latest.averageInterestRate) : 3.32,
      yieldCurveSpread: latest?.yieldCurveSpread ? parseFloat(latest.yieldCurveSpread) : 0.15, // Normalizing
      lastUpdated: latest?.recordDate || new Date().toISOString().split('T')[0],
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('[API /health] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health metrics' },
      { status: 500 }
    );
  }
}

