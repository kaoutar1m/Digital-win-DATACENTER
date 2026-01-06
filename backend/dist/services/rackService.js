"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RackService = void 0;
const database_1 = __importDefault(require("./database"));
class RackService {
    static async getAllRacks() {
        const result = await database_1.default.query('SELECT * FROM racks ORDER BY name');
        return result.rows;
    }
    static async getRackById(id) {
        const result = await database_1.default.query('SELECT * FROM racks WHERE id = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    static async createRack(rack) {
        const query = `
      INSERT INTO racks (zone_id, name, status, size_u, total_power_capacity, total_cooling_capacity, temperature, power_usage, model_path, position, rotation, scale)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
        const values = [
            rack.zone_id,
            rack.name,
            rack.status,
            rack.size_u || 42,
            rack.total_power_capacity || 0,
            rack.total_cooling_capacity || 0,
            rack.temperature,
            rack.power_usage,
            rack.model_path,
            JSON.stringify(rack.position),
            rack.rotation ? JSON.stringify(rack.rotation) : null,
            JSON.stringify(rack.scale)
        ];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    static async updateRack(id, updates) {
        const fields = [];
        const params = [];
        let paramIndex = 1;
        if (updates.zone_id !== undefined) {
            fields.push(`zone_id = $${paramIndex}`);
            params.push(updates.zone_id);
            paramIndex++;
        }
        if (updates.name !== undefined) {
            fields.push(`name = $${paramIndex}`);
            params.push(updates.name);
            paramIndex++;
        }
        if (updates.status !== undefined) {
            fields.push(`status = $${paramIndex}`);
            params.push(updates.status);
            paramIndex++;
        }
        if (updates.size_u !== undefined) {
            fields.push(`size_u = $${paramIndex}`);
            params.push(updates.size_u);
            paramIndex++;
        }
        if (updates.total_power_capacity !== undefined) {
            fields.push(`total_power_capacity = $${paramIndex}`);
            params.push(updates.total_power_capacity);
            paramIndex++;
        }
        if (updates.total_cooling_capacity !== undefined) {
            fields.push(`total_cooling_capacity = $${paramIndex}`);
            params.push(updates.total_cooling_capacity);
            paramIndex++;
        }
        if (updates.temperature !== undefined) {
            fields.push(`temperature = $${paramIndex}`);
            params.push(updates.temperature);
            paramIndex++;
        }
        if (updates.power_usage !== undefined) {
            fields.push(`power_usage = $${paramIndex}`);
            params.push(updates.power_usage);
            paramIndex++;
        }
        if (updates.model_path !== undefined) {
            fields.push(`model_path = $${paramIndex}`);
            params.push(updates.model_path);
            paramIndex++;
        }
        if (updates.position !== undefined) {
            fields.push(`position = $${paramIndex}`);
            params.push(JSON.stringify(updates.position));
            paramIndex++;
        }
        if (updates.rotation !== undefined) {
            fields.push(`rotation = $${paramIndex}`);
            params.push(JSON.stringify(updates.rotation));
            paramIndex++;
        }
        if (updates.scale !== undefined) {
            fields.push(`scale = $${paramIndex}`);
            params.push(JSON.stringify(updates.scale));
            paramIndex++;
        }
        if (fields.length === 0)
            return this.getRackById(id);
        fields.push(`updated_at = NOW()`);
        params.push(id);
        const query = `UPDATE racks SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await database_1.default.query(query, params);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    static async deleteRack(id) {
        const result = await database_1.default.query('DELETE FROM racks WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
    static async getRackLayout(rackId) {
        const rackResult = await database_1.default.query('SELECT * FROM racks WHERE id = $1', [rackId]);
        if (rackResult.rows.length === 0) {
            throw new Error('Rack not found');
        }
        const rack = rackResult.rows[0];
        const equipmentQuery = `
      SELECT e.id, e.type, e.model, e.status, e.vendor,
             em.power_consumption, em.temperature,
             emt.default_rack_units as size_u
      FROM equipment e
      LEFT JOIN equipment_metrics em ON e.id = em.equipment_id
      LEFT JOIN equipment_models emt ON e.model = emt.model AND e.vendor = emt.vendor
      WHERE e.rack_id = $1
      ORDER BY e.position->>'y' DESC
    `;
        const equipmentResult = await database_1.default.query(equipmentQuery, [rackId]);
        const equipment = equipmentResult.rows.map((row, index) => ({
            id: row.id,
            name: `${row.vendor} ${row.model}`,
            type: row.type,
            position_u: index + 1,
            size_u: row.size_u || 1,
            power_consumption: row.power_consumption || 0,
            status: row.status
        }));
        const total_power = equipment.reduce((sum, eq) => sum + eq.power_consumption, 0);
        const used_u = equipment.reduce((sum, eq) => sum + eq.size_u, 0);
        const available_u = rack.size_u - used_u;
        const utilization_percentage = (used_u / rack.size_u) * 100;
        return {
            rack_id: rackId,
            equipment,
            total_power,
            available_u,
            utilization_percentage
        };
    }
    static async updateEquipmentPosition(rackId, equipmentId, position_u) {
        const layout = await this.getRackLayout(rackId);
        const equipment = layout.equipment.find(eq => eq.id === equipmentId);
        if (!equipment) {
            throw new Error('Equipment not found in rack');
        }
        const conflictingEquipment = layout.equipment.filter(eq => eq.id !== equipmentId &&
            ((position_u >= eq.position_u && position_u < eq.position_u + eq.size_u) ||
                (position_u + equipment.size_u > eq.position_u && position_u + equipment.size_u <= eq.position_u + eq.size_u)));
        if (conflictingEquipment.length > 0) {
            throw new Error('Position conflict with existing equipment');
        }
        return true;
    }
    static async calculateRackPowerUsage(rackId) {
        const query = `
      SELECT COALESCE(SUM(em.power_consumption), 0) as total_power
      FROM equipment e
      LEFT JOIN equipment_metrics em ON e.id = em.equipment_id
      WHERE e.rack_id = $1
    `;
        const result = await database_1.default.query(query, [rackId]);
        return parseFloat(result.rows[0].total_power);
    }
    static async calculateRackCoolingRequirement(rackId) {
        const powerUsage = await this.calculateRackPowerUsage(rackId);
        return powerUsage;
    }
    static async validateRackCapacity(rackId) {
        const rack = await this.getRackById(rackId);
        if (!rack) {
            return { valid: false, issues: ['Rack not found'] };
        }
        const issues = [];
        const layout = await this.getRackLayout(rackId);
        if (layout.total_power > rack.total_power_capacity) {
            issues.push(`Power usage (${layout.total_power}W) exceeds capacity (${rack.total_power_capacity}W)`);
        }
        if (layout.available_u < 0) {
            issues.push(`Rack space exceeded by ${Math.abs(layout.available_u)}U`);
        }
        return { valid: issues.length === 0, issues };
    }
    static async moveEquipmentToRack(equipmentId, newRackId, position_u) {
        const validation = await this.validateRackCapacity(newRackId);
        if (!validation.valid) {
            throw new Error(`Cannot move equipment: ${validation.issues.join(', ')}`);
        }
        const query = 'UPDATE equipment SET rack_id = $1, updated_at = NOW() WHERE id = $2';
        const result = await database_1.default.query(query, [newRackId, equipmentId]);
        return result.rowCount > 0;
    }
    static async getRackUtilization(rackId) {
        const rack = await this.getRackById(rackId);
        if (!rack) {
            throw new Error('Rack not found');
        }
        const layout = await this.getRackLayout(rackId);
        const coolingRequirement = await this.calculateRackCoolingRequirement(rackId);
        return {
            power_utilization: rack.total_power_capacity > 0 ? (layout.total_power / rack.total_power_capacity) * 100 : 0,
            space_utilization: layout.utilization_percentage,
            cooling_utilization: rack.total_cooling_capacity > 0 ? (coolingRequirement / rack.total_cooling_capacity) * 100 : 0
        };
    }
}
exports.RackService = RackService;
//# sourceMappingURL=rackService.js.map