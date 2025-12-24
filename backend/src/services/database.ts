import { Pool, QueryResult, PoolClient } from 'pg';
import 'dotenv/config';

// Interface pour la configuration
interface DatabaseConfig {
  connectionString: string | undefined;
  ssl: boolean | { rejectUnauthorized: boolean };
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

// Configuration du pool
const poolConfig: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Créer le pool
const pool = new Pool(poolConfig);

// Interface pour le résultat de temps
interface TimeResult {
  time: Date;
}

// Interface pour les sensors
interface Sensor {
  id: number;
  name: string;
  type: string;
  zone_id: number;
  status: string;
  last_reading: number;
  unit: string;
  created_at: Date;
}

// Événements du pool
pool.on('connect', (client: PoolClient) => {
  console.log('✅ Database pool connected');
});

pool.on('error', (err: Error, client: PoolClient) => {
  console.error('❌ Unexpected database error:', err.message);
  process.exit(-1);
});

// Fonction de test de connexion
const testConnection = async (): Promise<void> => {
  try {
    const result: QueryResult<TimeResult> = await pool.query('SELECT NOW() as time');

    if (result.rows.length > 0 && result.rows[0]) {
      console.log('✅ Database connection successful');
      console.log('🕐 Server time:', result.rows[0].time);
    } else {
      console.log('✅ Database connection successful (no time data)');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
    console.error('❌ Database connection failed:', errorMessage);
    process.exit(1);
  }
};

// Fonction pour récupérer les sensors
export const getSensors = async (): Promise<Sensor[]> => {
  try {
    const result: QueryResult<Sensor> = await pool.query(
      'SELECT * FROM sensors ORDER BY name'
    );
    return result.rows;
  } catch (err) {
    console.error('Error fetching sensors:', err);
    throw err;
  }
};

// Exécuter le test au démarrage
testConnection();

export default pool;