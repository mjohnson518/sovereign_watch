/**
 * Treasury Data Types
 * 
 * Type definitions for Treasury API responses and application data structures.
 */

// Raw API Response Types (what Treasury API returns)
export interface TreasuryApiResponse<T> {
  data: T[];
  meta: {
    count: number;
    labels: Record<string, string>;
    dataTypes: Record<string, string>;
    dataFormats: Record<string, string>;
    'total-count': number;
    'total-pages': number;
  };
  links: {
    self: string;
    first: string;
    prev: string | null;
    next: string | null;
    last: string;
  };
}

// Raw MSPD Table 3 Record (securities detail)
export interface RawSecurityRecord {
  record_date: string;
  security_type_desc: string;
  security_class_desc: string;
  debt_held_public_mil_amt: string;
  intragov_hold_mil_amt: string;
  total_mil_amt: string;
  src_line_nbr: string;
  record_fiscal_year: string;
  record_fiscal_quarter: string;
  record_calendar_year: string;
  record_calendar_quarter: string;
  record_calendar_month: string;
  record_calendar_day: string;
}

// Raw MSPD Table 3 Market Record (CUSIP-level detail)
export interface RawMarketSecurityRecord {
  record_date: string;
  security_type_desc: string;
  security_class: string;
  cusip: string;
  issue_date: string;
  maturity_date: string;
  outstanding_amt: string; // Note: This is a string with commas
  interest_rate: string;
  yield: string;
  spread: string;
}

// Raw Auction Record
export interface RawAuctionRecord {
  auction_date: string;
  issue_date: string;
  maturity_date: string;
  security_type: string;
  security_term: string;
  cusip: string;
  bid_to_cover_ratio: string;
  high_yield: string;
  high_discount_rate: string;
  offering_amt: string;
  accepted_amt: string;
  total_tendered: string;
  direct_bidder_accepted_amt?: string;
  indirect_bidder_accepted_amt?: string;
  primary_dealer_accepted_amt?: string;
}

// Raw Debt to Penny Record
export interface RawDebtRecord {
  record_date: string;
  tot_pub_debt_out_amt: string;
  debt_held_public_amt: string;
  intragov_hold_amt: string;
}

// Raw Interest Expense Record
export interface RawInterestExpenseRecord {
  record_date: string;
  fy_td_expense_amt: string; // Fiscal Year To Date
  month_expense_amt: string; // Monthly
}

// Raw Average Interest Rate Record
export interface RawAvgInterestRateRecord {
  record_date: string;
  avg_interest_rate_amt: string;
}

// Cleaned/Normalized Application Types

export interface CleanedSecurity {
  recordDate: string; // ISO-8601
  cusip: string | null;
  securityType: 'BILL' | 'NOTE' | 'BOND' | 'TIPS' | 'FRN' | 'OTHER';
  securityTypeDesc: string;
  securityClass: string | null;
  issueDate: string | null;
  maturityDate: string | null;
  maturityYear: number | null;
  outstandingAmount: number; // In dollars
  interestRate: number | null;
}

export interface CleanedAuction {
  auctionDate: string;
  issueDate: string | null;
  maturityDate: string | null;
  securityType: 'BILL' | 'NOTE' | 'BOND' | 'TIPS' | 'FRN' | 'CMB';
  securityTypeRaw: string;
  securityTerm: string | null;
  cusip: string | null;
  bidToCoverRatio: number | null;
  highYield: number | null;
  highDiscountRate: number | null;
  offeringAmount: number | null;
  acceptedAmount: number | null;
  totalTendersAccepted: number | null;
  directBidderAccepted: number | null;
  indirectBidderAccepted: number | null;
  primaryDealerAccepted: number | null;
}

export interface CleanedDebtSnapshot {
  recordDate: string;
  totalPublicDebt: number;
  debtHeldByPublic: number | null;
  intragovernmentalHoldings: number | null;
}

export interface CleanedEconomicIndicator {
  recordDate: string;
  interestExpense: number | null; // Annualized based on monthly or FYTD
  averageInterestRate: number | null;
}

// API Response Types (what we serve to frontend)

export interface MaturityWallData {
  year: number;
  bills: number;
  notes: number;
  bonds: number;
  tips: number;
  frn: number;
  total: number;
}

export interface AuctionDemandData {
  date: string;
  ratio: number;
  type: string;
  term: string | null;
  direct?: number;
  indirect?: number;
  dealers?: number;
  accepted?: number;
}

export interface DebtSummary {
  totalDebt: number;
  totalDebtFormatted: string;
  debtHeldByPublic: number | null;
  intragovernmental: number | null;
  lastUpdated: string;
}

export interface OwnershipNode {
  id: string;
  label: string;
  value: number; // In trillions
  color: string;
}

export interface OwnershipLink {
  source: number;
  target: number;
  value: number;
}

export interface OwnershipData {
  nodes: OwnershipNode[];
  links: OwnershipLink[];
  lastUpdated: string;
}

// Historical Data Point
export interface HistoricalDataPoint {
  year: number;
  intragovernmental: number;
  foreign: number;
  federalReserve: number;
  domesticPrivate: number;
  total: number;
}

export interface HealthMetrics {
  debtToGdp: number | null;
  interestExpense: number | null; // Annualized in Billions
  averageInterestRate: number | null;
  yieldCurveSpread: number | null; // 10Y - 2Y
  lastUpdated: string;
}
