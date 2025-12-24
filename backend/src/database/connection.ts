import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  connectionString: string | undefined;
  ssl: boolean | { rejectUnauthorized: boolean };
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const poolConfig: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Database pool connected');
});

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected database error:', err.message);
  process.exit(-1);
});

// Test de connexion
const testConnection = async (): Promise<void> => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    console.log('✅ Database connection successful');
    console.log('🕐 Server time:', result.rows[0].time);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
    console.error('❌ Database connection failed:', errorMessage);
    process.exit(1);
  }
};

testConnection();

export default pool;