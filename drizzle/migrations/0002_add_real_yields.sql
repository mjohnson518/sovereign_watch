-- Add Real Yield and Breakeven columns to economic_indicators
ALTER TABLE economic_indicators ADD COLUMN IF NOT EXISTS real_yield_10y DECIMAL(6, 4);
ALTER TABLE economic_indicators ADD COLUMN IF NOT EXISTS breakeven_10y DECIMAL(6, 4);

