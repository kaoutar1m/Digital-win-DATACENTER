"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.sensorService = exports.SensorService = void 0;
var connection_1 = require("../database/connection");
var SensorService = /** @class */ (function () {
    function SensorService() {
    }
    // Get all sensors with optional rack information
    SensorService.getAllSensors = function () {
        return __awaiter(this, arguments, void 0, function (includeRackInfo) {
            var query, result, error_1;
            if (includeRackInfo === void 0) { includeRackInfo = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        query = 'SELECT * FROM sensors ORDER BY last_updated DESC';
                        if (includeRackInfo) {
                            query = "\n          SELECT s.*, r.name as rack_name, r.status as rack_status, \n                 z.name as zone_name, z.security_level\n          FROM sensors s\n          LEFT JOIN racks r ON s.rack_id = r.id\n          LEFT JOIN zones z ON r.zone_id = z.id\n          ORDER BY s.last_updated DESC\n        ";
                        }
                        return [4 /*yield*/, connection_1.pool.query(query)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(function (row) { return (__assign(__assign({}, row), { last_updated: new Date(row.last_updated) })); })];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error getting all sensors:', error_1);
                        throw new Error('Failed to retrieve sensors');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get sensors with alerts (critical sensors)
    SensorService.getSensorsWithAlerts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        query = "\n        SELECT s.*, r.name as rack_name, r.status as rack_status,\n               z.name as zone_name, z.security_level\n        FROM sensors s\n        LEFT JOIN racks r ON s.rack_id = r.id\n        LEFT JOIN zones z ON r.zone_id = z.id\n        WHERE s.alert = true\n        ORDER BY \n          CASE s.type\n            WHEN 'smoke' THEN 1\n            WHEN 'temperature' THEN 2\n            WHEN 'power' THEN 3\n            WHEN 'door' THEN 4\n            WHEN 'motion' THEN 5\n            WHEN 'humidity' THEN 6\n          END,\n          s.last_updated DESC\n      ";
                        return [4 /*yield*/, connection_1.pool.query(query)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(function (row) { return (__assign(__assign({}, row), { last_updated: new Date(row.last_updated) })); })];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error getting sensors with alerts:', error_2);
                        throw new Error('Failed to retrieve alerting sensors');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get single sensor by ID
    SensorService.getSensorById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var query, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        query = "\n        SELECT s.*, r.name as rack_name, r.status as rack_status,\n               z.name as zone_name, z.security_level\n        FROM sensors s\n        LEFT JOIN racks r ON s.rack_id = r.id\n        LEFT JOIN zones z ON r.zone_id = z.id\n        WHERE s.id = $1\n      ";
                        return [4 /*yield*/, connection_1.pool.query(query, [id])];
                    case 1:
                        result = _a.sent();
                        if (result.rows.length === 0) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, __assign(__assign({}, result.rows[0]), { last_updated: new Date(result.rows[0].last_updated) })];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Error getting sensor ".concat(id, ":"), error_3);
                        throw new Error("Failed to retrieve sensor ".concat(id));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Create new sensor
    SensorService.createSensor = function (sensorData) {
        return __awaiter(this, void 0, void 0, function () {
            var validTypes, alert_1, rackCheck, query, values, result, sensor, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        validTypes = ['temperature', 'humidity', 'power', 'smoke', 'motion', 'door'];
                        if (!validTypes.includes(sensorData.type)) {
                            throw new Error("Invalid sensor type. Must be one of: ".concat(validTypes.join(', ')));
                        }
                        alert_1 = sensorData.alert !== undefined ? sensorData.alert : sensorData.value > sensorData.threshold;
                        return [4 /*yield*/, connection_1.pool.query('SELECT id FROM racks WHERE id = $1', [sensorData.rack_id])];
                    case 1:
                        rackCheck = _a.sent();
                        if (rackCheck.rows.length === 0) {
                            throw new Error("Rack with ID ".concat(sensorData.rack_id, " not found"));
                        }
                        query = "\n        INSERT INTO sensors (rack_id, type, value, threshold, alert)\n        VALUES ($1, $2, $3, $4, $5)\n        RETURNING *\n      ";
                        values = [
                            sensorData.rack_id,
                            sensorData.type,
                            sensorData.value,
                            sensorData.threshold,
                            alert_1
                        ];
                        return [4 /*yield*/, connection_1.pool.query(query, values)];
                    case 2:
                        result = _a.sent();
                        sensor = result.rows[0];
                        return [2 /*return*/, __assign(__assign({}, sensor), { last_updated: new Date(sensor.last_updated) })];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Error creating sensor:', error_4);
                        if (error_4 instanceof Error) {
                            throw error_4; // Re-throw validation errors
                        }
                        throw new Error('Failed to create sensor');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Update sensor value and recalculate alert
    SensorService.updateSensorValue = function (id, value) {
        return __awaiter(this, void 0, void 0, function () {
            var currentSensor, alert_2, query, result, sensor, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSensorById(id)];
                    case 1:
                        currentSensor = _a.sent();
                        if (!currentSensor) {
                            throw new Error("Sensor with ID ".concat(id, " not found"));
                        }
                        alert_2 = value > currentSensor.threshold;
                        query = "\n        UPDATE sensors\n        SET value = $1, \n            alert = $2,\n            last_updated = NOW()\n        WHERE id = $3\n        RETURNING *\n      ";
                        return [4 /*yield*/, connection_1.pool.query(query, [value, alert_2, id])];
                    case 2:
                        result = _a.sent();
                        if (result.rows.length === 0) {
                            throw new Error("Sensor with ID ".concat(id, " not found"));
                        }
                        sensor = result.rows[0];
                        return [2 /*return*/, __assign(__assign({}, sensor), { last_updated: new Date(sensor.last_updated) })];
                    case 3:
                        error_5 = _a.sent();
                        console.error("Error updating sensor ".concat(id, ":"), error_5);
                        if (error_5 instanceof Error) {
                            throw error_5;
                        }
                        throw new Error("Failed to update sensor ".concat(id));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Update sensor threshold
    SensorService.updateSensorThreshold = function (id, threshold) {
        return __awaiter(this, void 0, void 0, function () {
            var currentSensor, alert_3, query, result, sensor, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSensorById(id)];
                    case 1:
                        currentSensor = _a.sent();
                        if (!currentSensor) {
                            throw new Error("Sensor with ID ".concat(id, " not found"));
                        }
                        alert_3 = currentSensor.value > threshold;
                        query = "\n        UPDATE sensors\n        SET threshold = $1,\n            alert = $2,\n            last_updated = NOW()\n        WHERE id = $3\n        RETURNING *\n      ";
                        return [4 /*yield*/, connection_1.pool.query(query, [threshold, alert_3, id])];
                    case 2:
                        result = _a.sent();
                        if (result.rows.length === 0) {
                            throw new Error("Sensor with ID ".concat(id, " not found"));
                        }
                        sensor = result.rows[0];
                        return [2 /*return*/, __assign(__assign({}, sensor), { last_updated: new Date(sensor.last_updated) })];
                    case 3:
                        error_6 = _a.sent();
                        console.error("Error updating sensor threshold ".concat(id, ":"), error_6);
                        if (error_6 instanceof Error) {
                            throw error_6;
                        }
                        throw new Error("Failed to update sensor threshold ".concat(id));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Delete sensor
    SensorService.deleteSensor = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, connection_1.pool.query('DELETE FROM sensors WHERE id = $1 RETURNING id', [id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.length > 0];
                    case 2:
                        error_7 = _a.sent();
                        console.error("Error deleting sensor ".concat(id, ":"), error_7);
                        throw new Error("Failed to delete sensor ".concat(id));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get sensors by rack ID
    SensorService.getSensorsByRack = function (rackId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, result, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        query = "\n        SELECT * FROM sensors \n        WHERE rack_id = $1 \n        ORDER BY type\n      ";
                        return [4 /*yield*/, connection_1.pool.query(query, [rackId])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(function (row) { return (__assign(__assign({}, row), { last_updated: new Date(row.last_updated) })); })];
                    case 2:
                        error_8 = _a.sent();
                        console.error("Error getting sensors for rack ".concat(rackId, ":"), error_8);
                        throw new Error("Failed to retrieve sensors for rack ".concat(rackId));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get sensor statistics
    SensorService.getSensorStatistics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalResult, typeResult, avgResult, sensorTypes_1, averageValueByType_1, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, connection_1.pool.query("\n        SELECT \n          COUNT(*) as total_sensors,\n          COUNT(CASE WHEN alert = true THEN 1 END) as alerting_sensors\n        FROM sensors\n      ")];
                    case 1:
                        totalResult = _a.sent();
                        return [4 /*yield*/, connection_1.pool.query("\n        SELECT type, COUNT(*) as count\n        FROM sensors\n        GROUP BY type\n      ")];
                    case 2:
                        typeResult = _a.sent();
                        return [4 /*yield*/, connection_1.pool.query("\n        SELECT type, AVG(value) as avg_value\n        FROM sensors\n        GROUP BY type\n      ")];
                    case 3:
                        avgResult = _a.sent();
                        sensorTypes_1 = {};
                        typeResult.rows.forEach(function (row) {
                            sensorTypes_1[row.type] = parseInt(row.count);
                        });
                        averageValueByType_1 = {};
                        avgResult.rows.forEach(function (row) {
                            averageValueByType_1[row.type] = parseFloat(parseFloat(row.avg_value).toFixed(2));
                        });
                        return [2 /*return*/, {
                                total_sensors: parseInt(totalResult.rows[0].total_sensors),
                                alerting_sensors: parseInt(totalResult.rows[0].alerting_sensors),
                                sensor_types: sensorTypes_1,
                                average_value_by_type: averageValueByType_1
                            }];
                    case 4:
                        error_9 = _a.sent();
                        console.error('Error getting sensor statistics:', error_9);
                        throw new Error('Failed to retrieve sensor statistics');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Get sensor history (last N readings)
    SensorService.getSensorHistory = function (id_1) {
        return __awaiter(this, arguments, void 0, function (id, limit) {
            var query, result, sensor, historyError_1, sensor, error_10;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        query = "\n        SELECT value, last_updated as timestamp\n        FROM sensors_history\n        WHERE sensor_id = $1\n        ORDER BY last_updated DESC\n        LIMIT $2\n      ";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 7]);
                        return [4 /*yield*/, connection_1.pool.query(query, [id, limit])];
                    case 2:
                        result = _a.sent();
                        if (!(result.rows.length === 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getSensorById(id)];
                    case 3:
                        sensor = _a.sent();
                        if (sensor) {
                            return [2 /*return*/, [{
                                        value: sensor.value,
                                        timestamp: sensor.last_updated
                                    }]];
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/, result.rows.map(function (row) { return ({
                            value: row.value,
                            timestamp: new Date(row.timestamp)
                        }); })];
                    case 5:
                        historyError_1 = _a.sent();
                        return [4 /*yield*/, this.getSensorById(id)];
                    case 6:
                        sensor = _a.sent();
                        if (sensor) {
                            return [2 /*return*/, [{
                                        value: sensor.value,
                                        timestamp: sensor.last_updated
                                    }]];
                        }
                        return [2 /*return*/, []];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_10 = _a.sent();
                        console.error("Error getting history for sensor ".concat(id, ":"), error_10);
                        return [2 /*return*/, []];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // Bulk update sensor values (for simulation)
    SensorService.bulkUpdateSensorValues = function (updates) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedSensors, _i, updates_1, update, sensor, sensorError_1, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        updatedSensors = [];
                        _i = 0, updates_1 = updates;
                        _a.label = 1;
                    case 1:
                        if (!(_i < updates_1.length)) return [3 /*break*/, 6];
                        update = updates_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.updateSensorValue(update.id, update.value)];
                    case 3:
                        sensor = _a.sent();
                        updatedSensors.push(sensor);
                        return [3 /*break*/, 5];
                    case 4:
                        sensorError_1 = _a.sent();
                        console.error("Failed to update sensor ".concat(update.id, ":"), sensorError_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, updatedSensors];
                    case 7:
                        error_11 = _a.sent();
                        console.error('Error in bulk update:', error_11);
                        throw new Error('Failed to perform bulk update');
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return SensorService;
}());
exports.SensorService = SensorService;
// Export instance for convenience
exports.sensorService = new SensorService();
