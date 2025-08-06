// データベース接続ライブラリ（修正版）
import { Pool } from 'pg';

// 接続プールを遅延初期化
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  // 開発時のデータベース接続チェック
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, skipping query:', text);
    return { rows: [] };
  }

  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

export { pool };