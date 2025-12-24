import { pool } from '../database/connection';

// Define TypeScript interfaces
export interface Sensor {
  id: string;
  rack_id: string;
  type: 'temperature' | 'humidity' | 'power' | 'smoke' | 'motion' | 'door';
  value: number;
  threshold: number;
  alert: boolean;
  last_updated: Date;
}

export interface CreateSensorDTO {
  rack_id: string;
  type: 'temperature' | 'humidity' | 'power' | 'smoke' | 'motion' | 'door';
  value: number;
  threshold: number;
  alert?: boolean; // Optional, will be calculated if not provided
}

export interface UpdateSensorValueDTO {
  id: string;
  value: number;
}

export interface SensorWithRackInfo extends Sensor {
  rack_name?: string;
  rack_status?: string;
  zone_name?: string;
  security_level?: string;
}

export class SensorService {
  // Get all sensors with optional rack information
  static async getAllSensors(includeRackInfo: boolean = false): Promise<SensorWithRackInfo[]> {
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
      
      const result = await pool.query(query);
      return result.rows.map((row: any) => ({
  ...row,
  last_updated: new Date(row.last_updated)
}));
    } catch (error) {
      console.error('Error getting all sensors:', error);
      throw new Error('Failed to retrieve sensors');
    }
  }

  // Get sensors with alerts (critical sensors)
  static async getSensorsWithAlerts(): Promise<SensorWithRackInfo[]> {
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
      
      const result = await pool.query(query);
    return result.rows.map((row: any) => ({
  ...row,
  last_updated: new Date(row.last_updated)
}));
    } catch (error) {
      console.error('Error getting sensors with alerts:', error);
      throw new Error('Failed to retrieve alerting sensors');
    }
  }

  // Get single sensor by ID
  static async getSensorById(id: string): Promise<SensorWithRackInfo | null> {
    try {
      const query = `
        SELECT s.*, r.name as rack_name, r.status as rack_status,
               z.name as zone_name, z.security_level
        FROM sensors s
        LEFT JOIN racks r ON s.rack_id = r.id
        LEFT JOIN zones z ON r.zone_id = z.id
        WHERE s.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return {
        ...result.rows[0],
        last_updated: new Date(result.rows[0].last_updated)
      };
    } catch (error) {
      console.error(`Error getting sensor ${id}:`, error);
      throw new Error(`Failed to retrieve sensor ${id}`);
    }
  }

  // Create new sensor
  static async createSensor(sensorData: CreateSensorDTO): Promise<Sensor> {
    try {
      // Validate sensor type
      const validTypes = ['temperature', 'humidity', 'power', 'smoke', 'motion', 'door'];
      if (!validTypes.includes(sensorData.type)) {
        throw new Error(`Invalid sensor type. Must be one of: ${validTypes.join(', ')}`);
      }
      
      // Calculate alert status if not provided
      const alert = sensorData.alert !== undefined ? sensorData.alert : sensorData.value > sensorData.threshold;
      
      // Verify rack exists
      const rackCheck = await pool.query(
        'SELECT id FROM racks WHERE id = $1',
        [sensorData.rack_id]
      );
      
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
      
      const result = await pool.query(query, values);
      
      const sensor = result.rows[0];
      return {
        ...sensor,
        last_updated: new Date(sensor.last_updated)
      };
    } catch (error) {
      console.error('Error creating sensor:', error);
      if (error instanceof Error) {
        throw error; // Re-throw validation errors
      }
      throw new Error('Failed to create sensor');
    }
  }

  // Update sensor value and recalculate alert
  static async updateSensorValue(id: string, value: number): Promise<Sensor> {
    try {
      // First get current sensor to check threshold
      const currentSensor = await this.getSensorById(id);
      if (!currentSensor) {
        throw new Error(`Sensor with ID ${id} not found`);
      }
      
      // Recalculate alert based on new value
      const alert = value > currentSensor.threshold;
      
      const query = `
        UPDATE sensors
        SET value = $1, 
            alert = $2,
            last_updated = NOW()
        WHERE id = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [value, alert, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Sensor with ID ${id} not found`);
      }
      
      const sensor = result.rows[0];
      return {
        ...sensor,
        last_updated: new Date(sensor.last_updated)
      };
    } catch (error) {
      console.error(`Error updating sensor ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to update sensor ${id}`);
    }
  }

  // Update sensor threshold
  static async updateSensorThreshold(id: string, threshold: number): Promise<Sensor> {
    try {
      // Get current sensor value
      const currentSensor = await this.getSensorById(id);
      if (!currentSensor) {
        throw new Error(`Sensor with ID ${id} not found`);
      }
      
      // Recalculate alert based on new threshold
      const alert = currentSensor.value > threshold;
      
      const query = `
        UPDATE sensors
        SET threshold = $1,
            alert = $2,
            last_updated = NOW()
        WHERE id = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [threshold, alert, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Sensor with ID ${id} not found`);
      }
      
      const sensor = result.rows[0];
      return {
        ...sensor,
        last_updated: new Date(sensor.last_updated)
      };
    } catch (error) {
      console.error(`Error updating sensor threshold ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to update sensor threshold ${id}`);
    }
  }

  // Delete sensor
  static async deleteSensor(id: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM sensors WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error deleting sensor ${id}:`, error);
      throw new Error(`Failed to delete sensor ${id}`);
    }
  }

  // Get sensors by rack ID
  static async getSensorsByRack(rackId: string): Promise<Sensor[]> {
    try {
      const query = `
        SELECT * FROM sensors 
        WHERE rack_id = $1 
        ORDER BY type
      `;
      
      const result = await pool.query(query, [rackId]);
      
     return result.rows.map((row: any) => ({
  ...row,
  last_updated: new Date(row.last_updated)
}));
    } catch (error) {
      console.error(`Error getting sensors for rack ${rackId}:`, error);
      throw new Error(`Failed to retrieve sensors for rack ${rackId}`);
    }
  }

  // Get sensor statistics
  static async getSensorStatistics(): Promise<{
    total_sensors: number;
    alerting_sensors: number;
    sensor_types: { [key: string]: number };
    average_value_by_type: { [key: string]: number };
  }> {
    try {
      // Total sensors and alerts
      const totalResult = await pool.query(`
        SELECT 
          COUNT(*) as total_sensors,
          COUNT(CASE WHEN alert = true THEN 1 END) as alerting_sensors
        FROM sensors
      `);
      
      // Count by type
      const typeResult = await pool.query(`
        SELECT type, COUNT(*) as count
        FROM sensors
        GROUP BY type
      `);
      
      // Average value by type
      const avgResult = await pool.query(`
        SELECT type, AVG(value) as avg_value
        FROM sensors
        GROUP BY type
      `);
      
      // Convert to objects
      const sensorTypes: { [key: string]: number } = {};
      typeResult.rows.forEach((row: any) => {
  sensorTypes[row.type] = parseInt(row.count);
});
      const averageValueByType: { [key: string]: number } = {};
     avgResult.rows.forEach((row: any) => {
  averageValueByType[row.type] = parseFloat(parseFloat(row.avg_value).toFixed(2));
});
      return {
        total_sensors: parseInt(totalResult.rows[0].total_sensors),
        alerting_sensors: parseInt(totalResult.rows[0].alerting_sensors),
        sensor_types: sensorTypes,
        average_value_by_type: averageValueByType
      };
    } catch (error) {
      console.error('Error getting sensor statistics:', error);
      throw new Error('Failed to retrieve sensor statistics');
    }
  }

  // Get sensor history (last N readings)
  static async getSensorHistory(id: string, limit: number = 50): Promise<Array<{value: number, timestamp: Date}>> {
    try {
      const query = `
        SELECT value, last_updated as timestamp
        FROM sensors_history
        WHERE sensor_id = $1
        ORDER BY last_updated DESC
        LIMIT $2
      `;
      
      // If history table doesn't exist, fallback to current value
      try {
        const result = await pool.query(query, [id, limit]);
        
        if (result.rows.length === 0) {
          // Fallback: get current value
          const sensor = await this.getSensorById(id);
          if (sensor) {
            return [{
              value: sensor.value,
              timestamp: sensor.last_updated
            }];
          }
        }
        
        return result.rows.map((row: any) => ({
  value: row.value,
  timestamp: new Date(row.timestamp)
}));
      } catch (historyError) {
        // History table might not exist, return current value
        const sensor = await this.getSensorById(id);
        if (sensor) {
          return [{
            value: sensor.value,
            timestamp: sensor.last_updated
          }];
        }
        return [];
      }
    } catch (error) {
      console.error(`Error getting history for sensor ${id}:`, error);
      return [];
    }
  }

  // Bulk update sensor values (for simulation)
  static async bulkUpdateSensorValues(updates: Array<{id: string, value: number}>): Promise<Sensor[]> {
    try {
      const updatedSensors: Sensor[] = [];
      
      for (const update of updates) {
        try {
          const sensor = await this.updateSensorValue(update.id, update.value);
          updatedSensors.push(sensor);
        } catch (sensorError) {
          console.error(`Failed to update sensor ${update.id}:`, sensorError);
          // Continue with other updates
        }
      }
      
      return updatedSensors;
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw new Error('Failed to perform bulk update');
    }
  }
}

// Export instance for convenience
export const sensorService = new SensorService();