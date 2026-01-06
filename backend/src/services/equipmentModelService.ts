import pool from './database';
import { EquipmentModel, EquipmentHistory } from '../models/EquipmentModel';

export class EquipmentModelService {
  static async getAllEquipmentModels(): Promise<EquipmentModel[]> {
    const result = await pool.query('SELECT * FROM equipment_models ORDER BY vendor, model');
    return result.rows.map(row => ({
      ...row,
      specs_template: JSON.parse(row.specs_template)
    }));
  }

  static async getEquipmentModelById(id: string): Promise<EquipmentModel | null> {
    const result = await pool.query('SELECT * FROM equipment_models WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      specs_template: JSON.parse(row.specs_template)
    };
  }

  static async createEquipmentModel(model: Omit<EquipmentModel, 'id'>): Promise<EquipmentModel> {
    const id = `model-${Date.now()}`;
    const query = `
      INSERT INTO equipment_models (id, model, vendor, type, specs_template, default_power_consumption, default_rack_units)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      id,
      model.model,
      model.vendor,
      model.type,
      JSON.stringify(model.specs_template),
      model.default_power_consumption,
      model.default_rack_units
    ];
    const result = await pool.query(query, values);
    const newModel = result.rows[0];
    return {
      ...newModel,
      specs_template: JSON.parse(newModel.specs_template)
    };
  }

  static async updateEquipmentModel(id: string, updates: Partial<EquipmentModel>): Promise<EquipmentModel | null> {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    if (updates.model !== undefined) {
      fields.push(`model = $${paramIndex}`);
      params.push(updates.model);
      paramIndex++;
    }
    if (updates.vendor !== undefined) {
      fields.push(`vendor = $${paramIndex}`);
      params.push(updates.vendor);
      paramIndex++;
    }
    if (updates.type !== undefined) {
      fields.push(`type = $${paramIndex}`);
      params.push(updates.type);
      paramIndex++;
    }
    if (updates.specs_template !== undefined) {
      fields.push(`specs_template = $${paramIndex}`);
      params.push(JSON.stringify(updates.specs_template));
      paramIndex++;
    }
    if (updates.default_power_consumption !== undefined) {
      fields.push(`default_power_consumption = $${paramIndex}`);
      params.push(updates.default_power_consumption);
      paramIndex++;
    }
    if (updates.default_rack_units !== undefined) {
      fields.push(`default_rack_units = $${paramIndex}`);
      params.push(updates.default_rack_units);
      paramIndex++;
    }

    if (fields.length === 0) return this.getEquipmentModelById(id);

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `UPDATE equipment_models SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...row,
      specs_template: JSON.parse(row.specs_template)
    };
  }

  static async deleteEquipmentModel(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM equipment_models WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

export class EquipmentHistoryService {
  static async getEquipmentHistory(equipmentId: string, limit: number = 50): Promise<EquipmentHistory[]> {
    const query = `
      SELECT * FROM equipment_history
      WHERE equipment_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [equipmentId, limit]);
    return result.rows.map(row => ({
      ...row,
      details: JSON.parse(row.details)
    }));
  }

  static async addEquipmentHistory(history: Omit<EquipmentHistory, 'id'>): Promise<EquipmentHistory> {
    const id = `history-${Date.now()}`;
    const query = `
      INSERT INTO equipment_history (id, equipment_id, event_type, details, timestamp)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      id,
      history.equipment_id,
      history.event_type,
      JSON.stringify(history.details),
      history.timestamp || new Date()
    ];
    const result = await pool.query(query, values);
    const newHistory = result.rows[0];
    return {
      ...newHistory,
      details: JSON.parse(newHistory.details)
    };
  }

  static async getMaintenanceHistory(equipmentId: string): Promise<EquipmentHistory[]> {
    const query = `
      SELECT * FROM equipment_history
      WHERE equipment_id = $1 AND event_type = 'maintenance'
      ORDER BY timestamp DESC
    `;
    const result = await pool.query(query, [equipmentId]);
    return result.rows.map(row => ({
      ...row,
      details: JSON.parse(row.details)
    }));
  }
}
