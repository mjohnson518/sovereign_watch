/**
 * API Route: /api/maturity-wall
 * 
 * Returns pre-aggregated maturity wall data.
 * Data is aggregated server-side from MSPD Table 3 securities.
 */

import { NextResponse } from 'next/server';
import { fetchSecuritiesDetail } from '@/lib/etl/treasury-client';
import { cleanSecurityRecords } from '@/lib/etl/sanitizers';
import { aggregateMaturityWall } from '@/lib/etl/aggregators';
import type { MaturityWallData } from '@/lib/types/treasury';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Revalidate daily

interface MaturityWallResponse {
  data: MaturityWallData[];
  meta: {
    computedAt: string;
    recordDate: string;
    yearsIncluded: number;
    totalSecuritiesProcessed: number;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Optional query params for customization
  const yearsParam = searchParams.get('years');
  const years = yearsParam ? parseInt(yearsParam, 10) : 10;
  
  try {
    // Fetch raw securities data from Treasury API
    // Using 5000 records to capture the full monthly report
    const rawSecurities = await fetchSecuritiesDetail(5000);
    
    if (!rawSecurities.length) {
      return NextResponse.json(
        { error: 'No securities data available' },
        { status: 404 }
      );
    }
    
    // Get the latest record date
    const latestDate = rawSecurities[0].record_date;
    
    // Filter to only the latest report's data
    const latestReportRecords = rawSecurities.filter(
      r => r.record_date === latestDate
    );
    
    // Clean and validate records
    const cleanedSecurities = cleanSecurityRecords(latestReportRecords);
    
    // Aggregate into maturity wall format
    const currentYear = new Date().getFullYear();
    const maturityWall = aggregateMaturityWall(
      cleanedSecurities,
      currentYear + 1,
      currentYear + 1 + years
    );
    
    const response: MaturityWallResponse = {
      data: maturityWall,
      meta: {
        computedAt: new Date().toISOString(),
        recordDate: latestDate,
        yearsIncluded: years,
        totalSecuritiesProcessed: cleanedSecurities.length,
      },
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('[API /maturity-wall] Error:', error);
    return NextResponse.json(
      { error: 'Failed to compute maturity wall' },
      { status: 500 }
    );
  }
}

