import { Router, Request, Response } from 'express';
import { RackService } from '../services/rackService';

const router = Router();

// GET /api/racks - Get all racks
router.get('/', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const racks = await RackService.getAllRacks();
    return res.json(racks);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch racks' });
  }
});

// GET /api/racks/:id - Get rack by ID
router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const rack = await RackService.getRackById(req.params.id);
    if (!rack) {
      return res.status(404).json({ error: 'Rack not found' });
    }
    return res.json(rack);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch rack' });
  }
});

// POST /api/racks - Create new rack
router.post('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const rack = await RackService.createRack(req.body);
    return res.status(201).json(rack);
  } catch {
    return res.status(500).json({ error: 'Failed to create rack' });
  }
});

// PUT /api/racks/:id - Update rack
router.put('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const rack = await RackService.updateRack(req.params.id, req.body);
    if (!rack) {
      return res.status(404).json({ error: 'Rack not found' });
    }
    return res.json(rack);
  } catch {
    return res.status(500).json({ error: 'Failed to update rack' });
  }
});

// DELETE /api/racks/:id - Delete rack
router.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const deleted = await RackService.deleteRack(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Rack not found' });
    }
    return res.json({ message: 'Rack deleted successfully' });
  } catch {
    return res.status(500).json({ error: 'Failed to delete rack' });
  }
});

// GET /api/racks/:id/layout - Get rack layout
router.get('/:id/layout', async (req: Request, res: Response): Promise<Response> => {
  try {
    const layout = await RackService.getRackLayout(req.params.id);
    return res.json(layout);
  } catch (error) {
    console.error('Error fetching rack layout:', error);
    return res.status(500).json({ error: 'Failed to fetch rack layout' });
  }
});

// PUT /api/racks/:rackId/equipment/:equipmentId/position - Update equipment position
router.put('/:rackId/equipment/:equipmentId/position', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { position_u } = req.body;
    const success = await RackService.updateEquipmentPosition(req.params.rackId, req.params.equipmentId, position_u);
    return res.json({ success });
  } catch (error) {
    console.error('Error updating equipment position:', error);
    return res.status(500).json({ error: error.message || 'Failed to update equipment position' });
  }
});

// POST /api/racks/:rackId/equipment/:equipmentId/move - Move equipment to rack
router.post('/:rackId/equipment/:equipmentId/move', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { position_u } = req.body;
    const success = await RackService.moveEquipmentToRack(req.params.equipmentId, req.params.rackId, position_u);
    return res.json({ success });
  } catch (error) {
    console.error('Error moving equipment:', error);
    return res.status(500).json({ error: error.message || 'Failed to move equipment' });
  }
});

// GET /api/racks/:id/utilization - Get rack utilization
router.get('/:id/utilization', async (req: Request, res: Response): Promise<Response> => {
  try {
    const utilization = await RackService.getRackUtilization(req.params.id);
    return res.json(utilization);
  } catch (error) {
    console.error('Error fetching rack utilization:', error);
    return res.status(500).json({ error: 'Failed to fetch rack utilization' });
  }
});

// GET /api/racks/:id/validate - Validate rack capacity
router.get('/:id/validate', async (req: Request, res: Response): Promise<Response> => {
  try {
    const validation = await RackService.validateRackCapacity(req.params.id);
    return res.json(validation);
  } catch (error) {
    console.error('Error validating rack capacity:', error);
    return res.status(500).json({ error: 'Failed to validate rack capacity' });
  }
});

export default router;
