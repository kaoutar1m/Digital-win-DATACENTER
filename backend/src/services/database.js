"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Nombre max de connexions
    idleTimeoutMillis: 30000, // Timeout après 30s d'inactivité
    connectionTimeoutMillis: 2000, // Timeout de connexion 2s
});
// Test de connexion au démarrage
pool.on('connect', function () {
    console.log('✅ Database connected successfully');
});
pool.on('error', function (err) {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1);
});
// Vérifier la connexion
pool.query('SELECT NOW()', function (err, res) {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    }
    else {
        console.log('🕐 Database time:', res.rows[0].now);
    }
});
exports.default = pool;
