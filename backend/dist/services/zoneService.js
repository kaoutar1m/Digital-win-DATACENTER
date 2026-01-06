"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneService = void 0;
const database_1 = __importDefault(require("./database"));
class ZoneService {
    static async getAllZones() {
        const result = await database_1.default.query('SELECT * FROM zones ORDER BY created_at DESC');
        return result.rows.map(row => ({
            ...row,
            position: typeof row.position === 'string' ? JSON.parse(row.position) : row.position,
            type: row.security_level >= 5 ? 'critical' : row.security_level >= 4 ? 'sensitive' : row.security_level >= 3 ? 'restricted' : 'public'
        }));
    }
    static async getZoneById(id) {
        const result = await database_1.default.query('SELECT * FROM zones WHERE id = $1', [id]);
        if (!result.rows[0])
            return null;
        const row = result.rows[0];
        return {
            ...row,
            position: typeof row.position === 'string' ? JSON.parse(row.position) : row.position,
            type: row.security_level >= 5 ? 'critical' : row.security_level >= 4 ? 'sensitive' : row.security_level >= 3 ? 'restricted' : 'public'
        };
    }
    static async createZone(zone) {
        const query = `
      INSERT INTO zones (name, type, security_level, location, access_points, authorized_users, sensors, status, color, position, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `;
        const values = [
            zone.name,
            zone.type,
            zone.security_level,
            zone.location,
            zone.access_points,
            zone.authorized_users,
            zone.sensors,
            zone.status,
            zone.color || '#00FF88',
            JSON.stringify(zone.position)
        ];
        const result = await database_1.default.query(query, values);
        const row = result.rows[0];
        return {
            ...row,
            position: typeof row.position === 'string' ? JSON.parse(row.position) : row.position,
            type: row.security_level >= 5 ? 'critical' : row.security_level >= 4 ? 'sensitive' : row.security_level >= 3 ? 'restricted' : 'public'
        };
    }
    static async updateZone(id, zone) {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (zone.name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(zone.name);
        }
        if (zone.type !== undefined) {
            fields.push(`type = $${paramIndex++}`);
            values.push(zone.type);
        }
        if (zone.security_level !== undefined) {
            fields.push(`security_level = $${paramIndex++}`);
            values.push(zone.security_level);
        }
        if (zone.location !== undefined) {
            fields.push(`location = $${paramIndex++}`);
            values.push(zone.location);
        }
        if (zone.access_points !== undefined) {
            fields.push(`access_points = $${paramIndex++}`);
            values.push(zone.access_points);
        }
        if (zone.authorized_users !== undefined) {
            fields.push(`authorized_users = $${paramIndex++}`);
            values.push(zone.authorized_users);
        }
        if (zone.sensors !== undefined) {
            fields.push(`sensors = $${paramIndex++}`);
            values.push(zone.sensors);
        }
        if (zone.status !== undefined) {
            fields.push(`status = $${paramIndex++}`);
            values.push(zone.status);
        }
        if (zone.color !== undefined) {
            fields.push(`color = $${paramIndex++}`);
            values.push(zone.color);
        }
        if (zone.position !== undefined) {
            fields.push(`position = $${paramIndex++}`);
            values.push(JSON.stringify(zone.position));
        }
        if (fields.length === 0)
            return null;
        fields.push(`updated_at = NOW()`);
        values.push(id);
        const query = `
      UPDATE zones
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
        const result = await database_1.default.query(query, values);
        if (!result.rows[0])
            return null;
        const row = result.rows[0];
        return {
            ...row,
            position: typeof row.position === 'string' ? JSON.parse(row.position) : row.position,
            type: row.security_level >= 5 ? 'critical' : row.security_level >= 4 ? 'sensitive' : row.security_level >= 3 ? 'restricted' : 'public'
        };
    }
    static async deleteZone(id) {
        const result = await database_1.default.query('DELETE FROM zones WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
    static async getZoneEquipment(zoneId) {
        const query = `
      SELECT e.* FROM equipment e
      JOIN racks r ON e.rack_id = r.id
      WHERE r.zone_id = $1
      ORDER BY e.created_at DESC
    `;
        const result = await database_1.default.query(query, [zoneId]);
        return result.rows.map(row => ({
            ...row,
            metrics: typeof row.metrics === 'string' ? JSON.parse(row.metrics) : row.metrics,
            position: typeof row.position === 'string' ? JSON.parse(row.position) : row.position,
            alerts: Array.isArray(row.alerts) ? row.alerts : []
        }));
    }
    static async getZoneAlerts(zoneId) {
        const query = `
      SELECT a.* FROM alerts a
      JOIN equipment e ON a.equipment_id = e.id
      JOIN racks r ON e.rack_id = r.id
      WHERE r.zone_id = $1
      ORDER BY a.timestamp DESC
    `;
        const result = await database_1.default.query(query, [zoneId]);
        return result.rows.map(row => ({
            ...row,
            metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
        }));
    }
}
exports.ZoneService = ZoneService;
//# sourceMappingURL=zoneService.js.map