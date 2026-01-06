import { CameraEvent } from '../models/CameraEvent';
import { database } from './database';

export class CameraEventService {
  static async getEventsByCamera(cameraId: string, limit: number = 50): Promise<CameraEvent[]> {
    const query = `
      SELECT * FROM camera_events
      WHERE camera_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;
    const result = await database.query(query, [cameraId, limit]);
    return result.rows.map(row => ({
      id: row.id,
      camera_id: row.camera_id,
      event_type: row.event_type,
      timestamp: new Date(row.timestamp),
      details: row.details || {},
      acknowledged: row.acknowledged,
      acknowledged_by: row.acknowledged_by,
      acknowledged_at: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
      severity: row.severity,
      snapshot_url: row.snapshot_url
    }));
  }

  static async createEvent(event: Omit<CameraEvent, 'id'>): Promise<CameraEvent> {
    const query = `
      INSERT INTO camera_events (
        camera_id, event_type, timestamp, details, acknowledged,
        acknowledged_by, acknowledged_at, severity, snapshot_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      event.camera_id,
      event.event_type,
      event.timestamp,
      JSON.stringify(event.details),
      event.acknowledged,
      event.acknowledged_by,
      event.acknowledged_at,
      event.severity,
      event.snapshot_url
    ];
    const result = await database.query(query, values);
    const row = result.rows[0];
    return {
      id: row.id,
      camera_id: row.camera_id,
      event_type: row.event_type,
      timestamp: new Date(row.timestamp),
      details: row.details || {},
      acknowledged: row.acknowledged,
      acknowledged_by: row.acknowledged_by,
      acknowledged_at: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
      severity: row.severity,
      snapshot_url: row.snapshot_url
    };
  }

  static async acknowledgeEvent(eventId: string, userId?: string): Promise<boolean> {
    const query = `
      UPDATE camera_events
      SET acknowledged = true, acknowledged_by = $2, acknowledged_at = NOW()
      WHERE id = $1
    `;
    const result = await database.query(query, [eventId, userId]);
    return result.rowCount > 0;
  }

  static async getUnacknowledgedEvents(): Promise<CameraEvent[]> {
    const query = `
      SELECT ce.*, c.name as camera_name, c.location
      FROM camera_events ce
      JOIN cameras c ON ce.camera_id = c.id
      WHERE ce.acknowledged = false
      ORDER BY ce.timestamp DESC
    `;
    const result = await database.query(query);
    return result.rows.map(row => ({
      id: row.id,
      camera_id: row.camera_id,
      event_type: row.event_type,
      timestamp: new Date(row.timestamp),
      details: row.details || {},
      acknowledged: row.acknowledged,
      acknowledged_by: row.acknowledged_by,
      acknowledged_at: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
      severity: row.severity,
      snapshot_url: row.snapshot_url
    }));
  }

  static async getEventsBySeverity(severity: string, limit: number = 100): Promise<CameraEvent[]> {
    const query = `
      SELECT ce.*, c.name as camera_name, c.location
      FROM camera_events ce
      JOIN cameras c ON ce.camera_id = c.id
      WHERE ce.severity = $1
      ORDER BY ce.timestamp DESC
      LIMIT $2
    `;
    const result = await database.query(query, [severity, limit]);
    return result.rows.map(row => ({
      id: row.id,
      camera_id: row.camera_id,
      event_type: row.event_type,
      timestamp: new Date(row.timestamp),
      details: row.details || {},
      acknowledged: row.acknowledged,
      acknowledged_by: row.acknowledged_by,
      acknowledged_at: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
      severity: row.severity,
      snapshot_url: row.snapshot_url
    }));
  }
}
