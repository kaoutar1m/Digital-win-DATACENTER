import fs from 'fs';
import path from 'path';
import pool from '../services/database';

const sqlPath = path.join(__dirname, '../../../database/init.sql');

async function run() {
  try {
    console.log('📄 Reading SQL file:', sqlPath);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    if (!sql || sql.trim().length === 0) {
      console.error('❌ SQL file is empty or not found');
      process.exit(1);
    }

    console.log('🚀 Executing SQL...');
    await pool.query(sql);
    console.log('✅ Database initialized successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  }
}

run();
