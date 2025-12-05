-- Sovereign Watch Database Schema
-- Initial migration for Treasury data storage

-- Create custom enum types
DO $$ BEGIN
    CREATE TYPE security_type AS ENUM ('BILL', 'NOTE', 'BOND', 'TIPS', 'FRN', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auction_security_type AS ENUM ('BILL', 'NOTE', 'BOND', 'TIPS', 'FRN', 'CMB');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Treasury Securities Table (from MSPD Table 3)
CREATE TABLE IF NOT EXISTS treasury_securities (
    id SERIAL PRIMARY KEY,
    
    -- Record identification
    record_date DATE NOT NULL,
    cusip VARCHAR(20),
    
    -- Security details
    security_type security_type NOT NULL,
    security_type_desc VARCHAR(100),
    security_class VARCHAR(50),
    
    -- Dates
    issue_date DATE,
    maturity_date DATE,
    maturity_year INTEGER,
    
    -- Amounts (stored in dollars)
    outstanding_amount DECIMAL(20, 2) NOT NULL,
    
    -- Interest
    interest_rate DECIMAL(6, 4),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for treasury_securities
CREATE UNIQUE INDEX IF NOT EXISTS securities_record_cusip_idx 
    ON treasury_securities(record_date, cusip);
CREATE INDEX IF NOT EXISTS securities_maturity_year_idx 
    ON treasury_securities(maturity_year);
CREATE INDEX IF NOT EXISTS securities_security_type_idx 
    ON treasury_securities(security_type);
CREATE INDEX IF NOT EXISTS securities_record_date_idx 
    ON treasury_securities(record_date);

-- Treasury Auctions Table (from auctions_query)
CREATE TABLE IF NOT EXISTS treasury_auctions (
    id SERIAL PRIMARY KEY,
    
    -- Auction identification
    auction_date DATE NOT NULL,
    issue_date DATE,
    maturity_date DATE,
    
    -- Security details
    security_type auction_security_type NOT NULL,
    security_type_raw VARCHAR(100),
    security_term VARCHAR(50),
    cusip VARCHAR(20),
    
    -- Auction metrics
    bid_to_cover_ratio DECIMAL(6, 4),
    high_yield DECIMAL(8, 5),
    high_discount_rate DECIMAL(8, 5),
    
    -- Amounts
    offering_amount DECIMAL(20, 2),
    accepted_amount DECIMAL(20, 2),
    total_tenders_accepted DECIMAL(20, 2),
    
    -- Bidder composition
    direct_bidder_accepted DECIMAL(20, 2),
    indirect_bidder_accepted DECIMAL(20, 2),
    primary_dealer_accepted DECIMAL(20, 2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for treasury_auctions
CREATE UNIQUE INDEX IF NOT EXISTS auctions_date_cusip_idx 
    ON treasury_auctions(auction_date, cusip);
CREATE INDEX IF NOT EXISTS auctions_auction_date_idx 
    ON treasury_auctions(auction_date);
CREATE INDEX IF NOT EXISTS auctions_security_type_idx 
    ON treasury_auctions(security_type);

-- Daily Debt Snapshots (from debt_to_penny)
CREATE TABLE IF NOT EXISTS daily_debt_snapshots (
    id SERIAL PRIMARY KEY,
    
    -- Record date
    record_date DATE NOT NULL UNIQUE,
    
    -- Debt amounts (in dollars)
    total_public_debt DECIMAL(20, 2) NOT NULL,
    debt_held_by_public DECIMAL(20, 2),
    intragovernmental_holdings DECIMAL(20, 2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for daily_debt_snapshots
CREATE INDEX IF NOT EXISTS debt_snapshots_record_date_idx 
    ON daily_debt_snapshots(record_date);

-- Maturity Wall Aggregates (pre-computed for fast API responses)
CREATE TABLE IF NOT EXISTS maturity_wall_aggregates (
    id SERIAL PRIMARY KEY,
    
    -- Aggregation period
    computed_date DATE NOT NULL,
    maturity_year INTEGER NOT NULL,
    
    -- Amounts by security type (in dollars)
    bills_amount DECIMAL(20, 2) DEFAULT 0,
    notes_amount DECIMAL(20, 2) DEFAULT 0,
    bonds_amount DECIMAL(20, 2) DEFAULT 0,
    tips_amount DECIMAL(20, 2) DEFAULT 0,
    frn_amount DECIMAL(20, 2) DEFAULT 0,
    total_amount DECIMAL(20, 2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for maturity_wall_aggregates
CREATE UNIQUE INDEX IF NOT EXISTS maturity_agg_date_year_idx 
    ON maturity_wall_aggregates(computed_date, maturity_year);
CREATE INDEX IF NOT EXISTS maturity_agg_computed_date_idx 
    ON maturity_wall_aggregates(computed_date);

-- ETL Job Log (for tracking ingestion runs)
CREATE TABLE IF NOT EXISTS etl_job_log (
    id SERIAL PRIMARY KEY,
    
    job_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'started', 'completed', 'failed'
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP
);

-- Indexes for etl_job_log
CREATE INDEX IF NOT EXISTS etl_job_name_idx 
    ON etl_job_log(job_name);
CREATE INDEX IF NOT EXISTS etl_started_at_idx 
    ON etl_job_log(started_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables with updated_at column
DROP TRIGGER IF EXISTS update_treasury_securities_updated_at ON treasury_securities;
CREATE TRIGGER update_treasury_securities_updated_at
    BEFORE UPDATE ON treasury_securities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_treasury_auctions_updated_at ON treasury_auctions;
CREATE TRIGGER update_treasury_auctions_updated_at
    BEFORE UPDATE ON treasury_auctions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE treasury_securities IS 'MSPD Table 3 market securities with CUSIP-level detail';
COMMENT ON TABLE treasury_auctions IS 'Treasury auction results with bid-to-cover ratios';
COMMENT ON TABLE daily_debt_snapshots IS 'Daily total debt from debt_to_penny API';
COMMENT ON TABLE maturity_wall_aggregates IS 'Pre-computed maturity wall data for fast API responses';
COMMENT ON TABLE etl_job_log IS 'ETL job execution history for monitoring';

