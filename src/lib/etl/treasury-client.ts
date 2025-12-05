/**
 * Treasury API Client
 * 
 * Handles fetching data from the US Treasury Fiscal Data API.
 * Implements proper error handling, rate limiting, and pagination.
 */

import type {
  TreasuryApiResponse,
  RawMarketSecurityRecord,
  RawAuctionRecord,
  RawDebtRecord,
  RawInterestExpenseRecord,
  RawAvgInterestRateRecord,
} from '../types/treasury';

const BASE_URL = process.env.TREASURY_API_BASE_URL || 'https://api.fiscaldata.treasury.gov';

// Rate limiting: Treasury API allows 1000 requests per hour
const RATE_LIMIT_DELAY = 100; // ms between requests

interface FetchOptions {
  pageSize?: number;
  sort?: string;
  filter?: string;
  fields?: string[];
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchFromTreasury<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<TreasuryApiResponse<T>> {
  const { pageSize = 1000, sort, filter, fields } = options;
  
  const params = new URLSearchParams();
  params.set('page[size]', pageSize.toString());
  
  if (sort) params.set('sort', sort);
  if (filter) params.set('filter', filter);
  if (fields?.length) params.set('fields', fields.join(','));
  
  const url = `${BASE_URL}${endpoint}?${params.toString()}`;
  
  console.log(`[Treasury API] Fetching: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
  });
  
  if (!response.ok) {
    throw new Error(`Treasury API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as TreasuryApiResponse<T>;
  
  console.log(`[Treasury API] Received ${data.data.length} records (total: ${data.meta['total-count']})`);
  
  return data;
}

/**
 * Fetch all pages of data (with pagination)
 */
async function fetchAllPages<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T[]> {
  const allData: T[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const params = new URLSearchParams();
    params.set('page[size]', (options.pageSize || 1000).toString());
    params.set('page[number]', page.toString());
    
    if (options.sort) params.set('sort', options.sort);
    if (options.filter) params.set('filter', options.filter);
    if (options.fields?.length) params.set('fields', options.fields.join(','));
    
    const url = `${BASE_URL}${endpoint}?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Treasury API error: ${response.status}`);
    }
    
    const result = await response.json() as TreasuryApiResponse<T>;
    allData.push(...result.data);
    
    hasMore = result.links.next !== null;
    page++;
    
    // Rate limiting
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }
  }
  
  return allData;
}

/**
 * Fetch the latest debt to penny data
 */
export async function fetchDebtToPenny(): Promise<RawDebtRecord | null> {
  try {
    const response = await fetchFromTreasury<RawDebtRecord>(
      '/services/api/fiscal_service/v2/accounting/od/debt_to_penny',
      {
        pageSize: 1,
        sort: '-record_date',
      }
    );
    
    return response.data[0] || null;
  } catch (error) {
    console.error('[Treasury API] Error fetching debt_to_penny:', error);
    throw error;
  }
}

/**
 * Fetch MSPD Table 3 Market data (CUSIP-level securities)
 * This is the detailed data needed for the maturity wall
 */
export async function fetchSecuritiesDetail(
  pageSize: number = 5000
): Promise<RawMarketSecurityRecord[]> {
  try {
    const response = await fetchFromTreasury<RawMarketSecurityRecord>(
      '/services/api/fiscal_service/v1/debt/mspd/mspd_table_3_market',
      {
        pageSize,
        sort: '-record_date',
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('[Treasury API] Error fetching securities detail:', error);
    throw error;
  }
}

/**
 * Fetch auction data
 */
export async function fetchAuctions(
  pageSize: number = 10000
): Promise<RawAuctionRecord[]> {
  try {
    const response = await fetchFromTreasury<RawAuctionRecord>(
      '/services/api/fiscal_service/v1/accounting/od/auctions_query',
      {
        pageSize,
        sort: '-auction_date',
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('[Treasury API] Error fetching auctions:', error);
    throw error;
  }
}

/**
 * Fetch auctions since a specific date (for delta updates)
 */
export async function fetchAuctionsSince(
  sinceDate: string
): Promise<RawAuctionRecord[]> {
  try {
    const response = await fetchFromTreasury<RawAuctionRecord>(
      '/services/api/fiscal_service/v1/accounting/od/auctions_query',
      {
        pageSize: 1000,
        sort: '-auction_date',
        filter: `auction_date:gte:${sinceDate}`,
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('[Treasury API] Error fetching auctions since date:', error);
    throw error;
  }
}

/**
 * Fetch debt history for a date range
 */
export async function fetchDebtHistory(
  startDate: string,
  endDate: string
): Promise<RawDebtRecord[]> {
  try {
    const response = await fetchFromTreasury<RawDebtRecord>(
      '/services/api/fiscal_service/v2/accounting/od/debt_to_penny',
      {
        pageSize: 1000,
        sort: '-record_date',
        filter: `record_date:gte:${startDate},record_date:lte:${endDate}`,
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('[Treasury API] Error fetching debt history:', error);
    throw error;
  }
}

/**
 * Fetch interest expense data
 */
export async function fetchInterestExpense(): Promise<RawInterestExpenseRecord | null> {
  try {
    const response = await fetchFromTreasury<RawInterestExpenseRecord>(
      '/services/api/fiscal_service/v2/accounting/od/interest_expense',
      {
        pageSize: 1,
        sort: '-record_date',
      }
    );
    
    return response.data[0] || null;
  } catch (error) {
    console.error('[Treasury API] Error fetching interest expense:', error);
    throw error;
  }
}

/**
 * Fetch average interest rates
 */
export async function fetchAvgInterestRates(): Promise<RawAvgInterestRateRecord | null> {
  try {
    const response = await fetchFromTreasury<RawAvgInterestRateRecord>(
      '/services/api/fiscal_service/v2/accounting/od/avg_interest_rates',
      {
        pageSize: 1,
        sort: '-record_date',
      }
    );
    
    return response.data[0] || null;
  } catch (error) {
    console.error('[Treasury API] Error fetching avg interest rates:', error);
    throw error;
  }
}
