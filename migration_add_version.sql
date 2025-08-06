-- Add version column to characters table (nullable)
ALTER TABLE characters ADD COLUMN version VARCHAR(10) DEFAULT NULL;

-- Version values will be manually set by admin
-- Existing characters will remain NULL until manually updated