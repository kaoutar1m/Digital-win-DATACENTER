import pool from './database';
import { Zone } from '../models/Zone';
import { Equipment } from '../models/Equipment';
import { Alert } from '../models/Alert';

export class ZoneService {
  static async getAllZones(): Promise<Zone[]> {
    const result = await pool.query('SELECT id, name, security_level, color, position, created_at FROM zones ORDER BY created_at DESC');
    return result.rows.map(row => ({
      ...row,
      position: typeof row.position === 'string' ? JSON.parse(row.position) : row.position
    }));
  }

  static async getZoneById(id: number): Promise<Zone | null> {
    const result = await pool.query('SELECT id, name, security_level, color, position, created_at FROM zones WHERE id = $1', [id]);
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      ...row,
      position: typeof row.position === 'string' ? JSON.parse(row.position) : row.position
    };
  }

  static async createZone(zone: Omit<Zone, 'id' | 'created_at'>): Promise<Zone> {
    const query = `
      INSERT INTO zones (name, security_level, color, position, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, name, security_level, color, position, created_at
    `;
    const values = [
      zone.name,
      zone.security_level,
      zone.color || '#00FF88',
      JSON.stringify(zone.position)
    ];
    const result = await pool.query(query, values);
    const row = result.rows[0];
    return {
      ...row,
      position: typeof row.position === 'string' ? JSON.parse(row.position) : row.position
    };
  }

  static async updateZone(id: number, zone: Partial<Omit<Zone, 'id' | 'created_at'>>): Promise<Zone | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (zone.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(zone.name);
    }
    if (zone.security_level !== undefined) {
      fields.push(`security_level = $${paramIndex++}`);
      values.push(zone.security_level);
    }
    if (zone.color !== undefined) {
      fields.push(`color = $${paramIndex++}`);
      values.push(zone.color);
    }
    if (zone.position !== undefined) {
      fields.push(`position = $${paramIndex++}`);
      values.push(JSON.stringify(zone.position));
    }

    if (fields.length === 0) return null;

    values.push(id);

    const query = `
      UPDATE zones
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, security_level, color, position, created_at
    `;

    const result = await pool.query(query, values);
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      ...row,
      position: typeof row.position === 'string' ? JSON.parse(row.position) : row.position
    };
  }

  static async deleteZone(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM zones WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async getZoneEquipment(zoneId: string): Promise<Equipment[]> {
    // For now, return equipment associated with racks in this zone
    // This is a simplified implementation - in a real system, equipment would be directly associated with zones
    const query = `
      SELECT e.* FROM equipment e
      JOIN racks r ON e.rack_id = r.id
      WHERE r.zone_id = $1
      ORDER BY e.created_at DESC
    `;
    const result = await pool.query(query, [zoneId]);
    return result.rows.map(row => ({
      ...row,
      metrics: typeof row.metrics === 'string' ? JSON.parse(row.metrics) : row.metrics,
      position: typeof row.position === 'string' ? JSON.parse(row.position) : row.position,
      alerts: Array.isArray(row.alerts) ? row.alerts : []
    }));
  }

  static async getZoneAlerts(zoneId: string): Promise<Alert[]> {
    // Get alerts for equipment in this zone
    const query = `
      SELECT a.* FROM alerts a
      JOIN equipment e ON a.equipment_id = e.id
      JOIN racks r ON e.rack_id = r.id
      WHERE r.zone_id = $1
      ORDER BY a.timestamp DESC
    `;
    const result = await pool.query(query, [zoneId]);
    return result.rows.map(row => ({
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    }));
  }
}
