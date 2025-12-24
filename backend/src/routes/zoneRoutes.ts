import { Router, Request, Response } from 'express';
import { ZoneService } from '../services/zoneService';

const router = Router();

router.get('/zones', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const zones = await ZoneService.getAllZones();
    return res.json(zones);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

router.post('/zones', async (req: Request, res: Response): Promise<Response> => {
  try {
    const zone = await ZoneService.createZone(req.body);
    return res.status(201).json(zone);
  } catch {
    return res.status(500).json({ error: 'Failed to create zone' });
  }
});

export default router;
