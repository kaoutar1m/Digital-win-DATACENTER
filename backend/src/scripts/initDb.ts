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

    console.log('🗑️ Dropping existing tables if they exist...');
    await pool.query(`
      DROP TABLE IF EXISTS sensors CASCADE;
      DROP TABLE IF EXISTS racks CASCADE;
      DROP TABLE IF EXISTS zones CASCADE;
    `);

    console.log('🚀 Executing SQL schema...');
    await pool.query(sql);
    console.log('✅ Database schema initialized successfully');

    console.log('📝 Inserting sample data...');

    // Insert sample zones
    console.log('🏢 Inserting zones...');
    await pool.query(`
      INSERT INTO zones (name, security_level, color, position) VALUES
      ('Public Entrance', 'public', '#00FF88', '{"x": 0, "y": 0, "z": 0}'),
      ('Server Room A', 'critical', '#FF6B6B', '{"x": 10, "y": 0, "z": 5}'),
      ('Network Room', 'sensitive', '#FFD166', '{"x": -10, "y": 0, "z": 5}'),
      ('Storage Area', 'restricted', '#4A90E2', '{"x": 0, "y": 0, "z": -10}'),
      ('Backup Generator', 'critical', '#9D4EDD', '{"x": 15, "y": 0, "z": -5}');
    `);

    // Insert sample racks
    console.log('🗂️ Inserting racks...');
    await pool.query(`
      INSERT INTO racks (zone_id, name, status, temperature, power_usage, position, rotation, scale) VALUES
      ((SELECT id FROM zones WHERE name = 'Server Room A'), 'Rack-A01', 'operational', 24.5, 2850.00, '{"x": 12, "y": 0, "z": 6}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1, "y": 1, "z": 1}'),
      ((SELECT id FROM zones WHERE name = 'Server Room A'), 'Rack-A02', 'operational', 23.8, 3200.00, '{"x": 14, "y": 0, "z": 6}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1, "y": 1, "z": 1}'),
      ((SELECT id FROM zones WHERE name = 'Server Room A'), 'Rack-A03', 'operational', 25.2, 2750.00, '{"x": 16, "y": 0, "z": 6}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1, "y": 1, "z": 1}'),
      ((SELECT id FROM zones WHERE name = 'Network Room'), 'Rack-N01', 'operational', 22.1, 1850.00, '{"x": -8, "y": 0, "z": 6}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1, "y": 1, "z": 1}'),
      ((SELECT id FROM zones WHERE name = 'Network Room'), 'Rack-N02', 'operational', 23.5, 2100.00, '{"x": -10, "y": 0, "z": 6}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1, "y": 1, "z": 1}'),
      ((SELECT id FROM zones WHERE name = 'Storage Area'), 'Rack-S01', 'operational', 21.8, 1650.00, '{"x": 2, "y": 0, "z": -8}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1, "y": 1, "z": 1}'),
      ((SELECT id FROM zones WHERE name = 'Storage Area'), 'Rack-S02', 'operational', 22.3, 1950.00, '{"x": 4, "y": 0, "z": -8}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1, "y": 1, "z": 1}'),
      ((SELECT id FROM zones WHERE name = 'Backup Generator'), 'Rack-B01', 'operational', 26.7, 4200.00, '{"x": 17, "y": 0, "z": -3}', '{"x": 0, "y": 0, "z": 0}', '{"x": 1, "y": 1, "z": 1}');
    `);

    // Insert sample sensors
    console.log('📊 Inserting sensors...');
    await pool.query(`
      INSERT INTO sensors (rack_id, type, value, threshold, alert) VALUES
      ((SELECT id FROM racks WHERE name = 'Rack-A01'), 'temperature', 24.5, 30.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-A01'), 'humidity', 45.2, 60.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-A01'), 'power', 2850.0, 3500.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-A02'), 'temperature', 23.8, 30.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-A02'), 'humidity', 47.1, 60.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-A02'), 'power', 3200.0, 3500.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-A03'), 'temperature', 25.2, 30.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-A03'), 'humidity', 43.8, 60.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-A03'), 'power', 2750.0, 3500.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-N01'), 'temperature', 22.1, 28.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-N01'), 'humidity', 50.5, 60.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-N01'), 'power', 1850.0, 2500.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-N02'), 'temperature', 23.5, 28.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-N02'), 'humidity', 48.9, 60.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-N02'), 'power', 2100.0, 2500.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-S01'), 'temperature', 21.8, 26.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-S01'), 'humidity', 52.3, 60.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-S01'), 'power', 1650.0, 2000.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-S02'), 'temperature', 22.3, 26.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-S02'), 'humidity', 49.7, 60.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-S02'), 'power', 1950.0, 2000.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-B01'), 'temperature', 26.7, 35.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-B01'), 'humidity', 41.2, 60.0, false),
      ((SELECT id FROM racks WHERE name = 'Rack-B01'), 'power', 4200.0, 5000.0, false);
    `);

    console.log('✅ Sample data inserted successfully');
    console.log('🎉 Database fully initialized with sample data');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  }
}

run();
