import { Router, Request, Response } from 'express';
import { ZoneService } from '../services/zoneService';
import { MetricService } from '../services/metricService';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const zones = await ZoneService.getAllZones();
    return res.json(zones);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

router.get('/:zoneId/metrics', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { zoneId } = req.params;

    // Get zone information
    const zone = await ZoneService.getZoneById(zoneId);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    // Get metrics for equipment in this zone
    const metrics = await MetricService.getZoneMetrics(zoneId);

    // Calculate aggregated metrics
    const aggregatedMetrics = {
      temperature: metrics.temperature?.avg_value || 24,
      powerUsage: metrics.power_consumption?.avg_value || 150,
      rackCount: metrics.rack_count || 20,
      status: metrics.status || 'Normal',
      cpu: metrics.cpu?.avg_value || 45,
      memory: metrics.memory?.avg_value || 62,
      traffic: metrics.network_traffic?.avg_value || 30,
      humidity: metrics.humidity?.avg_value || 45,
      airFlow: metrics.air_flow?.avg_value || 1200,
      lastUpdate: new Date(),
    };

    return res.json(aggregatedMetrics);
  } catch (error) {
    console.error('Error fetching zone metrics:', error);
    return res.status(500).json({ error: 'Failed to fetch zone metrics' });
  }
});

router.post('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const zone = await ZoneService.createZone(req.body);
    return res.status(201).json(zone);
  } catch {
    return res.status(500).json({ error: 'Failed to create zone' });
  }
});

export default router;
