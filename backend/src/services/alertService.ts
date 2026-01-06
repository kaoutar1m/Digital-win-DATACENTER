import pool from './database';
import { Alert } from '../models/Alert';

export class AlertService {
  // Create a new alert
  static async createAlert(alertData: Omit<Alert, 'id' | 'created_at' | 'updated_at'>): Promise<Alert> {
    const {
      title,
      description,
      severity,
      type,
      source,
      zone_id,
      equipment_id,
      status = 'active',
      acknowledged = false,
      acknowledged_by,
      acknowledged_at,
      resolved_at,
      metadata
    } = alertData;

    const result = await pool.query(
      `INSERT INTO alerts (title, description, severity, type, source, zone_id, equipment_id, status, acknowledged, acknowledged_by, acknowledged_at, resolved_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [title, description, severity, type, source, zone_id, equipment_id, status, acknowledged, acknowledged_by, acknowledged_at, resolved_at, metadata]
    );

    return result.rows[0];
  }

  // Get alerts with advanced filtering
  static async getAlerts(filters: {
    status?: string;
    severity?: string;
    type?: string;
    zone_id?: string;
    equipment_id?: string;
    source?: string;
    acknowledged?: boolean;
    start_date?: Date;
    end_date?: Date;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Alert[]> {
    const {
      status,
      severity,
      type,
      zone_id,
      equipment_id,
      source,
      acknowledged,
      start_date,
      end_date,
      search,
      limit = 50,
      offset = 0
    } = filters;

    let query = `
      SELECT a.*, z.name as zone_name, e.type as equipment_type
      FROM alerts a
      LEFT JOIN zones z ON a.zone_id = z.id
      LEFT JOIN equipment e ON a.equipment_id = e.id
      WHERE 1=1
    `;

    const params: unknown[] = [];
    let i = 1;

    if (status) {
      query += ` AND a.status = $${i++}`;
      params.push(status);
    }

    if (severity) {
      query += ` AND a.severity = $${i++}`;
      params.push(severity);
    }

    if (type) {
      query += ` AND a.type = $${i++}`;
      params.push(type);
    }

    if (zone_id) {
      query += ` AND a.zone_id = $${i++}`;
      params.push(zone_id);
    }

    if (equipment_id) {
      query += ` AND a.equipment_id = $${i++}`;
      params.push(equipment_id);
    }

    if (source) {
      query += ` AND a.source = $${i++}`;
      params.push(source);
    }

    if (acknowledged !== undefined) {
      query += ` AND a.acknowledged = $${i++}`;
      params.push(acknowledged);
    }

    if (start_date) {
      query += ` AND a.created_at >= $${i++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND a.created_at <= $${i++}`;
      params.push(end_date);
    }

    if (search) {
      query += ` AND (a.title ILIKE $${i++} OR a.description ILIKE $${i++} OR a.type ILIKE $${i++})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${i++} OFFSET $${i++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get alert by ID
  static async getAlertById(id: string): Promise<Alert | null> {
    const result = await pool.query(
      `SELECT a.*, z.name as zone_name, e.type as equipment_type
       FROM alerts a
       LEFT JOIN zones z ON a.zone_id = z.id
       LEFT JOIN equipment e ON a.equipment_id = e.id
       WHERE a.id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  // Update alert
  static async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null> {
    const fields = [];
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${i++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE alerts SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Acknowledge alert
  static async acknowledgeAlert(id: string, userId?: string): Promise<Alert | null> {
    const result = await pool.query(
      `UPDATE alerts
       SET acknowledged = true, acknowledged_by = $1, acknowledged_at = NOW(), status = 'acknowledged', updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [userId, id]
    );

    return result.rows[0] || null;
  }

  // Resolve alert
  static async resolveAlert(id: string): Promise<Alert | null> {
    const result = await pool.query(
      `UPDATE alerts
       SET status = 'resolved', resolved_at = NOW(), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );

    return result.rows[0] || null;
  }

  // Escalate alert
  static async escalateAlert(id: string): Promise<Alert | null> {
    const result = await pool.query(
      `UPDATE alerts
       SET status = 'escalated', updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );

    return result.rows[0] || null;
  }

  // Delete alert
  static async deleteAlert(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM alerts WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  // Get alert statistics
  static async getAlertStats(): Promise<{
    total: number;
    active: number;
    acknowledged: number;
    resolved: number;
    escalated: number;
    critical: number;
    by_severity: { [key: string]: number };
    by_type: { [key: string]: number };
  }> {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'acknowledged' THEN 1 END) as acknowledged,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'escalated' THEN 1 END) as escalated,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical
      FROM alerts
    `);

    const severityResult = await pool.query(`
      SELECT severity, COUNT(*) as count
      FROM alerts
      GROUP BY severity
    `);

    const typeResult = await pool.query(`
      SELECT type, COUNT(*) as count
      FROM alerts
      GROUP BY type
    `);

    const bySeverity: { [key: string]: number } = {};
    severityResult.rows.forEach(row => {
      bySeverity[row.severity] = parseInt(row.count);
    });

    const byType: { [key: string]: number } = {};
    typeResult.rows.forEach(row => {
      byType[row.type] = parseInt(row.count);
    });

    return {
      ...result.rows[0],
      by_severity: bySeverity,
      by_type: byType
    };
  }

  // Get alerts by zone
  static async getAlertsByZone(zoneId: string): Promise<Alert[]> {
    const result = await pool.query(
      `SELECT a.*, e.type as equipment_type
       FROM alerts a
       LEFT JOIN equipment e ON a.equipment_id = e.id
       WHERE a.zone_id = $1
       ORDER BY a.created_at DESC`,
      [zoneId]
    );

    return result.rows;
  }

  // Get alerts by equipment
  static async getAlertsByEquipment(equipmentId: string): Promise<Alert[]> {
    const result = await pool.query(
      `SELECT a.*, z.name as zone_name
       FROM alerts a
       LEFT JOIN zones z ON a.zone_id = z.id
       WHERE a.equipment_id = $1
       ORDER BY a.created_at DESC`,
      [equipmentId]
    );

    return result.rows;
  }

  // Bulk acknowledge alerts
  static async bulkAcknowledge(alertIds: string[], userId?: string): Promise<number> {
    const result = await pool.query(
      `UPDATE alerts
       SET acknowledged = true, acknowledged_by = $1, acknowledged_at = NOW(), status = 'acknowledged', updated_at = NOW()
       WHERE id = ANY($2) AND acknowledged = false`,
      [userId, alertIds]
    );

    return result.rowCount || 0;
  }

  // Bulk resolve alerts
  static async bulkResolve(alertIds: string[]): Promise<number> {
    const result = await pool.query(
      `UPDATE alerts
       SET status = 'resolved', resolved_at = NOW(), updated_at = NOW()
       WHERE id = ANY($1) AND status != 'resolved'`,
      [alertIds]
    );

    return result.rowCount || 0;
  }
}
