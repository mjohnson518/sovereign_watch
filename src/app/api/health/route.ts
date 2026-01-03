/**
 * API Route: /api/health
 * 
 * Returns "Health Dashboard" metrics: Interest Expense, GDP ratios, Yield Curve.
 * Returns sensible defaults if database is unavailable.
 */

import { NextResponse } from 'next/server';
import { getDb, economicIndicators } from '@/lib/db';
import { desc } from 'drizzle-orm';
import type { HealthMetrics } from '@/lib/types/treasury';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

// Default values based on latest official data (updated when app is deployed)
const DEFAULT_METRICS: HealthMetrics = {
  debtToGdp: 124.5,
  interestExpense: 1100000000000, // ~$1.1T annualized
  averageInterestRate: 3.32,
  yieldCurveSpread: 0.15,
  realYield10y: 2.1,
  breakeven10y: 2.3,
  lastUpdated: new Date().toISOString().split('T')[0],
};

export async function GET() {
  try {
    const db = getDb();
    
    if (db) {
      try {
        const indicators = await db.select()
          .from(economicIndicators)
          .orderBy(desc(economicIndicators.recordDate))
          .limit(1);
          
        const latest = indicators[0];
        
        if (latest) {
          const metrics: HealthMetrics = {
            debtToGdp: latest.debtToGdpRatio ? parseFloat(latest.debtToGdpRatio) : DEFAULT_METRICS.debtToGdp,
            interestExpense: latest.interestExpense ? parseFloat(latest.interestExpense) : DEFAULT_METRICS.interestExpense,
            averageInterestRate: latest.averageInterestRate ? parseFloat(latest.averageInterestRate) : DEFAULT_METRICS.averageInterestRate,
            yieldCurveSpread: latest.yieldCurveSpread ? parseFloat(latest.yieldCurveSpread) : DEFAULT_METRICS.yieldCurveSpread,
            realYield10y: latest.realYield10y ? parseFloat(latest.realYield10y) : DEFAULT_METRICS.realYield10y,
            breakeven10y: latest.breakeven10y ? parseFloat(latest.breakeven10y) : DEFAULT_METRICS.breakeven10y,
            lastUpdated: latest.recordDate,
          };
          return NextResponse.json(metrics);
        }
      } catch (dbError) {
        console.warn('[API /health] Database query failed:', dbError);
      }
    }
    
    // Return defaults if DB unavailable or empty
    return NextResponse.json(DEFAULT_METRICS);
  } catch (error) {
    console.error('[API /health] Error:', error);
    return NextResponse.json(DEFAULT_METRICS);
  }
}

