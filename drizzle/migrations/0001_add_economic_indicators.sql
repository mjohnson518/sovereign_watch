-- Sovereign Watch Database Schema
-- Migration for Economic Indicators (Health Dashboard)

-- Create custom enum types (if they don't exist)
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

-- Treasury Securities Table
CREATE TABLE IF NOT EXISTS treasury_securities (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL,
    cusip VARCHAR(20),
    security_type security_type NOT NULL,
    security_type_desc VARCHAR(100),
    security_class VARCHAR(50),
    issue_date DATE,
    maturity_date DATE,
    maturity_year INTEGER,
    outstanding_amount DECIMAL(20, 2) NOT NULL,
    interest_rate DECIMAL(6, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS securities_record_cusip_idx ON treasury_securities(record_date, cusip);
CREATE INDEX IF NOT EXISTS securities_maturity_year_idx ON treasury_securities(maturity_year);
CREATE INDEX IF NOT EXISTS securities_security_type_idx ON treasury_securities(security_type);
CREATE INDEX IF NOT EXISTS securities_record_date_idx ON treasury_securities(record_date);

-- Treasury Auctions Table
CREATE TABLE IF NOT EXISTS treasury_auctions (
    id SERIAL PRIMARY KEY,
    auction_date DATE NOT NULL,
    issue_date DATE,
    maturity_date DATE,
    security_type auction_security_type NOT NULL,
    security_type_raw VARCHAR(100),
    security_term VARCHAR(50),
    cusip VARCHAR(20),
    bid_to_cover_ratio DECIMAL(6, 4),
    high_yield DECIMAL(8, 5),
    high_discount_rate DECIMAL(8, 5),
    offering_amount DECIMAL(20, 2),
    accepted_amount DECIMAL(20, 2),
    total_tenders_accepted DECIMAL(20, 2),
    direct_bidder_accepted DECIMAL(20, 2),
    indirect_bidder_accepted DECIMAL(20, 2),
    primary_dealer_accepted DECIMAL(20, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS auctions_date_cusip_idx ON treasury_auctions(auction_date, cusip);
CREATE INDEX IF NOT EXISTS auctions_auction_date_idx ON treasury_auctions(auction_date);
CREATE INDEX IF NOT EXISTS auctions_security_type_idx ON treasury_auctions(security_type);

-- Daily Debt Snapshots
CREATE TABLE IF NOT EXISTS daily_debt_snapshots (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL UNIQUE,
    total_public_debt DECIMAL(20, 2) NOT NULL,
    debt_held_by_public DECIMAL(20, 2),
    intragovernmental_holdings DECIMAL(20, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS debt_snapshots_record_date_idx ON daily_debt_snapshots(record_date);

-- Maturity Wall Aggregates
CREATE TABLE IF NOT EXISTS maturity_wall_aggregates (
    id SERIAL PRIMARY KEY,
    computed_date DATE NOT NULL,
    maturity_year INTEGER NOT NULL,
    bills_amount DECIMAL(20, 2) DEFAULT 0,
    notes_amount DECIMAL(20, 2) DEFAULT 0,
    bonds_amount DECIMAL(20, 2) DEFAULT 0,
    tips_amount DECIMAL(20, 2) DEFAULT 0,
    frn_amount DECIMAL(20, 2) DEFAULT 0,
    total_amount DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS maturity_agg_date_year_idx ON maturity_wall_aggregates(computed_date, maturity_year);
CREATE INDEX IF NOT EXISTS maturity_agg_computed_date_idx ON maturity_wall_aggregates(computed_date);

-- Economic Indicators (New)
CREATE TABLE IF NOT EXISTS economic_indicators (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL UNIQUE,
    gdp DECIMAL(20, 2),
    debt_to_gdp_ratio DECIMAL(8, 4),
    interest_expense DECIMAL(20, 2),
    average_interest_rate DECIMAL(6, 4),
    yield_10y DECIMAL(6, 4),
    yield_2y DECIMAL(6, 4),
    yield_curve_spread DECIMAL(6, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS indicators_record_date_idx ON economic_indicators(record_date);

-- ETL Job Log
CREATE TABLE IF NOT EXISTS etl_job_log (
    id SERIAL PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS etl_job_name_idx ON etl_job_log(job_name);
CREATE INDEX IF NOT EXISTS etl_started_at_idx ON etl_job_log(started_at);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_treasury_securities_updated_at ON treasury_securities;
CREATE TRIGGER update_treasury_securities_updated_at BEFORE UPDATE ON treasury_securities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_treasury_auctions_updated_at ON treasury_auctions;
CREATE TRIGGER update_treasury_auctions_updated_at BEFORE UPDATE ON treasury_auctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_economic_indicators_updated_at ON economic_indicators;
CREATE TRIGGER update_economic_indicators_updated_at BEFORE UPDATE ON economic_indicators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

