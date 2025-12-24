"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var database_1 = require("../services/database");
var joi_1 = require("joi");
var router = (0, express_1.Router)();
// Validation schema for alert creation
var alertSchema = joi_1.default.object({
    sensor_id: joi_1.default.string().uuid(),
    rack_id: joi_1.default.string().uuid(),
    type: joi_1.default.string().valid('temperature', 'humidity', 'power', 'smoke', 'motion', 'door', 'security', 'access').required(),
    message: joi_1.default.string().min(5).max(500).required(),
    severity: joi_1.default.string().valid('low', 'medium', 'high', 'critical').default('medium')
});
// Validation schema for alert update
var alertUpdateSchema = joi_1.default.object({
    resolved: joi_1.default.boolean().required()
});
// GET all alerts (with optional filters)
router.get('/', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, resolved, severity, rack_id, start_date, end_date, query, params, paramCount, result, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, resolved = _a.resolved, severity = _a.severity, rack_id = _a.rack_id, start_date = _a.start_date, end_date = _a.end_date;
                query = "\n      SELECT a.*, r.name as rack_name, z.name as zone_name, \n        s.type as sensor_type, s.value as sensor_value\n      FROM alerts a\n      LEFT JOIN racks r ON a.rack_id = r.id\n      LEFT JOIN zones z ON r.zone_id = z.id\n      LEFT JOIN sensors s ON a.sensor_id = s.id\n      WHERE 1=1\n    ";
                params = [];
                paramCount = 1;
                if (resolved === 'true' || resolved === 'false') {
                    query += " AND a.resolved = $".concat(paramCount);
                    params.push(resolved === 'true');
                    paramCount++;
                }
                if (severity) {
                    query += " AND a.severity = $".concat(paramCount);
                    params.push(severity);
                    paramCount++;
                }
                if (rack_id) {
                    query += " AND a.rack_id = $".concat(paramCount);
                    params.push(rack_id);
                    paramCount++;
                }
                if (start_date) {
                    query += " AND a.created_at >= $".concat(paramCount);
                    params.push(new Date(start_date));
                    paramCount++;
                }
                if (end_date) {
                    query += " AND a.created_at <= $".concat(paramCount);
                    params.push(new Date(end_date));
                    paramCount++;
                }
                query += " ORDER BY \n      CASE a.severity \n        WHEN 'critical' THEN 1\n        WHEN 'high' THEN 2\n        WHEN 'medium' THEN 3\n        WHEN 'low' THEN 4\n      END, \n      a.created_at DESC";
                return [4 /*yield*/, database_1.default.query(query, params)];
            case 1:
                result = _b.sent();
                res.json(result.rows);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET active alerts (not resolved)
router.get('/active', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, database_1.default.query("SELECT a.*, r.name as rack_name, z.name as zone_name,\n        s.type as sensor_type, s.value as sensor_value\n       FROM alerts a\n       LEFT JOIN racks r ON a.rack_id = r.id\n       LEFT JOIN zones z ON r.zone_id = z.id\n       LEFT JOIN sensors s ON a.sensor_id = s.id\n       WHERE a.resolved = false\n       ORDER BY \n        CASE a.severity \n          WHEN 'critical' THEN 1\n          WHEN 'high' THEN 2\n          WHEN 'medium' THEN 3\n          WHEN 'low' THEN 4\n        END,\n        a.created_at DESC\n       LIMIT 50")];
            case 1:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET alert statistics
router.get('/stats', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, hours, result, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query.hours, hours = _a === void 0 ? 24 : _a;
                return [4 /*yield*/, database_1.default.query("SELECT \n        COUNT(*) as total_alerts,\n        COUNT(CASE WHEN resolved = false THEN 1 END) as active_alerts,\n        COUNT(CASE WHEN severity = 'critical' AND resolved = false THEN 1 END) as critical_alerts,\n        COUNT(CASE WHEN severity = 'high' AND resolved = false THEN 1 END) as high_alerts,\n        COUNT(CASE WHEN severity = 'medium' AND resolved = false THEN 1 END) as medium_alerts,\n        COUNT(CASE WHEN severity = 'low' AND resolved = false THEN 1 END) as low_alerts,\n        COUNT(CASE WHEN type = 'temperature' THEN 1 END) as temperature_alerts,\n        COUNT(CASE WHEN type = 'security' THEN 1 END) as security_alerts,\n        COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' * $1 THEN 1 END) as recent_alerts\n       FROM alerts", [hours])];
            case 1:
                result = _b.sent();
                res.json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                next(error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST create new alert
router.post('/', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error, value, sensor_id, rack_id, type, message, severity, rackCheck, sensorCheck, result, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                _a = alertSchema.validate(req.body), error = _a.error, value = _a.value;
                if (error) {
                    return [2 /*return*/, res.status(400).json({ error: error.details[0].message })];
                }
                sensor_id = value.sensor_id, rack_id = value.rack_id, type = value.type, message = value.message, severity = value.severity;
                // Validate that at least one of sensor_id or rack_id is provided
                if (!sensor_id && !rack_id) {
                    return [2 /*return*/, res.status(400).json({ error: 'Either sensor_id or rack_id must be provided' })];
                }
                if (!rack_id) return [3 /*break*/, 2];
                return [4 /*yield*/, database_1.default.query('SELECT id FROM racks WHERE id = $1', [rack_id])];
            case 1:
                rackCheck = _b.sent();
                if (rackCheck.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Rack not found' })];
                }
                _b.label = 2;
            case 2:
                if (!sensor_id) return [3 /*break*/, 4];
                return [4 /*yield*/, database_1.default.query('SELECT id FROM sensors WHERE id = $1', [sensor_id])];
            case 3:
                sensorCheck = _b.sent();
                if (sensorCheck.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Sensor not found' })];
                }
                _b.label = 4;
            case 4: return [4 /*yield*/, database_1.default.query("INSERT INTO alerts (sensor_id, rack_id, type, message, severity) \n       VALUES ($1, $2, $3, $4, $5) \n       RETURNING *", [sensor_id || null, rack_id || null, type, message, severity])];
            case 5:
                result = _b.sent();
                res.status(201).json(result.rows[0]);
                return [3 /*break*/, 7];
            case 6:
                error_4 = _b.sent();
                next(error_4);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// GET single alert
router.get('/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, database_1.default.query("SELECT a.*, r.name as rack_name, z.name as zone_name,\n        s.type as sensor_type, s.value as sensor_value,\n        s.threshold as sensor_threshold\n       FROM alerts a\n       LEFT JOIN racks r ON a.rack_id = r.id\n       LEFT JOIN zones z ON r.zone_id = z.id\n       LEFT JOIN sensors s ON a.sensor_id = s.id\n       WHERE a.id = $1", [id])];
            case 1:
                result = _a.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Alert not found' })];
                }
                res.json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                next(error_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// PUT update alert (mark as resolved/unresolved)
router.put('/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, error, value, resolved, result, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = alertUpdateSchema.validate(req.body), error = _a.error, value = _a.value;
                if (error) {
                    return [2 /*return*/, res.status(400).json({ error: error.details[0].message })];
                }
                resolved = value.resolved;
                return [4 /*yield*/, database_1.default.query("UPDATE alerts \n       SET resolved = $1, \n           resolved_at = CASE WHEN $1 = true THEN NOW() ELSE NULL END\n       WHERE id = $2 \n       RETURNING *", [resolved, id])];
            case 1:
                result = _b.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Alert not found' })];
                }
                res.json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _b.sent();
                next(error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// DELETE alert
router.delete('/:id', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, database_1.default.query('DELETE FROM alerts WHERE id = $1 RETURNING *', [id])];
            case 1:
                result = _a.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Alert not found' })];
                }
                res.json({ message: 'Alert deleted successfully' });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                next(error_7);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET alerts by rack
router.get('/rack/:rackId', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var rackId, resolved, query, params, result, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                rackId = req.params.rackId;
                resolved = req.query.resolved;
                query = "\n      SELECT a.*, s.type as sensor_type, s.value as sensor_value\n      FROM alerts a\n      LEFT JOIN sensors s ON a.sensor_id = s.id\n      WHERE a.rack_id = $1\n    ";
                params = [rackId];
                if (resolved === 'true' || resolved === 'false') {
                    query += " AND a.resolved = $2";
                    params.push(resolved === 'true');
                }
                query += " ORDER BY a.created_at DESC LIMIT 20";
                return [4 /*yield*/, database_1.default.query(query, params)];
            case 1:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                next(error_8);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET alerts by sensor
router.get('/sensor/:sensorId', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sensorId, result, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                sensorId = req.params.sensorId;
                return [4 /*yield*/, database_1.default.query("SELECT a.*, r.name as rack_name\n       FROM alerts a\n       LEFT JOIN racks r ON a.rack_id = r.id\n       WHERE a.sensor_id = $1\n       ORDER BY a.created_at DESC\n       LIMIT 20", [sensorId])];
            case 1:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                next(error_9);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
