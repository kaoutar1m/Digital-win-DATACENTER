import pool from './database';
import { Zone } from '../models/Zone';

export class ZoneService {
  static async getAllZones(): Promise<Zone[]> {
    const result = await pool.query('SELECT * FROM zones ORDER BY created_at DESC');
    return result.rows;
  }

  static async createZone(zone: Omit<Zone, 'id' | 'created_at'>): Promise<Zone> {
    const query = `
      INSERT INTO zones (name, security_level, color, position)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [zone.name, zone.security_level, zone.color, JSON.stringify(zone.position)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}
