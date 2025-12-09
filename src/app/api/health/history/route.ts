/**
 * API Route: /api/health/history
 * 
 * Returns historical economic indicators (Yields, Inflation Breakevens).
 * Returns empty array if database is unavailable.
 */

import { NextResponse } from 'next/server';
import { getDb, economicIndicators } from '@/lib/db';
import { desc, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || '1y';
  
  const now = new Date();
  
  switch (timeframe) {
    case '1y': now.setFullYear(now.getFullYear() - 1); break;
    case '3y': now.setFullYear(now.getFullYear() - 3); break;
    case '5y': now.setFullYear(now.getFullYear() - 5); break;
    default: now.setFullYear(now.getFullYear() - 1);
  }
  const startDate = now.toISOString().split('T')[0];

  try {
    const db = getDb();
    
    if (!db) {
      // Return empty array if DB not available - charts will show "no data"
      return NextResponse.json([]);
    }

    const data = await db.select({
      date: economicIndicators.recordDate,
      yield10y: economicIndicators.yield10y,
      realYield10y: economicIndicators.realYield10y,
      breakeven10y: economicIndicators.breakeven10y,
    })
    .from(economicIndicators)
    .where(gte(economicIndicators.recordDate, startDate))
    .orderBy(desc(economicIndicators.recordDate));
    
    // Format for charts (sort ascending)
    const chartData = data.map(d => ({
      date: d.date,
      yield10y: d.yield10y ? parseFloat(d.yield10y) : null,
      realYield10y: d.realYield10y ? parseFloat(d.realYield10y) : null,
      breakeven10y: d.breakeven10y ? parseFloat(d.breakeven10y) : null,
    })).reverse();

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('[API /health/history] Error:', error);
    return NextResponse.json([]);
  }
}

