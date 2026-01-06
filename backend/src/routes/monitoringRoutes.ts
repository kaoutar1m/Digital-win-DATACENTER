import express from 'express';
import { Client } from 'pg';

const router = express.Router();

// Get system metrics for monitoring dashboard
router.get('/metrics', async (req, res) => {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();

    // System overview metrics
    const systemQuery = `
      SELECT
        (SELECT COUNT(*) FROM zones) as zones,
        (SELECT COUNT(*) FROM racks) as racks,
        (SELECT COUNT(*) FROM sensors) as sensors,
        (SELECT COUNT(*) FROM equipment) as equipment,
        (SELECT COUNT(*) FROM alerts WHERE status = 'active') as active_alerts,
        (SELECT COUNT(*) FROM alerts WHERE severity = 'critical' AND status = 'active') as critical_alerts
    `;

    // Equipment status distribution
    const equipmentStatusQuery = `
      SELECT status, COUNT(*) as count
      FROM equipment
      GROUP BY status
      ORDER BY count DESC
    `;

    // Sensor summary (last 24 hours)
    const sensorSummaryQuery = `
      SELECT
        type,
        AVG(value) as avg_value,
        MIN(value) as min_value,
        MAX(value) as max_value,
        COUNT(*) as total_readings,
        SUM(CASE WHEN value > threshold THEN 1 ELSE 0 END) as alert_count
      FROM sensors
      WHERE last_updated >= NOW() - INTERVAL '24 hours'
      GROUP BY type
      ORDER BY type
    `;

    // Recent alerts
    const recentAlertsQuery = `
      SELECT
        id,
        title,
        severity,
        type,
        status,
        created_at
      FROM alerts
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Performance metrics
    const performanceQuery = `
      SELECT
        'response_time' as metric,
        AVG(EXTRACT(epoch FROM (updated_at - created_at))) * 1000 as value
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '1 hour'
      UNION ALL
      SELECT
        'power_usage' as metric,
        SUM(power_usage) as value
      FROM racks
      UNION ALL
      SELECT
        'temperature_avg' as metric,
        AVG(temperature) as value
      FROM racks
      WHERE temperature IS NOT NULL
    `;

    const [systemResult, equipmentStatusResult, sensorSummaryResult, recentAlertsResult, performanceResult] = await Promise.all([
      client.query(systemQuery),
      client.query(equipmentStatusQuery),
      client.query(sensorSummaryQuery),
      client.query(recentAlertsQuery),
      client.query(performanceQuery)
    ]);

    await client.end();

    const metrics = {
      system: systemResult.rows[0],
      equipmentStatus: equipmentStatusResult.rows,
      sensorSummary: sensorSummaryResult.rows,
      recentAlerts: recentAlertsResult.rows,
      performance: performanceResult.rows.reduce((acc: any, row: any) => {
        acc[row.metric] = parseFloat(row.value) || 0;
        return acc;
      }, {})
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    await client.end();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database connection failed'
    });
  }
});

export default router;
