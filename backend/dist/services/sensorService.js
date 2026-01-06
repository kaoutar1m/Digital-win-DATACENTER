"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sensorService = exports.SensorService = void 0;
const database_1 = __importDefault(require("../services/database"));
class SensorService {
    static async getAllSensors(includeRackInfo = false) {
        try {
            let query = 'SELECT * FROM sensors ORDER BY last_updated DESC';
            if (includeRackInfo) {
                query = `
          SELECT s.*, r.name as rack_name, r.status as rack_status, 
                 z.name as zone_name, z.security_level
          FROM sensors s
          LEFT JOIN racks r ON s.rack_id = r.id
          LEFT JOIN zones z ON r.zone_id = z.id
          ORDER BY s.last_updated DESC
        `;
            }
            const result = await database_1.default.query(query);
            return result.rows.map((row) => ({
                ...row,
                last_updated: new Date(row.last_updated)
            }));
        }
        catch (error) {
            console.error('Error getting all sensors:', error);
            throw new Error('Failed to retrieve sensors');
        }
    }
    static async getSensorsWithAlerts() {
        try {
            const query = `
        SELECT s.*, r.name as rack_name, r.status as rack_status,
               z.name as zone_name, z.security_level
        FROM sensors s
        LEFT JOIN racks r ON s.rack_id = r.id
        LEFT JOIN zones z ON r.zone_id = z.id
        WHERE s.alert = true
        ORDER BY 
          CASE s.type
            WHEN 'smoke' THEN 1
            WHEN 'temperature' THEN 2
            WHEN 'power' THEN 3
            WHEN 'door' THEN 4
            WHEN 'motion' THEN 5
            WHEN 'humidity' THEN 6
          END,
          s.last_updated DESC
      `;
            const result = await database_1.default.query(query);
            return result.rows.map((row) => ({
                ...row,
                last_updated: new Date(row.last_updated)
            }));
        }
        catch (error) {
            console.error('Error getting sensors with alerts:', error);
            throw new Error('Failed to retrieve alerting sensors');
        }
    }
    static async getSensorById(id) {
        try {
            const query = `
        SELECT s.*, r.name as rack_name, r.status as rack_status,
               z.name as zone_name, z.security_level
        FROM sensors s
        LEFT JOIN racks r ON s.rack_id = r.id
        LEFT JOIN zones z ON r.zone_id = z.id
        WHERE s.id = $1
      `;
            const result = await database_1.default.query(query, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            return {
                ...result.rows[0],
                last_updated: new Date(result.rows[0].last_updated)
            };
        }
        catch (error) {
            console.error(`Error getting sensor ${id}:`, error);
            throw new Error(`Failed to retrieve sensor ${id}`);
        }
    }
    static async createSensor(sensorData) {
        try {
            const validTypes = ['temperature', 'humidity', 'power', 'smoke', 'motion', 'door'];
            if (!validTypes.includes(sensorData.type)) {
                throw new Error(`Invalid sensor type. Must be one of: ${validTypes.join(', ')}`);
            }
            const alert = sensorData.alert !== undefined ? sensorData.alert : sensorData.value > sensorData.threshold;
            const rackCheck = await database_1.default.query('SELECT id FROM racks WHERE id = $1', [sensorData.rack_id]);
            if (rackCheck.rows.length === 0) {
                throw new Error(`Rack with ID ${sensorData.rack_id} not found`);
            }
            const query = `
        INSERT INTO sensors (rack_id, type, value, threshold, alert)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
            const values = [
                sensorData.rack_id,
                sensorData.type,
                sensorData.value,
                sensorData.threshold,
                alert
            ];
            const result = await database_1.default.query(query, values);
            const sensor = result.rows[0];
            return {
                ...sensor,
                last_updated: new Date(sensor.last_updated)
            };
        }
        catch (error) {
            console.error('Error creating sensor:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to create sensor');
        }
    }
    static async updateSensorValue(id, value) {
        try {
            const currentSensor = await this.getSensorById(id);
            if (!currentSensor) {
                throw new Error(`Sensor with ID ${id} not found`);
            }
            const alert = value > currentSensor.threshold;
            const query = `
        UPDATE sensors
        SET value = $1, 
            alert = $2,
            last_updated = NOW()
        WHERE id = $3
        RETURNING *
      `;
            const result = await database_1.default.query(query, [value, alert, id]);
            if (result.rows.length === 0) {
                throw new Error(`Sensor with ID ${id} not found`);
            }
            const sensor = result.rows[0];
            return {
                ...sensor,
                last_updated: new Date(sensor.last_updated)
            };
        }
        catch (error) {
            console.error(`Error updating sensor ${id}:`, error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Failed to update sensor ${id}`);
        }
    }
    static async updateSensorThreshold(id, threshold) {
        try {
            const currentSensor = await this.getSensorById(id);
            if (!currentSensor) {
                throw new Error(`Sensor with ID ${id} not found`);
            }
            const alert = currentSensor.value > threshold;
            const query = `
        UPDATE sensors
        SET threshold = $1,
            alert = $2,
            last_updated = NOW()
        WHERE id = $3
        RETURNING *
      `;
            const result = await database_1.default.query(query, [threshold, alert, id]);
            if (result.rows.length === 0) {
                throw new Error(`Sensor with ID ${id} not found`);
            }
            const sensor = result.rows[0];
            return {
                ...sensor,
                last_updated: new Date(sensor.last_updated)
            };
        }
        catch (error) {
            console.error(`Error updating sensor threshold ${id}:`, error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Failed to update sensor threshold ${id}`);
        }
    }
    static async deleteSensor(id) {
        try {
            const result = await database_1.default.query('DELETE FROM sensors WHERE id = $1 RETURNING id', [id]);
            return result.rows.length > 0;
        }
        catch (error) {
            console.error(`Error deleting sensor ${id}:`, error);
            throw new Error(`Failed to delete sensor ${id}`);
        }
    }
    static async getSensorsByRack(rackId) {
        try {
            const query = `
        SELECT * FROM sensors 
        WHERE rack_id = $1 
        ORDER BY type
      `;
            const result = await database_1.default.query(query, [rackId]);
            return result.rows.map((row) => ({
                ...row,
                last_updated: new Date(row.last_updated)
            }));
        }
        catch (error) {
            console.error(`Error getting sensors for rack ${rackId}:`, error);
            throw new Error(`Failed to retrieve sensors for rack ${rackId}`);
        }
    }
    static async getSensorStatistics() {
        try {
            const totalResult = await database_1.default.query(`
        SELECT 
          COUNT(*) as total_sensors,
          COUNT(CASE WHEN alert = true THEN 1 END) as alerting_sensors
        FROM sensors
      `);
            const typeResult = await database_1.default.query(`
        SELECT type, COUNT(*) as count
        FROM sensors
        GROUP BY type
      `);
            const avgResult = await database_1.default.query(`
        SELECT type, AVG(value) as avg_value
        FROM sensors
        GROUP BY type
      `);
            const sensorTypes = {};
            typeResult.rows.forEach((row) => {
                sensorTypes[row.type] = parseInt(row.count);
            });
            const averageValueByType = {};
            avgResult.rows.forEach((row) => {
                averageValueByType[row.type] = parseFloat(parseFloat(row.avg_value).toFixed(2));
            });
            return {
                total_sensors: parseInt(totalResult.rows[0].total_sensors),
                alerting_sensors: parseInt(totalResult.rows[0].alerting_sensors),
                sensor_types: sensorTypes,
                average_value_by_type: averageValueByType
            };
        }
        catch (error) {
            console.error('Error getting sensor statistics:', error);
            throw new Error('Failed to retrieve sensor statistics');
        }
    }
    static async getSensorHistory(id, limit = 50) {
        try {
            const query = `
        SELECT value, last_updated as timestamp
        FROM sensors_history
        WHERE sensor_id = $1
        ORDER BY last_updated DESC
        LIMIT $2
      `;
            try {
                const result = await database_1.default.query(query, [id, limit]);
                if (result.rows.length === 0) {
                    const sensor = await this.getSensorById(id);
                    if (sensor) {
                        return [{
                                value: sensor.value,
                                timestamp: sensor.last_updated
                            }];
                    }
                }
                return result.rows.map((row) => ({
                    value: row.value,
                    timestamp: new Date(row.timestamp)
                }));
            }
            catch (historyError) {
                const sensor = await this.getSensorById(id);
                if (sensor) {
                    return [{
                            value: sensor.value,
                            timestamp: sensor.last_updated
                        }];
                }
                return [];
            }
        }
        catch (error) {
            console.error(`Error getting history for sensor ${id}:`, error);
            return [];
        }
    }
    static async bulkUpdateSensorValues(updates) {
        try {
            const updatedSensors = [];
            for (const update of updates) {
                try {
                    const sensor = await this.updateSensorValue(update.id, update.value);
                    updatedSensors.push(sensor);
                }
                catch (sensorError) {
                    console.error(`Failed to update sensor ${update.id}:`, sensorError);
                }
            }
            return updatedSensors;
        }
        catch (error) {
            console.error('Error in bulk update:', error);
            throw new Error('Failed to perform bulk update');
        }
    }
}
exports.SensorService = SensorService;
exports.sensorService = new SensorService();
//# sourceMappingURL=sensorService.js.map