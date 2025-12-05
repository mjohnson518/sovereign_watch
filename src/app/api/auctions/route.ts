/**
 * API Route: /api/auctions
 * 
 * Returns auction demand data (bid-to-cover ratios).
 * Supports filtering by timeframe and security type.
 */

import { NextResponse } from 'next/server';
import { fetchAuctions } from '@/lib/etl/treasury-client';
import { cleanAuctionRecords } from '@/lib/etl/sanitizers';
import { aggregateAuctionDemand, calculateAuctionStats } from '@/lib/etl/aggregators';
import type { AuctionDemandData } from '@/lib/types/treasury';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Revalidate daily

interface AuctionsResponse {
  data: AuctionDemandData[];
  stats: {
    count: number;
    avgRatio: number;
    minRatio: number;
    maxRatio: number;
    medianRatio: number;
    belowThreshold: number;
  };
  meta: {
    computedAt: string;
    timeframe: string;
    securityTypes: string[];
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Query parameters
  const timeframe = searchParams.get('timeframe') || '1y';
  const types = searchParams.get('types')?.split(',') || ['NOTE', 'BOND'];
  
  // Calculate start date based on timeframe
  const now = new Date();
  let startDate: string;
  
  switch (timeframe) {
    case '1y':
      now.setFullYear(now.getFullYear() - 1);
      startDate = now.toISOString().split('T')[0];
      break;
    case '3y':
      now.setFullYear(now.getFullYear() - 3);
      startDate = now.toISOString().split('T')[0];
      break;
    case '5y':
      now.setFullYear(now.getFullYear() - 5);
      startDate = now.toISOString().split('T')[0];
      break;
    case '10y':
      now.setFullYear(now.getFullYear() - 10);
      startDate = now.toISOString().split('T')[0];
      break;
    default:
      now.setFullYear(now.getFullYear() - 1);
      startDate = now.toISOString().split('T')[0];
  }
  
  try {
    // Fetch raw auction data
    const rawAuctions = await fetchAuctions(10000);
    
    if (!rawAuctions.length) {
      return NextResponse.json(
        { error: 'No auction data available' },
        { status: 404 }
      );
    }
    
    // Clean records
    const cleanedAuctions = cleanAuctionRecords(rawAuctions);
    
    // Aggregate and filter
    const demandData = aggregateAuctionDemand(cleanedAuctions, types, startDate);
    
    // Calculate statistics
    const stats = calculateAuctionStats(demandData);
    
    const response: AuctionsResponse = {
      data: demandData,
      stats,
      meta: {
        computedAt: new Date().toISOString(),
        timeframe,
        securityTypes: types,
      },
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('[API /auctions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auction data' },
      { status: 500 }
    );
  }
}

