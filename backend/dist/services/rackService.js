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
    static async createRack(rack) {
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
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
}
exports.RackService = RackService;
//# sourceMappingURL=rackService.js.map