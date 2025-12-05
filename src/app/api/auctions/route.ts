/**
 * API Route: /api/auctions
 * 
 * Returns auction demand data (bid-to-cover ratios).
 * Prioritizes Database, falls back to Live API.
 */

import { NextResponse } from 'next/server';
import { fetchAuctions } from '@/lib/etl/treasury-client';
import { cleanAuctionRecords } from '@/lib/etl/sanitizers';
import { aggregateAuctionDemand, calculateAuctionStats } from '@/lib/etl/aggregators';
import { db } from '@/lib/db';
import { treasuryAuctions } from '@/lib/db/schema';
import { desc, gte, inArray } from 'drizzle-orm';
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
    source: 'database' | 'api';
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Query parameters
  const timeframe = searchParams.get('timeframe') || '1y';
  // Default types to Note/Bond if not specified
  const typesParam = searchParams.get('types');
  const types = typesParam ? typesParam.split(',') : ['NOTE', 'BOND'];
  
  // Calculate start date based on timeframe
  const now = new Date();
  let startDate: string;
  
  switch (timeframe) {
    case '1y': now.setFullYear(now.getFullYear() - 1); break;
    case '3y': now.setFullYear(now.getFullYear() - 3); break;
    case '5y': now.setFullYear(now.getFullYear() - 5); break;
    case '10y': now.setFullYear(now.getFullYear() - 10); break;
    default: now.setFullYear(now.getFullYear() - 1);
  }
  startDate = now.toISOString().split('T')[0];
  
  try {
    // 1. Try Database
    // We need to cast the enum types for the query to work with string array
    // Note: Drizzle enum array filtering can be tricky, simplifing to fetch relevant date range
    // and filtering in memory for types if necessary, or constructing query carefully.
    
    const dbAuctions = await db.select()
      .from(treasuryAuctions)
      .where(gte(treasuryAuctions.auctionDate, startDate))
      .orderBy(desc(treasuryAuctions.auctionDate));
      
    if (dbAuctions.length > 0) {
      // Filter by type in memory to match string inputs to enum
      // The DB stores standardized ENUMs: 'BILL', 'NOTE', 'BOND', etc.
      const filteredDbAuctions = dbAuctions.filter(a => 
        types.includes(a.securityType)
      );
      
      if (filteredDbAuctions.length > 0) {
        const cleanData: AuctionDemandData[] = filteredDbAuctions.map(a => ({
          date: a.auctionDate,
          ratio: a.bidToCoverRatio ? parseFloat(a.bidToCoverRatio) : 0,
          type: a.securityTypeRaw || a.securityType,
          term: a.securityTerm,
          direct: a.directBidderAccepted ? parseFloat(a.directBidderAccepted) : undefined,
          indirect: a.indirectBidderAccepted ? parseFloat(a.indirectBidderAccepted) : undefined,
          dealers: a.primaryDealerAccepted ? parseFloat(a.primaryDealerAccepted) : undefined,
          accepted: a.acceptedAmount ? parseFloat(a.acceptedAmount) : undefined,
        })).filter(a => a.ratio > 0).sort((a, b) => a.date.localeCompare(b.date)); // Sort ascending for chart

        const stats = calculateAuctionStats(cleanData);

        const response: AuctionsResponse = {
          data: cleanData,
          stats,
          meta: {
            computedAt: new Date().toISOString(),
            timeframe,
            securityTypes: types,
            source: 'database',
          },
        };
        return NextResponse.json(response);
      }
    }

    // 2. Fallback to Live API
    console.log('Database empty or stale, fetching live auctions...');
    const rawAuctions = await fetchAuctions(10000); // Fetch enough for 10y history
    
    if (!rawAuctions.length) {
      return NextResponse.json(
        { error: 'No auction data available' },
        { status: 404 }
      );
    }
    
    const cleanedAuctions = cleanAuctionRecords(rawAuctions);
    const demandData = aggregateAuctionDemand(cleanedAuctions, types, startDate);
    const stats = calculateAuctionStats(demandData);
    
    const response: AuctionsResponse = {
      data: demandData,
      stats,
      meta: {
        computedAt: new Date().toISOString(),
        timeframe,
        securityTypes: types,
        source: 'api',
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
