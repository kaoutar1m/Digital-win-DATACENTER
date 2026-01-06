import { Router, Request, Response } from 'express';
import { EquipmentModelService, EquipmentHistoryService } from '../services/equipmentModelService';

const router = Router();

// Equipment Models CRUD
router.get('/models', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const models = await EquipmentModelService.getAllEquipmentModels();
    return res.json(models);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch equipment models' });
  }
});

router.get('/models/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const model = await EquipmentModelService.getEquipmentModelById(req.params.id);
    if (!model) {
      return res.status(404).json({ error: 'Equipment model not found' });
    }
    return res.json(model);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch equipment model' });
  }
});

router.post('/models', async (req: Request, res: Response): Promise<Response> => {
  try {
    const model = await EquipmentModelService.createEquipmentModel(req.body);
    return res.status(201).json(model);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create equipment model' });
  }
});

router.put('/models/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const model = await EquipmentModelService.updateEquipmentModel(req.params.id, req.body);
    if (!model) {
      return res.status(404).json({ error: 'Equipment model not found' });
    }
    return res.json(model);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update equipment model' });
  }
});

router.delete('/models/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const deleted = await EquipmentModelService.deleteEquipmentModel(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Equipment model not found' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete equipment model' });
  }
});

// Equipment History
router.get('/:equipmentId/history', async (req: Request, res: Response): Promise<Response> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await EquipmentHistoryService.getEquipmentHistory(req.params.equipmentId, limit);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch equipment history' });
  }
});

router.get('/:equipmentId/maintenance', async (req: Request, res: Response): Promise<Response> => {
  try {
    const history = await EquipmentHistoryService.getMaintenanceHistory(req.params.equipmentId);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch maintenance history' });
  }
});

router.post('/:equipmentId/history', async (req: Request, res: Response): Promise<Response> => {
  try {
    const history = await EquipmentHistoryService.addEquipmentHistory({
      equipment_id: req.params.equipmentId,
      ...req.body
    });
    return res.status(201).json(history);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add equipment history' });
  }
});

export default router;
