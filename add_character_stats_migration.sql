-- キャラクターステータス項目追加マイグレーション
-- 実行時期: charactersテーブル既存データ保持のため

-- 基礎ステータス項目を追加
ALTER TABLE characters ADD COLUMN hp INTEGER;
ALTER TABLE characters ADD COLUMN attack INTEGER;
ALTER TABLE characters ADD COLUMN defense INTEGER;
ALTER TABLE characters ADD COLUMN speed INTEGER;
ALTER TABLE characters ADD COLUMN ep INTEGER;

-- ステータスブースト項目を追加（分離型設計）
ALTER TABLE characters ADD COLUMN stat_boost_1_type VARCHAR(20);
ALTER TABLE characters ADD COLUMN stat_boost_1_value DECIMAL(5,1);
ALTER TABLE characters ADD COLUMN stat_boost_2_type VARCHAR(20);
ALTER TABLE characters ADD COLUMN stat_boost_2_value DECIMAL(5,1);
ALTER TABLE characters ADD COLUMN stat_boost_3_type VARCHAR(20);
ALTER TABLE characters ADD COLUMN stat_boost_3_value DECIMAL(5,1);

-- 確認用：テーブル構造表示
-- \d characters;