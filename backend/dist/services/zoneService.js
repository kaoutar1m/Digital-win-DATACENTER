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
        return result.rows;
    }
    static async createZone(zone) {
        const query = `
      INSERT INTO zones (name, security_level, color, position)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const values = [zone.name, zone.security_level, zone.color, JSON.stringify(zone.position)];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
}
exports.ZoneService = ZoneService;
//# sourceMappingURL=zoneService.js.map