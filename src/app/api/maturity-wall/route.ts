/**
 * API Route: /api/maturity-wall
 *
 * Returns pre-aggregated maturity wall data.
 * Prioritizes Database (cached) data, falls back to Live API.
 */

import { NextResponse } from 'next/server';
import { fetchSecuritiesDetail } from '@/lib/etl/treasury-client';
import { cleanSecurityRecords } from '@/lib/etl/sanitizers';
import { aggregateMaturityWall } from '@/lib/etl/aggregators';
import { getDb, treasurySecurities } from '@/lib/db';
import { desc, eq } from 'drizzle-orm';
import type { MaturityWallData } from '@/lib/types/treasury';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { validateYears } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Revalidate daily

interface MaturityWallResponse {
  data: MaturityWallData[];
  meta: {
    computedAt: string;
    recordDate: string;
    yearsIncluded: number;
    totalSecuritiesProcessed: number;
    source: 'database' | 'api';
  };
}

export async function GET(request: Request) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = checkRateLimit(`maturity-wall:${clientId}`, RATE_LIMITS.data);

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

  // Validate years parameter
  const yearsValidation = validateYears(searchParams.get('years'));
  if (!yearsValidation.isValid) {
    return NextResponse.json(
      { error: yearsValidation.error },
      { status: 400 }
    );
  }
  const years = yearsValidation.value;
  
  try {
    // 1. Try Database First (if available)
    const db = getDb();
    if (db) {
      try {
        // Get the latest record date available in DB
        const latestRecord = await db.select({ date: treasurySecurities.recordDate })
          .from(treasurySecurities)
          .orderBy(desc(treasurySecurities.recordDate))
          .limit(1);

        if (latestRecord.length > 0) {
          const latestDate = latestRecord[0].date;
          
          // Fetch all securities for that date
          const dbSecurities = await db.select()
            .from(treasurySecurities)
            .where(eq(treasurySecurities.recordDate, latestDate));
            
          if (dbSecurities.length > 0) {
            // Map DB result to clean format required by aggregator
            const cleanedSecurities = dbSecurities.map(s => ({
              recordDate: s.recordDate,
              cusip: s.cusip,
              securityType: s.securityType,
              securityTypeDesc: s.securityTypeDesc || '',
              securityClass: s.securityClass,
              issueDate: s.issueDate,
              maturityDate: s.maturityDate,
              maturityYear: s.maturityYear,
              outstandingAmount: parseFloat(s.outstandingAmount),
              interestRate: s.interestRate ? parseFloat(s.interestRate) : null,
            }));

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
                source: 'database',
              },
            };
            return NextResponse.json(response);
          }
        }
      } catch (dbError) {
        console.warn('[API /maturity-wall] Database query failed, falling back to API:', dbError);
      }
    }

    // 2. Fallback to Live API
    console.log('Database empty or stale, fetching live securities...');
    const rawSecurities = await fetchSecuritiesDetail(5000);
    
    if (!rawSecurities.length) {
      return NextResponse.json(
        { error: 'No securities data available' },
        { status: 404 }
      );
    }
    
    const latestDate = rawSecurities[0].record_date;
    const latestReportRecords = rawSecurities.filter(r => r.record_date === latestDate);
    const cleanedSecurities = cleanSecurityRecords(latestReportRecords);
    
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
        source: 'api',
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
