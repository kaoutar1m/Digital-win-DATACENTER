"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../services/database"));
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const alertSchema = joi_1.default.object({
    sensor_id: joi_1.default.string().uuid().optional(),
    rack_id: joi_1.default.string().uuid().optional(),
    type: joi_1.default.string()
        .valid('temperature', 'humidity', 'power', 'smoke', 'motion', 'door', 'security', 'access')
        .required(),
    message: joi_1.default.string().min(5).max(500).required(),
    severity: joi_1.default.string().valid('low', 'medium', 'high', 'critical').default('medium')
});
const alertUpdateSchema = joi_1.default.object({
    resolved: joi_1.default.boolean().required()
});
router.get('/', async (req, res, next) => {
    try {
        const { resolved, severity, rack_id, start_date, end_date } = req.query;
        let query = `
      SELECT a.*
      FROM alerts a
      WHERE 1=1
    `;
        const params = [];
        let i = 1;
        if (resolved === 'true' || resolved === 'false') {
            query += ` AND a.resolved = $${i++}`;
            params.push(resolved === 'true');
        }
        if (severity) {
            query += ` AND a.severity = $${i++}`;
            params.push(severity);
        }
        if (rack_id) {
            query += ` AND a.rack_id = $${i++}`;
            params.push(rack_id);
        }
        if (start_date) {
            query += ` AND a.created_at >= $${i++}`;
            params.push(new Date(start_date));
        }
        if (end_date) {
            query += ` AND a.created_at <= $${i++}`;
            params.push(new Date(end_date));
        }
        query += ` ORDER BY a.created_at DESC`;
        const result = await database_1.default.query(query, params);
        return res.json(result.rows);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const { error, value } = alertSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        const { sensor_id, rack_id, type, message, severity } = value;
        if (!sensor_id && !rack_id) {
            return res.status(400).json({ error: 'sensor_id or rack_id is required' });
        }
        const result = await database_1.default.query(`INSERT INTO alerts (sensor_id, rack_id, type, message, severity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [sensor_id ?? null, rack_id ?? null, type, message, severity]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { error, value } = alertUpdateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    const result = await database_1.default.query(`UPDATE alerts
     SET resolved = $1, resolved_at = CASE WHEN $1 THEN NOW() ELSE NULL END
     WHERE id = $2
     RETURNING *`, [value.resolved, id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Alert not found' });
    }
    return res.json(result.rows[0]);
});
router.delete('/:id', async (req, res) => {
    const result = await database_1.default.query('DELETE FROM alerts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Alert not found' });
    }
    return res.json({ message: 'Alert deleted' });
});
exports.default = router;
//# sourceMappingURL=alertRoutes.js.map