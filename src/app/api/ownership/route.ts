/**
 * API Route: /api/ownership
 *
 * Returns ownership/composition data for the Sankey diagram.
 * Uses static estimates from constants, scaled by live total debt.
 */

import { NextResponse } from 'next/server';
import { fetchDebtToPenny } from '@/lib/etl/treasury-client';
import { cleanDebtRecord } from '@/lib/etl/sanitizers';
import {
  OWNERSHIP_NODES,
  OWNERSHIP_LINKS,
  OWNERSHIP_DATA_LAST_UPDATED,
  HISTORICAL_COMPOSITION,
  scaleOwnershipData,
  STABLECOIN_DATA,
  FED_HOLDINGS,
  FOREIGN_HOLDERS,
} from '@/lib/constants/ownership';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface OwnershipResponse {
  sankey: {
    nodes: string[];
    nodeColors: string[];
    nodeValues: number[];
    links: { source: number; target: number; value: number }[];
  };
  historical: typeof HISTORICAL_COMPOSITION;
  supplementary: {
    stablecoins: typeof STABLECOIN_DATA;
    fedHoldings: typeof FED_HOLDINGS;
    foreignHolders: typeof FOREIGN_HOLDERS;
  };
  meta: {
    totalDebt: number;
    totalDebtFormatted: string;
    ownershipDataDate: string;
    liveDebtDate: string | null;
    isScaled: boolean;
  };
}

export async function GET(request: Request) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = checkRateLimit(`ownership:${clientId}`, RATE_LIMITS.data);

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

  try {
    // Try to fetch live debt to scale ownership data
    let liveTotal: number | null = null;
    let liveDate: string | null = null;

    try {
      const rawDebt = await fetchDebtToPenny();
      if (rawDebt) {
        const cleaned = cleanDebtRecord(rawDebt);
        if (cleaned) {
          liveTotal = cleaned.totalPublicDebt / 1_000_000_000_000; // Convert to trillions
          liveDate = cleaned.recordDate;
        }
      }
    } catch {
      console.warn('[API /ownership] Could not fetch live debt, using base values');
    }
    
    // Scale ownership data if we have live total
    const nodes = liveTotal ? scaleOwnershipData(liveTotal) : OWNERSHIP_NODES;
    const isScaled = liveTotal !== null;
    const totalDebt = liveTotal || OWNERSHIP_NODES[0].value;
    
    const response: OwnershipResponse = {
      sankey: {
        nodes: nodes.map(n => n.label),
        nodeColors: nodes.map(n => n.color),
        nodeValues: nodes.map(n => n.value),
        links: OWNERSHIP_LINKS,
      },
      historical: HISTORICAL_COMPOSITION,
      supplementary: {
        stablecoins: STABLECOIN_DATA,
        fedHoldings: FED_HOLDINGS,
        foreignHolders: FOREIGN_HOLDERS,
      },
      meta: {
        totalDebt,
        totalDebtFormatted: `$${totalDebt.toFixed(2)}T`,
        ownershipDataDate: OWNERSHIP_DATA_LAST_UPDATED,
        liveDebtDate: liveDate,
        isScaled,
      },
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[API /ownership] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ownership data' },
      { status: 500 }
    );
  }
}

