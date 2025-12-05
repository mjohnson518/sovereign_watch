/**
 * Database Schema for Sovereign Watch
 * 
 * This schema defines the PostgreSQL tables for storing Treasury data.
 * Uses Drizzle ORM for type-safe database operations.
 */

import {
  pgTable,
  serial,
  varchar,
  decimal,
  date,
  timestamp,
  integer,
  text,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// Enums for consistent categorization
export const securityTypeEnum = pgEnum('security_type', [
  'BILL',
  'NOTE',
  'BOND',
  'TIPS',
  'FRN',
  'OTHER',
]);

export const auctionSecurityTypeEnum = pgEnum('auction_security_type', [
  'BILL',
  'NOTE',
  'BOND',
  'TIPS',
  'FRN',
  'CMB',
]);

// Treasury Securities Table (from MSPD Table 3)
export const treasurySecurities = pgTable(
  'treasury_securities',
  {
    id: serial('id').primaryKey(),
    
    // Record identification
    recordDate: date('record_date').notNull(),
    cusip: varchar('cusip', { length: 20 }),
    
    // Security details
    securityType: securityTypeEnum('security_type').notNull(),
    securityTypeDesc: varchar('security_type_desc', { length: 100 }),
    securityClass: varchar('security_class', { length: 50 }),
    
    // Dates
    issueDate: date('issue_date'),
    maturityDate: date('maturity_date'),
    maturityYear: integer('maturity_year'),
    
    // Amounts (stored in dollars, converted from string on ingest)
    outstandingAmount: decimal('outstanding_amount', { precision: 20, scale: 2 }).notNull(),
    
    // Interest
    interestRate: decimal('interest_rate', { precision: 6, scale: 4 }),
    
    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('securities_record_cusip_idx').on(table.recordDate, table.cusip),
    index('securities_maturity_year_idx').on(table.maturityYear),
    index('securities_security_type_idx').on(table.securityType),
    index('securities_record_date_idx').on(table.recordDate),
  ]
);

// Treasury Auctions Table (from auctions_query)
export const treasuryAuctions = pgTable(
  'treasury_auctions',
  {
    id: serial('id').primaryKey(),
    
    // Auction identification
    auctionDate: date('auction_date').notNull(),
    issueDate: date('issue_date'),
    maturityDate: date('maturity_date'),
    
    // Security details
    securityType: auctionSecurityTypeEnum('security_type').notNull(),
    securityTypeRaw: varchar('security_type_raw', { length: 100 }),
    securityTerm: varchar('security_term', { length: 50 }),
    cusip: varchar('cusip', { length: 20 }),
    
    // Auction metrics
    bidToCoverRatio: decimal('bid_to_cover_ratio', { precision: 6, scale: 4 }),
    highYield: decimal('high_yield', { precision: 8, scale: 5 }),
    highDiscountRate: decimal('high_discount_rate', { precision: 8, scale: 5 }),
    
    // Amounts
    offeringAmount: decimal('offering_amount', { precision: 20, scale: 2 }),
    acceptedAmount: decimal('accepted_amount', { precision: 20, scale: 2 }),
    totalTendersAccepted: decimal('total_tenders_accepted', { precision: 20, scale: 2 }),
    
    // Bidder composition
    directBidderAccepted: decimal('direct_bidder_accepted', { precision: 20, scale: 2 }),
    indirectBidderAccepted: decimal('indirect_bidder_accepted', { precision: 20, scale: 2 }),
    primaryDealerAccepted: decimal('primary_dealer_accepted', { precision: 20, scale: 2 }),
    
    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('auctions_date_cusip_idx').on(table.auctionDate, table.cusip),
    index('auctions_auction_date_idx').on(table.auctionDate),
    index('auctions_security_type_idx').on(table.securityType),
  ]
);

// Daily Debt Snapshots (from debt_to_penny)
export const dailyDebtSnapshots = pgTable(
  'daily_debt_snapshots',
  {
    id: serial('id').primaryKey(),
    
    // Record date
    recordDate: date('record_date').notNull().unique(),
    
    // Debt amounts (in dollars)
    totalPublicDebt: decimal('total_public_debt', { precision: 20, scale: 2 }).notNull(),
    debtHeldByPublic: decimal('debt_held_by_public', { precision: 20, scale: 2 }),
    intragovernmentalHoldings: decimal('intragovernmental_holdings', { precision: 20, scale: 2 }),
    
    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('debt_snapshots_record_date_idx').on(table.recordDate),
  ]
);

// Maturity Wall Aggregates (pre-computed for fast API responses)
export const maturityWallAggregates = pgTable(
  'maturity_wall_aggregates',
  {
    id: serial('id').primaryKey(),
    
    // Aggregation period
    computedDate: date('computed_date').notNull(),
    maturityYear: integer('maturity_year').notNull(),
    
    // Amounts by security type (in dollars)
    billsAmount: decimal('bills_amount', { precision: 20, scale: 2 }).default('0'),
    notesAmount: decimal('notes_amount', { precision: 20, scale: 2 }).default('0'),
    bondsAmount: decimal('bonds_amount', { precision: 20, scale: 2 }).default('0'),
    tipsAmount: decimal('tips_amount', { precision: 20, scale: 2 }).default('0'),
    frnAmount: decimal('frn_amount', { precision: 20, scale: 2 }).default('0'),
    totalAmount: decimal('total_amount', { precision: 20, scale: 2 }).default('0'),
    
    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('maturity_agg_date_year_idx').on(table.computedDate, table.maturityYear),
    index('maturity_agg_computed_date_idx').on(table.computedDate),
  ]
);

// Economic Indicators (Health Metrics)
export const economicIndicators = pgTable(
  'economic_indicators',
  {
    id: serial('id').primaryKey(),
    
    // Record date (usually quarterly for GDP, daily/monthly for others)
    recordDate: date('record_date').notNull().unique(),
    
    // GDP & Ratios
    gdp: decimal('gdp', { precision: 20, scale: 2 }), // Annualized GDP
    debtToGdpRatio: decimal('debt_to_gdp_ratio', { precision: 8, scale: 4 }),
    
    // Interest Expense
    interestExpense: decimal('interest_expense', { precision: 20, scale: 2 }), // Annualized interest expense
    averageInterestRate: decimal('average_interest_rate', { precision: 6, scale: 4 }),
    
    // Yield Curve (10Y - 2Y)
    yield10y: decimal('yield_10y', { precision: 6, scale: 4 }),
    yield2y: decimal('yield_2y', { precision: 6, scale: 4 }),
    yieldCurveSpread: decimal('yield_curve_spread', { precision: 6, scale: 4 }), // 10Y - 2Y
    
    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('indicators_record_date_idx').on(table.recordDate),
  ]
);

// ETL Job Log (for tracking ingestion runs)
export const etlJobLog = pgTable(
  'etl_job_log',
  {
    id: serial('id').primaryKey(),
    
    jobName: varchar('job_name', { length: 100 }).notNull(),
    status: varchar('status', { length: 20 }).notNull(), // 'started', 'completed', 'failed'
    recordsProcessed: integer('records_processed').default(0),
    errorMessage: text('error_message'),
    
    startedAt: timestamp('started_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('etl_job_name_idx').on(table.jobName),
    index('etl_started_at_idx').on(table.startedAt),
  ]
);

// Type exports for use in application code
export type TreasurySecurity = typeof treasurySecurities.$inferSelect;
export type NewTreasurySecurity = typeof treasurySecurities.$inferInsert;

export type TreasuryAuction = typeof treasuryAuctions.$inferSelect;
export type NewTreasuryAuction = typeof treasuryAuctions.$inferInsert;

export type DailyDebtSnapshot = typeof dailyDebtSnapshots.$inferSelect;
export type NewDailyDebtSnapshot = typeof dailyDebtSnapshots.$inferInsert;

export type MaturityWallAggregate = typeof maturityWallAggregates.$inferSelect;
export type NewMaturityWallAggregate = typeof maturityWallAggregates.$inferInsert;

export type EconomicIndicator = typeof economicIndicators.$inferSelect;
export type NewEconomicIndicator = typeof economicIndicators.$inferInsert;

export type EtlJobLog = typeof etlJobLog.$inferSelect;
export type NewEtlJobLog = typeof etlJobLog.$inferInsert;
