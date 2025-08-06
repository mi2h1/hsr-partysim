-- Add version column to characters table
ALTER TABLE characters ADD COLUMN version VARCHAR(10) DEFAULT '1.0';

-- Update existing characters with their implementation versions
-- Assuming these are the current characters and their versions
UPDATE characters SET version = '1.0' WHERE name = 'ロビン';
UPDATE characters SET version = '1.1' WHERE name = 'スパークル'; 
UPDATE characters SET version = '1.2' WHERE name = 'ルアン・メェイ';
UPDATE characters SET version = '1.3' WHERE name = 'サンデー';
UPDATE characters SET version = '1.4' WHERE name = 'トパーズ';
UPDATE characters SET version = '2.0' WHERE name = '雲璃';
UPDATE characters SET version = '2.1' WHERE name = 'セイレンス';
UPDATE characters SET version = '2.2' WHERE name = 'ケリュドラ';