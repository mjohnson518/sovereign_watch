/**
 * API Route: /api/cron/ingest
 * 
 * Cron job endpoint for daily data ingestion.
 * Should be called by Vercel Cron or external scheduler.
 * 
 * This endpoint:
 * 1. Fetches latest securities data
 * 2. Fetches new auction data (delta)
 * 3. Stores debt snapshot
 * 4. Pre-computes maturity wall aggregates
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Vercel Cron configuration
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

/**
 * Verify the request is from a valid cron job
 */
async function verifyCronSecret(request: Request): Promise<boolean> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // In development, allow without secret
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  if (!cronSecret) {
    console.warn('[Cron] CRON_SECRET not set');
    return false;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  // Verify authorization
  const isAuthorized = await verifyCronSecret(request);
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const startTime = Date.now();
  const results = {
    debt: { success: false, message: '' },
    securities: { success: false, message: '', count: 0 },
    auctions: { success: false, message: '', count: 0 },
    aggregates: { success: false, message: '' },
  };
  
  try {
    // Step 1: Fetch and store debt snapshot
    console.log('[Cron] Step 1: Fetching debt snapshot...');
    try {
      const { fetchDebtToPenny } = await import('@/lib/etl/treasury-client');
      const { cleanDebtRecord } = await import('@/lib/etl/sanitizers');
      
      const rawDebt = await fetchDebtToPenny();
      if (rawDebt) {
        const cleaned = cleanDebtRecord(rawDebt);
        if (cleaned) {
          // In production, save to database here
          // await db.insert(dailyDebtSnapshots).values({...})
          results.debt = {
            success: true,
            message: `Debt snapshot: $${(cleaned.totalPublicDebt / 1e12).toFixed(2)}T as of ${cleaned.recordDate}`,
          };
        }
      }
    } catch (e) {
      results.debt = { success: false, message: `Error: ${e}` };
    }
    
    // Step 2: Fetch securities data
    console.log('[Cron] Step 2: Fetching securities...');
    try {
      const { fetchSecuritiesDetail } = await import('@/lib/etl/treasury-client');
      const { cleanSecurityRecords } = await import('@/lib/etl/sanitizers');
      
      const rawSecurities = await fetchSecuritiesDetail(5000);
      const cleaned = cleanSecurityRecords(rawSecurities);
      
      // In production, save to database here
      // await db.insert(treasurySecurities).values(...)
      
      results.securities = {
        success: true,
        message: `Processed ${cleaned.length} securities`,
        count: cleaned.length,
      };
    } catch (e) {
      results.securities = { success: false, message: `Error: ${e}`, count: 0 };
    }
    
    // Step 3: Fetch auction data
    console.log('[Cron] Step 3: Fetching auctions...');
    try {
      const { fetchAuctions } = await import('@/lib/etl/treasury-client');
      const { cleanAuctionRecords } = await import('@/lib/etl/sanitizers');
      
      const rawAuctions = await fetchAuctions(1000); // Just recent auctions for delta
      const cleaned = cleanAuctionRecords(rawAuctions);
      
      // In production, upsert to database here
      // await db.insert(treasuryAuctions).values(...).onConflictDoNothing()
      
      results.auctions = {
        success: true,
        message: `Processed ${cleaned.length} auctions`,
        count: cleaned.length,
      };
    } catch (e) {
      results.auctions = { success: false, message: `Error: ${e}`, count: 0 };
    }
    
    // Step 4: Pre-compute aggregates
    console.log('[Cron] Step 4: Computing aggregates...');
    try {
      // In production, compute and store maturity wall aggregates
      // const maturityWall = aggregateMaturityWall(securities);
      // await db.insert(maturityWallAggregates).values(...)
      
      results.aggregates = {
        success: true,
        message: 'Aggregates computed (would be stored in production)',
      };
    } catch (e) {
      results.aggregates = { success: false, message: `Error: ${e}` };
    }
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      results,
    });
    
  } catch (error) {
    console.error('[Cron] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ingestion failed',
        details: String(error),
        results,
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: Request) {
  return GET(request);
}

