import pool from './database';
import { Equipment, EquipmentMetrics } from '../models/Equipment';
import { Metric } from '../models/Metric';

export class EquipmentService {

  async getAllEquipment(filters: any = {}): Promise<Equipment[]> {
    let query = `
      SELECT e.*,
             json_build_object(
               'temperature', em.temperature,
               'power_consumption', em.power_consumption,
               'load', em.load,
               'memory_usage', em.memory_usage,
               'storage_usage', em.storage_usage,
               'uptime', em.uptime
             ) as metrics
      FROM equipment e
      LEFT JOIN equipment_metrics em ON e.id = em.equipment_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.zone_id) {
      query += ` AND e.rack_id IN (SELECT id FROM racks WHERE zone_id = $${paramIndex})`;
      params.push(filters.zone_id);
      paramIndex++;
    }

    if (filters.rack_id) {
      query += ` AND e.rack_id = $${paramIndex}`;
      params.push(filters.rack_id);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND e.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.type) {
      query += ` AND e.type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    query += ' ORDER BY e.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      ...row,
      metrics: row.metrics || {
        temperature: 25,
        power_consumption: 0,
        load: 0,
        memory_usage: 0,
        storage_usage: 0,
        uptime: 0
      }
    }));
  }

  async getEquipmentById(id: string): Promise<Equipment | null> {
    const query = `
      SELECT e.*,
             json_build_object(
               'temperature', em.temperature,
               'power_consumption', em.power_consumption,
               'load', em.load,
               'memory_usage', em.memory_usage,
               'storage_usage', em.storage_usage,
               'uptime', em.uptime
             ) as metrics
      FROM equipment e
      LEFT JOIN equipment_metrics em ON e.id = em.equipment_id
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      metrics: row.metrics || {
        temperature: 25,
        power_consumption: 0,
        load: 0,
        memory_usage: 0,
        storage_usage: 0,
        uptime: 0
      }
    };
  }

  async createEquipment(equipmentData: Partial<Equipment>): Promise<Equipment> {
    const id = `eq-${Date.now()}`;
    const query = `
      INSERT INTO equipment (id, rack_id, type, model, status, vendor, serial_number, ip_address, mac_address, position)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const params = [
      id,
      equipmentData.rack_id,
      equipmentData.type,
      equipmentData.model,
      equipmentData.status || 'offline',
      equipmentData.vendor || 'Unknown',
      equipmentData.serial_number || `SN${Date.now()}`,
      equipmentData.ip_address,
      equipmentData.mac_address,
      JSON.stringify(equipmentData.position || { x: 0, y: 0, z: 0 })
    ];

    const result = await pool.query(query, params);
    const newEquipment = result.rows[0];

    // Create initial metrics
    const metrics = equipmentData.metrics || {
      temperature: 25,
      power_consumption: 0,
      load: 0,
      memory_usage: 0,
      storage_usage: 0,
      uptime: 0
    };
    await this.createEquipmentMetrics(id, metrics);

    return {
      ...newEquipment,
      position: JSON.parse(newEquipment.position),
      metrics
    };
  }

  async updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment | null> {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    if (updates.rack_id !== undefined) {
      fields.push(`rack_id = $${paramIndex}`);
      params.push(updates.rack_id);
      paramIndex++;
    }
    if (updates.type !== undefined) {
      fields.push(`type = $${paramIndex}`);
      params.push(updates.type);
      paramIndex++;
    }
    if (updates.model !== undefined) {
      fields.push(`model = $${paramIndex}`);
      params.push(updates.model);
      paramIndex++;
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex}`);
      params.push(updates.status);
      paramIndex++;
    }
    if (updates.vendor !== undefined) {
      fields.push(`vendor = $${paramIndex}`);
      params.push(updates.vendor);
      paramIndex++;
    }
    if (updates.serial_number !== undefined) {
      fields.push(`serial_number = $${paramIndex}`);
      params.push(updates.serial_number);
      paramIndex++;
    }
    if (updates.ip_address !== undefined) {
      fields.push(`ip_address = $${paramIndex}`);
      params.push(updates.ip_address);
      paramIndex++;
    }
    if (updates.mac_address !== undefined) {
      fields.push(`mac_address = $${paramIndex}`);
      params.push(updates.mac_address);
      paramIndex++;
    }
    if (updates.position !== undefined) {
      fields.push(`position = $${paramIndex}`);
      params.push(JSON.stringify(updates.position));
      paramIndex++;
    }

    if (fields.length === 0) return this.getEquipmentById(id);

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `UPDATE equipment SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);

    if (result.rows.length === 0) return null;
    return this.getEquipmentById(id) as Promise<Equipment>;
  }

  async deleteEquipment(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM equipment WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async getEquipmentMetrics(
    equipmentId: string,
    type?: string,
    startDate?: string,
    endDate?: string
  ): Promise<Metric[]> {
    let query = 'SELECT * FROM equipment_metrics WHERE equipment_id = $1';
    const params: any[] = [equipmentId];
    let paramIndex = 2;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND recorded_at >= $${paramIndex}`;
      params.push(new Date(startDate));
      paramIndex++;
    }

    if (endDate) {
      query += ` AND recorded_at <= $${paramIndex}`;
      params.push(new Date(endDate));
      paramIndex++;
    }

    query += ' ORDER BY recorded_at DESC';

    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      id: row.id,
      equipment_id: row.equipment_id,
      metric_type: 'temperature', // Default type, could be expanded
      value: row.temperature || row.power_consumption || row.load || row.memory_usage || row.storage_usage || row.uptime,
      unit: this.getUnitForMetricType('temperature'), // Default unit
      timestamp: row.recorded_at
    }));
  }

  async scheduleMaintenance(equipmentId: string, maintenanceData: any): Promise<any> {
    // In a real implementation, this would create a maintenance record
    return {
      id: `maintenance-${Date.now()}`,
      equipment_id: equipmentId,
      type: maintenanceData.type || 'routine',
      scheduled_date: maintenanceData.scheduled_date,
      description: maintenanceData.description,
      status: 'scheduled',
      created_at: new Date()
    };
  }

  async updateEquipmentMetrics(equipmentId: string, metrics: Partial<Equipment['metrics']>): Promise<void> {
    const query = `
      INSERT INTO equipment_metrics (equipment_id, temperature, power_consumption, load, memory_usage, storage_usage, uptime)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (equipment_id)
      DO UPDATE SET
        temperature = EXCLUDED.temperature,
        power_consumption = EXCLUDED.power_consumption,
        load = EXCLUDED.load,
        memory_usage = EXCLUDED.memory_usage,
        storage_usage = EXCLUDED.storage_usage,
        uptime = EXCLUDED.uptime,
        recorded_at = NOW()
    `;
    await pool.query(query, [
      equipmentId,
      metrics.temperature,
      metrics.power_consumption,
      metrics.load,
      metrics.memory_usage,
      metrics.storage_usage,
      metrics.uptime
    ]);
  }

  private async createEquipmentMetrics(equipmentId: string, metrics: Equipment['metrics']): Promise<void> {
    const query = `
      INSERT INTO equipment_metrics (equipment_id, temperature, power_consumption, load, memory_usage, storage_usage, uptime)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await pool.query(query, [
      equipmentId,
      metrics.temperature,
      metrics.power_consumption,
      metrics.load,
      metrics.memory_usage,
      metrics.storage_usage,
      metrics.uptime
    ]);
  }

  private getUnitForMetricType(type: string): string {
    const unitMap: Record<string, string> = {
      temperature: '°C',
      power_consumption: 'W',
      load: '%',
      memory_usage: '%',
      storage_usage: '%',
      uptime: 'hours'
    };
    return unitMap[type] || '';
  }

  // Equipment Database Sync
  async syncWithDataCenterGenerator(equipmentData: any[]): Promise<{ synced: number; errors: string[] }> {
    let synced = 0;
    const errors: string[] = [];

    for (const data of equipmentData) {
      try {
        // Check if equipment exists by IP/MAC/serial
        const existing = await this.findEquipmentByIdentifiers(data.ip_address, data.mac_address, data.serial_number);

        if (existing) {
          // Update existing equipment
          await this.updateEquipment(existing.id, {
            status: data.status || existing.status,
            ip_address: data.ip_address,
            mac_address: data.mac_address,
            position: data.position || existing.position
          });
        } else {
          // Create new equipment
          await this.createEquipment({
            rack_id: data.rack_id,
            type: data.type,
            model: data.model,
            status: data.status || 'offline',
            vendor: data.vendor,
            serial_number: data.serial_number,
            ip_address: data.ip_address,
            mac_address: data.mac_address,
            position: data.position
          });
        }
        synced++;
      } catch (error) {
        errors.push(`Failed to sync equipment ${data.serial_number || data.ip_address}: ${error.message}`);
      }
    }

    return { synced, errors };
  }

  async findEquipmentByIdentifiers(ip?: string, mac?: string, serial?: string): Promise<Equipment | null> {
    let query = 'SELECT * FROM equipment WHERE ';
    const params: any[] = [];
    const conditions: string[] = [];

    if (ip) {
      conditions.push('ip_address = $' + (params.length + 1));
      params.push(ip);
    }
    if (mac) {
      conditions.push('mac_address = $' + (params.length + 1));
      params.push(mac);
    }
    if (serial) {
      conditions.push('serial_number = $' + (params.length + 1));
      params.push(serial);
    }

    if (conditions.length === 0) return null;

    query += conditions.join(' OR ');

    const result = await pool.query(query, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Orphaned Equipment Detection
  async getOrphanedEquipment(): Promise<Equipment[]> {
    const query = `
      SELECT e.* FROM equipment e
      LEFT JOIN racks r ON e.rack_id = r.id
      WHERE r.id IS NULL OR e.rack_id IS NULL
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Network Scanning
  async scanNetwork(subnet: string): Promise<any[]> {
    // This would integrate with network scanning tools
    // For now, return mock data
    return [
      {
        ip_address: '192.168.1.10',
        mac_address: '00:11:22:33:44:55',
        type: 'server',
        vendor: 'Dell',
        model: 'PowerEdge R740'
      }
    ];
  }

  // Bulk Import
  async bulkImportEquipment(equipmentData: any[]): Promise<{ imported: number; errors: string[] }> {
    const imported = 0;
    const errors: string[] = [];

    for (const data of equipmentData) {
      try {
        await this.createEquipment(data);
      } catch (error) {
        errors.push(`Failed to import equipment ${data.serial_number || data.ip_address}: ${error.message}`);
      }
    }

    return { imported: equipmentData.length - errors.length, errors };
  }

  // Equipment History
  async getEquipmentHistory(equipmentId: string, limit: number = 50): Promise<any[]> {
    const query = `
      SELECT * FROM equipment_history
      WHERE equipment_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [equipmentId, limit]);
    return result.rows;
  }

  async addEquipmentHistory(equipmentId: string, historyData: any): Promise<any> {
    const query = `
      INSERT INTO equipment_history (equipment_id, event_type, details)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [
      equipmentId,
      historyData.event_type,
      JSON.stringify(historyData.details || {})
    ]);
    return result.rows[0];
  }

  // Asset Management
  async getEquipmentWithWarranty(equipmentId: string): Promise<any> {
    // This would integrate with warranty APIs
    // For now, return mock data
    return {
      equipment_id: equipmentId,
      warranty_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      vendor: 'Dell',
      coverage: 'Next Business Day'
    };
  }

  async getEquipmentMaintenanceHistory(equipmentId: string): Promise<any[]> {
    const query = `
      SELECT * FROM equipment_history
      WHERE equipment_id = $1 AND event_type = 'maintenance'
      ORDER BY timestamp DESC
    `;
    const result = await pool.query(query, [equipmentId]);
    return result.rows;
  }
}
