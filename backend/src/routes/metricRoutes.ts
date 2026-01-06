import { Router, Request, Response } from 'express';
import { MetricService } from '../services/metricService';

const router = Router();

// GET /api/metrics - Get all metrics
router.get('/', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const metrics = await MetricService.getAllMetrics();
    return res.json(metrics);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// GET /api/metrics/:id - Get metric by ID
router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const metric = await MetricService.getMetricById(req.params.id);
    if (!metric) {
      return res.status(404).json({ error: 'Metric not found' });
    }
    return res.json(metric);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch metric' });
  }
});

// GET /api/metrics/type/:type - Get metrics by type
router.get('/type/:type', async (req: Request, res: Response): Promise<Response> => {
  try {
    const metrics = await MetricService.getMetricsByType(req.params.type);
    return res.json(metrics);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch metrics by type' });
  }
});

// POST /api/metrics - Create new metric
router.post('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.body.type || !req.body.value) {
      return res.status(400).json({ error: 'type and value are required' });
    }

    const metric = await MetricService.createMetric(req.body);
    return res.status(201).json(metric);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: errorMessage });
  }
});

// PUT /api/metrics/:id - Update metric
router.put('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const metric = await MetricService.updateMetric(req.params.id, req.body);
    if (!metric) {
      return res.status(404).json({ error: 'Metric not found' });
    }
    return res.json(metric);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update metric';
    return res.status(500).json({ error: errorMessage });
  }
});

// DELETE /api/metrics/:id - Delete metric
router.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const deleted = await MetricService.deleteMetric(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Metric not found' });
    }
    return res.json({ message: 'Metric deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete metric' });
  }
});

export default router;
