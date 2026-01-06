import pool from './database';

interface ZoneMetrics {
  temperature?: { avg_value: number; count: number };
  power_consumption?: { avg_value: number; count: number };
  cpu?: { avg_value: number; count: number };
  memory?: { avg_value: number; count: number };
  network_traffic?: { avg_value: number; count: number };
  humidity?: { avg_value: number; count: number };
  air_flow?: { avg_value: number; count: number };
  rack_count: number;
  status: 'Normal' | 'Warning' | 'Critical';
}

export class MetricService {
  static async getZoneMetrics(zoneId: string): Promise<ZoneMetrics> {
    try {
      // Get equipment in this zone (assuming racks are associated with zones)
      const equipmentQuery = `
        SELECT e.id, e.rack_id
        FROM equipment e
        JOIN racks r ON e.rack_id = r.id
        WHERE r.zone_id = $1
      `;
      const equipmentResult = await pool.query(equipmentQuery, [zoneId]);
      const equipmentIds = equipmentResult.rows.map(row => row.id);

      if (equipmentIds.length === 0) {
        return {
          rack_count: 0,
          status: 'Normal'
        };
      }

      // Get latest metrics for equipment in this zone
      const metricsQuery = `
        SELECT
          AVG(temperature) as avg_temperature,
          COUNT(temperature) as count_temperature,
          AVG(power_consumption) as avg_power_consumption,
          COUNT(power_consumption) as count_power_consumption,
          AVG(load) as avg_load,
          COUNT(load) as count_load,
          AVG(memory_usage) as avg_memory_usage,
          COUNT(memory_usage) as count_memory_usage
        FROM equipment_metrics
        WHERE equipment_id = ANY($1)
          AND recorded_at >= NOW() - INTERVAL '1 hour'
      `;
      const metricsResult = await pool.query(metricsQuery, [equipmentIds]);

      // Get rack count for this zone
      const rackQuery = 'SELECT COUNT(*) as count FROM racks WHERE zone_id = $1';
      const rackResult = await pool.query(rackQuery, [zoneId]);

      // Process metrics
      const metrics: ZoneMetrics = {
        rack_count: parseInt(rackResult.rows[0].count) || 0,
        status: 'Normal'
      };

      if (metricsResult.rows.length > 0) {
        const row = metricsResult.rows[0];
        if (row.avg_temperature) {
          metrics.temperature = {
            avg_value: parseFloat(row.avg_temperature),
            count: parseInt(row.count_temperature)
          };
        }
        if (row.avg_power_consumption) {
          metrics.power_consumption = {
            avg_value: parseFloat(row.avg_power_consumption),
            count: parseInt(row.count_power_consumption)
          };
        }
        if (row.avg_load) {
          metrics.cpu = {
            avg_value: parseFloat(row.avg_load),
            count: parseInt(row.count_load)
          };
        }
        if (row.avg_memory_usage) {
          metrics.memory = {
            avg_value: parseFloat(row.avg_memory_usage),
            count: parseInt(row.count_memory_usage)
          };
        }
      }

      // Determine status based on thresholds
      if (metrics.temperature && metrics.temperature.avg_value > 30) {
        metrics.status = 'Critical';
      } else if (metrics.temperature && metrics.temperature.avg_value > 25) {
        metrics.status = 'Warning';
      }

      return metrics;
    } catch (error) {
      console.error('Error fetching zone metrics:', error);
      // Return default values on error
      return {
        rack_count: 0,
        status: 'Normal'
      };
    }
  }

  static async getLatestMetrics(equipmentId: string): Promise<any[]> {
    const query = `
      SELECT * FROM equipment_metrics
      WHERE equipment_id = $1
      ORDER BY recorded_at DESC
      LIMIT 10
    `;
    const result = await pool.query(query, [equipmentId]);
    return result.rows;
  }

  static async createMetric(metric: {
    equipment_id: string;
    temperature?: number;
    power_consumption?: number;
    load?: number;
    memory_usage?: number;
    storage_usage?: number;
    uptime?: number;
  }): Promise<any> {
    const fields = ['equipment_id'];
    const placeholders = ['$1'];
    const values: (string | number)[] = [metric.equipment_id];
    let index = 2;

    if (metric.temperature !== undefined) {
      fields.push('temperature');
      placeholders.push('$' + index);
      values.push(metric.temperature);
      index++;
    }
    if (metric.power_consumption !== undefined) {
      fields.push('power_consumption');
      placeholders.push('$' + index);
      values.push(metric.power_consumption);
      index++;
    }
    if (metric.load !== undefined) {
      fields.push('load');
      placeholders.push('$' + index);
      values.push(metric.load);
      index++;
    }
    if (metric.memory_usage !== undefined) {
      fields.push('memory_usage');
      placeholders.push('$' + index);
      values.push(metric.memory_usage);
      index++;
    }
    if (metric.storage_usage !== undefined) {
      fields.push('storage_usage');
      placeholders.push('$' + index);
      values.push(metric.storage_usage);
      index++;
    }
    if (metric.uptime !== undefined) {
      fields.push('uptime');
      placeholders.push('$' + index);
      values.push(metric.uptime);
      index++;
    }

    const query = `
      INSERT INTO equipment_metrics (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAllMetrics(): Promise<any[]> {
  const query = 'SELECT * FROM equipment_metrics ORDER BY recorded_at DESC';
  const result = await pool.query(query);
  return result.rows;
}


}
