import pool from './database';
import { Rack } from '../models/Rack';

export class RackService {
  static async getAllRacks(): Promise<Rack[]> {
    const result = await pool.query('SELECT * FROM racks ORDER BY name');
    return result.rows;
  }

  static async createRack(rack: Omit<Rack, 'id'>): Promise<Rack> {
    const query = `
      INSERT INTO racks (zone_id, name, status, temperature, power_usage, model_path, position, rotation, scale)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      rack.zone_id,
      rack.name,
      rack.status,
      rack.temperature,
      rack.power_usage,
      rack.model_path,
      JSON.stringify(rack.position),
      rack.rotation ? JSON.stringify(rack.rotation) : null,
      JSON.stringify(rack.scale)
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}
