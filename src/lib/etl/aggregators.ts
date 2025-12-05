/**
 * Data Aggregators
 * 
 * Functions to aggregate cleaned data for efficient API responses.
 * These run server-side to minimize client-side data processing.
 */

import type {
  CleanedSecurity,
  CleanedAuction,
  MaturityWallData,
  AuctionDemandData,
} from '../types/treasury';

/**
 * Aggregate securities by maturity year for the Maturity Wall chart
 * 
 * @param securities - Cleaned security records
 * @param startYear - First year to include (default: next year)
 * @param endYear - Last year to include (default: startYear + 10)
 */
export function aggregateMaturityWall(
  securities: CleanedSecurity[],
  startYear?: number,
  endYear?: number
): MaturityWallData[] {
  const currentYear = new Date().getFullYear();
  const start = startYear || currentYear + 1;
  const end = endYear || start + 10;
  
  // Initialize buckets for each year
  const buckets: Record<number, MaturityWallData> = {};
  for (let year = start; year <= end; year++) {
    buckets[year] = {
      year,
      bills: 0,
      notes: 0,
      bonds: 0,
      tips: 0,
      frn: 0,
      total: 0,
    };
  }
  
  // Aggregate securities into buckets
  for (const security of securities) {
    const maturityYear = security.maturityYear;
    
    if (!maturityYear || maturityYear < start || maturityYear > end) {
      continue;
    }
    
    const amount = security.outstandingAmount;
    const bucket = buckets[maturityYear];
    
    switch (security.securityType) {
      case 'BILL':
        bucket.bills += amount;
        break;
      case 'NOTE':
        bucket.notes += amount;
        break;
      case 'BOND':
        bucket.bonds += amount;
        break;
      case 'TIPS':
        bucket.tips += amount;
        break;
      case 'FRN':
        bucket.frn += amount;
        break;
    }
    
    bucket.total += amount;
  }
  
  // Convert to array and sort by year
  return Object.values(buckets).sort((a, b) => a.year - b.year);
}

/**
 * Filter and format auction data for the demand chart
 * 
 * @param auctions - Cleaned auction records
 * @param securityTypes - Filter to specific security types
 * @param startDate - Filter to auctions after this date
 */
export function aggregateAuctionDemand(
  auctions: CleanedAuction[],
  securityTypes: string[] = ['NOTE', 'BOND'],
  startDate?: string
): AuctionDemandData[] {
  let filtered = auctions.filter(a => 
    a.bidToCoverRatio !== null &&
    securityTypes.includes(a.securityType)
  );
  
  if (startDate) {
    filtered = filtered.filter(a => a.auctionDate >= startDate);
  }
  
  // Sort by date ascending for charting
  filtered.sort((a, b) => a.auctionDate.localeCompare(b.auctionDate));
  
  return filtered.map(a => ({
    date: a.auctionDate,
    ratio: a.bidToCoverRatio!,
    type: a.securityTypeRaw,
    term: a.securityTerm,
  }));
}

/**
 * Calculate auction statistics for a given period
 */
export function calculateAuctionStats(auctions: AuctionDemandData[]) {
  if (auctions.length === 0) {
    return {
      count: 0,
      avgRatio: 0,
      minRatio: 0,
      maxRatio: 0,
      medianRatio: 0,
      belowThreshold: 0, // Auctions with ratio < 2.0 (danger zone)
    };
  }
  
  const ratios = auctions.map(a => a.ratio).sort((a, b) => a - b);
  const sum = ratios.reduce((acc, r) => acc + r, 0);
  
  return {
    count: auctions.length,
    avgRatio: sum / auctions.length,
    minRatio: ratios[0],
    maxRatio: ratios[ratios.length - 1],
    medianRatio: ratios[Math.floor(ratios.length / 2)],
    belowThreshold: ratios.filter(r => r < 2.0).length,
  };
}

/**
 * Group auctions by month for trend analysis
 */
export function groupAuctionsByMonth(
  auctions: AuctionDemandData[]
): Record<string, AuctionDemandData[]> {
  const grouped: Record<string, AuctionDemandData[]> = {};
  
  for (const auction of auctions) {
    const monthKey = auction.date.substring(0, 7); // YYYY-MM
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(auction);
  }
  
  return grouped;
}

/**
 * Calculate monthly average bid-to-cover ratios
 */
export function calculateMonthlyAverages(
  auctions: AuctionDemandData[]
): { month: string; avgRatio: number; count: number }[] {
  const grouped = groupAuctionsByMonth(auctions);
  
  return Object.entries(grouped)
    .map(([month, monthAuctions]) => ({
      month,
      avgRatio: monthAuctions.reduce((sum, a) => sum + a.ratio, 0) / monthAuctions.length,
      count: monthAuctions.length,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Calculate total outstanding debt by security type
 */
export function calculateDebtByType(
  securities: CleanedSecurity[]
): Record<string, number> {
  const totals: Record<string, number> = {
    BILL: 0,
    NOTE: 0,
    BOND: 0,
    TIPS: 0,
    FRN: 0,
    OTHER: 0,
    TOTAL: 0,
  };
  
  for (const security of securities) {
    totals[security.securityType] += security.outstandingAmount;
    totals.TOTAL += security.outstandingAmount;
  }
  
  return totals;
}

