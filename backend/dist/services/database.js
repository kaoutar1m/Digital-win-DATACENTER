"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSensors = void 0;
const pg_1 = require("pg");
require("dotenv/config");
const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
const pool = new pg_1.Pool(poolConfig);
pool.on('connect', (client) => {
    console.log('✅ Database pool connected');
});
pool.on('error', (err, client) => {
    console.error('❌ Unexpected database error:', err.message);
    process.exit(-1);
});
const testConnection = async () => {
    try {
        const result = await pool.query('SELECT NOW() as time');
        if (result.rows.length > 0 && result.rows[0]) {
            console.log('✅ Database connection successful');
            console.log('🕐 Server time:', result.rows[0].time);
        }
        else {
            console.log('✅ Database connection successful (no time data)');
        }
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
        console.error('❌ Database connection failed:', errorMessage);
        process.exit(1);
    }
};
const getSensors = async () => {
    try {
        const result = await pool.query('SELECT * FROM sensors ORDER BY name');
        return result.rows;
    }
    catch (err) {
        console.error('Error fetching sensors:', err);
        throw err;
    }
};
exports.getSensors = getSensors;
testConnection();
exports.default = pool;
//# sourceMappingURL=database.js.map