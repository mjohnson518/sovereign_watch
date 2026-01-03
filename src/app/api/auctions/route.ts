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
import { getDb, treasuryAuctions, type TreasuryAuction } from '@/lib/db';
import { desc, gte } from 'drizzle-orm';
import type { AuctionDemandData } from '@/lib/types/treasury';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { validateTimeframe, validateSecurityTypes } from '@/lib/validation';

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
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = checkRateLimit(`auctions:${clientId}`, RATE_LIMITS.data);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimitResult.resetIn / 1000).toString(),
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const timeframeValidation = validateTimeframe(searchParams.get('timeframe'));
  if (!timeframeValidation.isValid) {
    return NextResponse.json(
      { error: timeframeValidation.error },
      { status: 400 }
    );
  }
  const timeframe = timeframeValidation.value;

  const typesValidation = validateSecurityTypes(searchParams.get('types'));
  if (!typesValidation.isValid) {
    return NextResponse.json(
      { error: typesValidation.error },
      { status: 400 }
    );
  }
  const types = typesValidation.value;

  // Calculate start date based on timeframe
  const now = new Date();
  switch (timeframe) {
    case '1y': now.setFullYear(now.getFullYear() - 1); break;
    case '3y': now.setFullYear(now.getFullYear() - 3); break;
    case '5y': now.setFullYear(now.getFullYear() - 5); break;
    case '10y': now.setFullYear(now.getFullYear() - 10); break;
    default: now.setFullYear(now.getFullYear() - 1);
  }
  const startDate = now.toISOString().split('T')[0];
  
  try {
    // 1. Try Database (if available)
    const db = getDb();
    if (db) {
      try {
        const dbAuctions = await db.select()
          .from(treasuryAuctions)
          .where(gte(treasuryAuctions.auctionDate, startDate))
          .orderBy(desc(treasuryAuctions.auctionDate));
          
        if (dbAuctions.length > 0) {
          // Filter by type in memory to match string inputs to enum
          // The DB stores standardized ENUMs: 'BILL', 'NOTE', 'BOND', etc.
          const filteredDbAuctions = dbAuctions.filter((a: TreasuryAuction) =>
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
            })).filter(a => a.ratio > 0).sort((a, b) => a.date.localeCompare(b.date));

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
      } catch (dbError) {
        console.warn('[API /auctions] Database query failed, falling back to API:', dbError);
      }
    }

    // 2. Fallback to Live API
    console.log('[API /auctions] Using live API...');
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
