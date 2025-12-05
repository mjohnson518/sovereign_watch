/**
 * Data Sanitizers
 * 
 * Functions to clean and normalize raw Treasury API data.
 * Handles the "numbers as strings with commas" issue and inconsistent labels.
 */

import type {
  RawMarketSecurityRecord,
  RawAuctionRecord,
  RawDebtRecord,
  CleanedSecurity,
  CleanedAuction,
  CleanedDebtSnapshot,
} from '../types/treasury';

/**
 * Parse a string number with commas to a float
 * Examples: "1,250.50" -> 1250.50, "N/A" -> null
 */
export function parseAmount(value: string | null | undefined): number | null {
  if (!value || value === 'N/A' || value === 'null' || value.trim() === '') {
    return null;
  }
  
  // Remove commas and any non-numeric characters except decimal point and minus
  const cleaned = value.toString().replace(/[,\s$]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse a string to a number, returning null for invalid values
 */
export function parseNumber(value: string | null | undefined): number | null {
  if (!value || value === 'N/A' || value === 'null' || value.trim() === '') {
    return null;
  }
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Normalize date to ISO-8601 format (YYYY-MM-DD)
 * Handles various input formats from Treasury API
 */
export function normalizeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr === 'N/A' || dateStr.trim() === '') {
    return null;
  }
  
  try {
    // Treasury API typically returns YYYY-MM-DD already
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Extract year from date string
 */
export function extractYear(dateStr: string | null | undefined): number | null {
  const normalized = normalizeDate(dateStr);
  if (!normalized) return null;
  
  const year = parseInt(normalized.substring(0, 4), 10);
  return isNaN(year) ? null : year;
}

/**
 * Map raw security type description to standardized enum
 */
export function normalizeSecurityType(
  desc: string | null | undefined
): 'BILL' | 'NOTE' | 'BOND' | 'TIPS' | 'FRN' | 'OTHER' {
  if (!desc) return 'OTHER';
  
  const lower = desc.toLowerCase();
  
  if (lower.includes('bill')) return 'BILL';
  if (lower.includes('tips') || lower.includes('inflation')) return 'TIPS';
  if (lower.includes('floating') || lower.includes('frn')) return 'FRN';
  if (lower.includes('note')) return 'NOTE';
  if (lower.includes('bond')) return 'BOND';
  
  return 'OTHER';
}

/**
 * Map raw auction security type to standardized enum
 */
export function normalizeAuctionSecurityType(
  type: string | null | undefined
): 'BILL' | 'NOTE' | 'BOND' | 'TIPS' | 'FRN' | 'CMB' {
  if (!type) return 'NOTE'; // Default
  
  const lower = type.toLowerCase();
  
  if (lower.includes('bill')) return 'BILL';
  if (lower.includes('tips') || lower.includes('inflation')) return 'TIPS';
  if (lower.includes('floating') || lower.includes('frn')) return 'FRN';
  if (lower.includes('cmb') || lower.includes('cash management')) return 'CMB';
  if (lower.includes('bond')) return 'BOND';
  if (lower.includes('note')) return 'NOTE';
  
  return 'NOTE';
}

/**
 * Clean and validate a raw security record
 */
export function cleanSecurityRecord(raw: RawMarketSecurityRecord): CleanedSecurity | null {
  const outstandingAmount = parseAmount(raw.outstanding_amt);
  
  // Skip records with no outstanding amount
  if (outstandingAmount === null || outstandingAmount <= 0) {
    return null;
  }
  
  const maturityDate = normalizeDate(raw.maturity_date);
  
  return {
    recordDate: normalizeDate(raw.record_date) || raw.record_date,
    cusip: raw.cusip || null,
    securityType: normalizeSecurityType(raw.security_type_desc),
    securityTypeDesc: raw.security_type_desc || '',
    securityClass: raw.security_class || null,
    issueDate: normalizeDate(raw.issue_date),
    maturityDate,
    maturityYear: extractYear(raw.maturity_date),
    outstandingAmount,
    interestRate: parseNumber(raw.interest_rate),
  };
}

/**
 * Clean and validate a raw auction record
 */
export function cleanAuctionRecord(raw: RawAuctionRecord): CleanedAuction | null {
  const bidToCoverRatio = parseNumber(raw.bid_to_cover_ratio);
  
  // Skip records without bid-to-cover ratio
  if (bidToCoverRatio === null) {
    return null;
  }
  
  return {
    auctionDate: normalizeDate(raw.auction_date) || raw.auction_date,
    issueDate: normalizeDate(raw.issue_date),
    maturityDate: normalizeDate(raw.maturity_date),
    securityType: normalizeAuctionSecurityType(raw.security_type),
    securityTypeRaw: raw.security_type || '',
    securityTerm: raw.security_term || null,
    cusip: raw.cusip || null,
    bidToCoverRatio,
    highYield: parseNumber(raw.high_yield),
    highDiscountRate: parseNumber(raw.high_discount_rate),
    offeringAmount: parseAmount(raw.offering_amt),
    acceptedAmount: parseAmount(raw.accepted_amt),
    totalTendersAccepted: parseAmount(raw.total_tendered),
  };
}

/**
 * Clean and validate a raw debt record
 */
export function cleanDebtRecord(raw: RawDebtRecord): CleanedDebtSnapshot | null {
  const totalPublicDebt = parseAmount(raw.tot_pub_debt_out_amt);
  
  if (totalPublicDebt === null) {
    return null;
  }
  
  return {
    recordDate: normalizeDate(raw.record_date) || raw.record_date,
    totalPublicDebt,
    debtHeldByPublic: parseAmount(raw.debt_held_public_amt),
    intragovernmentalHoldings: parseAmount(raw.intragov_hold_amt),
  };
}

/**
 * Batch clean security records
 */
export function cleanSecurityRecords(
  records: RawMarketSecurityRecord[]
): CleanedSecurity[] {
  return records
    .map(cleanSecurityRecord)
    .filter((r): r is CleanedSecurity => r !== null);
}

/**
 * Batch clean auction records
 */
export function cleanAuctionRecords(
  records: RawAuctionRecord[]
): CleanedAuction[] {
  return records
    .map(cleanAuctionRecord)
    .filter((r): r is CleanedAuction => r !== null);
}

