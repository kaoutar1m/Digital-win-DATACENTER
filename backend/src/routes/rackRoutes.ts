import { Router, Request, Response } from 'express';
import { RackService } from '../services/rackService';

const router = Router();

router.get('/racks', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const racks = await RackService.getAllRacks();
    return res.json(racks);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch racks' });
  }
});

router.post('/racks', async (req: Request, res: Response): Promise<Response> => {
  try {
    const rack = await RackService.createRack(req.body);
    return res.status(201).json(rack);
  } catch {
    return res.status(500).json({ error: 'Failed to create rack' });
  }
});

export default router;
