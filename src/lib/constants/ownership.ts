/**
 * Ownership Data Constants
 * 
 * Centralized configuration for debt ownership estimates.
 * Sources: Treasury TIC, Fed Z.1, FRED
 * 
 * Note: These values are updated manually from official sources
 * as they are not available via real-time API.
 */

import type { OwnershipNode, OwnershipLink, HistoricalDataPoint } from '../types/treasury';

// Last update timestamp for ownership data
export const OWNERSHIP_DATA_LAST_UPDATED = '2025-11-01';

// Node definitions with latest estimates (in Trillions USD)
export const OWNERSHIP_NODES: OwnershipNode[] = [
  // Level 0: Total
  { id: 'total', label: 'Total US Debt', value: 36.0, color: '#1C1917' },
  
  // Level 1: Major Categories
  { id: 'public', label: 'Publicly Held', value: 28.8, color: '#334155' },
  { id: 'intra', label: 'Intragovernmental', value: 7.2, color: '#9CA3AF' },
  
  // Level 2: Public Breakdown
  { id: 'domestic', label: 'Domestic / Private', value: 17.5, color: '#475569' },
  { id: 'foreign', label: 'Foreign Investors', value: 9.1, color: '#059669' },
  { id: 'fed', label: 'Federal Reserve', value: 4.19, color: '#64748B' },
  
  // Level 3: Intragovernmental
  { id: 'trust', label: 'Gov Trust Funds', value: 6.5, color: '#F59E0B' },
  
  // Level 3: Domestic Private Breakdown
  { id: 'mmf', label: 'Money Market Funds', value: 3.5, color: '#8B5CF6' },
  { id: 'households', label: 'Households', value: 3.0, color: '#D946EF' },
  { id: 'hedge', label: 'Hedge Funds', value: 5.0, color: '#cbd5e1' },
  { id: 'banks', label: 'Banks & Insurance', value: 4.0, color: '#94a3b8' },
  { id: 'stablecoin_domestic', label: 'Stablecoins (Direct T-Bills)', value: 0.10, color: '#34d399' },
  
  // Level 3: Foreign Breakdown
  { id: 'japan', label: 'Japan', value: 1.15, color: '#10b981' },
  { id: 'china', label: 'China', value: 0.73, color: '#059669' },
  { id: 'uk', label: 'UK', value: 0.90, color: '#F59E0B' },
  { id: 'stablecoin_foreign', label: 'Stablecoins (Direct T-Bills)', value: 0.05, color: '#34d399' },
  { id: 'row', label: 'Rest of World', value: 6.27, color: '#6B7280' },
];

// Link definitions (source index -> target index -> value in Trillions)
export const OWNERSHIP_LINKS: OwnershipLink[] = [
  // Total -> Public / Intra
  { source: 0, target: 1, value: 28.8 },  // Total -> Public
  { source: 0, target: 2, value: 7.2 },   // Total -> Intra
  
  // Public -> Domestic / Foreign / Fed
  { source: 1, target: 3, value: 15.5 },  // Public -> Domestic (minus Fed overlap)
  { source: 1, target: 4, value: 9.1 },   // Public -> Foreign
  { source: 1, target: 5, value: 4.19 },  // Public -> Fed
  
  // Intra -> Trust Funds / Fed overlap
  { source: 2, target: 5, value: 0.5 },   // Intra -> Fed (SOMA holdings of intra debt)
  { source: 2, target: 6, value: 6.7 },   // Intra -> Trust Funds
  
  // Domestic -> Components
  { source: 3, target: 7, value: 3.5 },   // Domestic -> MMF
  { source: 3, target: 8, value: 3.0 },   // Domestic -> Households
  { source: 3, target: 9, value: 5.0 },   // Domestic -> Hedge Funds
  { source: 3, target: 10, value: 4.0 },  // Domestic -> Banks
  { source: 3, target: 11, value: 0.10 }, // Domestic -> Stablecoins
  
  // Foreign -> Countries
  { source: 4, target: 12, value: 1.15 }, // Foreign -> Japan
  { source: 4, target: 13, value: 0.73 }, // Foreign -> China
  { source: 4, target: 14, value: 0.90 }, // Foreign -> UK
  { source: 4, target: 15, value: 0.05 }, // Foreign -> Stablecoins (foreign issuers)
  { source: 4, target: 16, value: 6.27 }, // Foreign -> Rest of World
];

// Historical debt composition data (for 50-year chart)
// Sources: FRED, Treasury TIC, Fed Z.1 Financial Accounts
export const HISTORICAL_COMPOSITION: HistoricalDataPoint[] = [
  { year: 1980, intragovernmental: 0.19, foreign: 0.12, federalReserve: 0.12, domesticPrivate: 0.48, total: 0.91 },
  { year: 1985, intragovernmental: 0.35, foreign: 0.20, federalReserve: 0.18, domesticPrivate: 1.12, total: 1.85 },
  { year: 1990, intragovernmental: 0.80, foreign: 0.40, federalReserve: 0.23, domesticPrivate: 1.77, total: 3.20 },
  { year: 1995, intragovernmental: 1.30, foreign: 0.80, federalReserve: 0.39, domesticPrivate: 2.41, total: 4.90 },
  { year: 2000, intragovernmental: 2.20, foreign: 1.00, federalReserve: 0.51, domesticPrivate: 1.90, total: 5.61 },
  { year: 2005, intragovernmental: 3.30, foreign: 1.90, federalReserve: 0.74, domesticPrivate: 2.00, total: 7.94 },
  { year: 2008, intragovernmental: 4.00, foreign: 2.50, federalReserve: 0.48, domesticPrivate: 3.00, total: 9.98 },
  { year: 2010, intragovernmental: 4.50, foreign: 4.00, federalReserve: 1.00, domesticPrivate: 4.00, total: 13.50 },
  { year: 2015, intragovernmental: 5.20, foreign: 6.10, federalReserve: 2.50, domesticPrivate: 4.30, total: 18.10 },
  { year: 2019, intragovernmental: 5.90, foreign: 6.70, federalReserve: 2.30, domesticPrivate: 7.80, total: 22.70 },
  { year: 2020, intragovernmental: 6.00, foreign: 7.00, federalReserve: 4.70, domesticPrivate: 9.30, total: 27.00 },
  { year: 2022, intragovernmental: 6.50, foreign: 7.30, federalReserve: 5.70, domesticPrivate: 11.5, total: 31.00 },
  { year: 2025, intragovernmental: 7.20, foreign: 9.10, federalReserve: 4.19, domesticPrivate: 15.5, total: 35.99 },
];

// Stablecoin-specific data
export const STABLECOIN_DATA = {
  totalMarketCap: 307, // Billions USD
  estimatedTBillHoldings: 155, // Billions USD (direct T-Bill exposure)
  majorIssuers: [
    { name: 'Tether (USDT)', marketCap: 140, estimatedTBills: 90 },
    { name: 'Circle (USDC)', marketCap: 45, estimatedTBills: 40 },
    { name: 'Other', marketCap: 122, estimatedTBills: 25 },
  ],
  lastUpdated: '2025-11-01',
  source: 'DefiLlama / CoinGecko',
};

// Federal Reserve Holdings
export const FED_HOLDINGS = {
  totalSOMA: 4.19, // Trillions
  treasurySecurities: 4.19,
  peakHoldings: 8.0, // Peak during QE
  qtStartDate: '2022-06-01',
  lastUpdated: '2025-11-01',
  source: 'Federal Reserve H.4.1',
};

// Foreign Holdings Top 10
export const FOREIGN_HOLDERS = [
  { country: 'Japan', holdings: 1.15, change: -0.05 },
  { country: 'China', holdings: 0.73, change: -0.15 },
  { country: 'United Kingdom', holdings: 0.90, change: 0.10 },
  { country: 'Luxembourg', holdings: 0.42, change: 0.05 },
  { country: 'Cayman Islands', holdings: 0.35, change: 0.02 },
  { country: 'Ireland', holdings: 0.34, change: -0.01 },
  { country: 'Belgium', holdings: 0.33, change: 0.03 },
  { country: 'Switzerland', holdings: 0.30, change: 0.01 },
  { country: 'Canada', holdings: 0.28, change: 0.04 },
  { country: 'Taiwan', holdings: 0.27, change: 0.02 },
];

/**
 * Helper function to get ownership data formatted for Sankey chart
 */
export function getOwnershipSankeyData() {
  return {
    nodes: OWNERSHIP_NODES.map(n => n.label),
    nodeColors: OWNERSHIP_NODES.map(n => n.color),
    links: OWNERSHIP_LINKS,
    lastUpdated: OWNERSHIP_DATA_LAST_UPDATED,
  };
}

/**
 * Scale ownership data based on live total debt
 * Used when we fetch live debt_to_penny and want to proportionally adjust
 */
export function scaleOwnershipData(liveTotal: number): typeof OWNERSHIP_NODES {
  const baseTotal = OWNERSHIP_NODES[0].value;
  const scaleFactor = liveTotal / baseTotal;
  
  return OWNERSHIP_NODES.map(node => ({
    ...node,
    value: parseFloat((node.value * scaleFactor).toFixed(2)),
  }));
}

