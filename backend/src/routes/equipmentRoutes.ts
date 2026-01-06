import { Router } from 'express';
import { EquipmentService } from '../services/equipmentService';

const router = Router();
const equipmentService = new EquipmentService();

// GET /api/equipment - Get all equipment
router.get('/', async (req, res) => {
  try {
    const { zone_id, rack_id, status, type } = req.query;
    const filters: any = {};

    if (zone_id) filters.zone_id = zone_id;
    if (rack_id) filters.rack_id = rack_id;
    if (status) filters.status = status;
    if (type) filters.type = type;

    const equipment = await equipmentService.getAllEquipment(filters);
    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// GET /api/equipment/:id - Get equipment by ID
router.get('/:id', async (req, res) => {
  try {
    const equipment = await equipmentService.getEquipmentById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// POST /api/equipment - Create new equipment
router.post('/', async (req, res) => {
  try {
    const equipment = await equipmentService.createEquipment(req.body);
    res.status(201).json(equipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

// PUT /api/equipment/:id - Update equipment
router.put('/:id', async (req, res) => {
  try {
    const equipment = await equipmentService.updateEquipment(req.params.id, req.body);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// DELETE /api/equipment/:id - Delete equipment
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await equipmentService.deleteEquipment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

// GET /api/equipment/:id/metrics - Get equipment metrics
router.get('/:id/metrics', async (req, res) => {
  try {
    const { type, start_date, end_date } = req.query;
    const metrics = await equipmentService.getEquipmentMetrics(
      req.params.id,
      type as string,
      start_date as string,
      end_date as string
    );
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching equipment metrics:', error);
    res.status(500).json({ error: 'Failed to fetch equipment metrics' });
  }
});

// POST /api/equipment/:id/maintenance - Schedule maintenance
router.post('/:id/maintenance', async (req, res) => {
  try {
    const maintenance = await equipmentService.scheduleMaintenance(req.params.id, req.body);
    res.status(201).json(maintenance);
  } catch (error) {
    console.error('Error scheduling maintenance:', error);
    res.status(500).json({ error: 'Failed to schedule maintenance' });
  }
});

// POST /api/equipment/sync - Sync with DataCenter Generator
router.post('/sync', async (req, res) => {
  try {
    const { equipmentData } = req.body;
    const result = await equipmentService.syncWithDataCenterGenerator(equipmentData);
    res.json(result);
  } catch (error) {
    console.error('Error syncing equipment:', error);
    res.status(500).json({ error: 'Failed to sync equipment' });
  }
});

// GET /api/equipment/orphaned - Get orphaned equipment
router.get('/orphaned', async (req, res) => {
  try {
    const orphaned = await equipmentService.getOrphanedEquipment();
    res.json(orphaned);
  } catch (error) {
    console.error('Error fetching orphaned equipment:', error);
    res.status(500).json({ error: 'Failed to fetch orphaned equipment' });
  }
});

// POST /api/equipment/scan - Network scan
router.post('/scan', async (req, res) => {
  try {
    const { subnet } = req.body;
    const devices = await equipmentService.scanNetwork(subnet);
    res.json(devices);
  } catch (error) {
    console.error('Error scanning network:', error);
    res.status(500).json({ error: 'Failed to scan network' });
  }
});

// POST /api/equipment/import - Bulk import
router.post('/import', async (req, res) => {
  try {
    const { equipmentData } = req.body;
    const result = await equipmentService.bulkImportEquipment(equipmentData);
    res.json(result);
  } catch (error) {
    console.error('Error importing equipment:', error);
    res.status(500).json({ error: 'Failed to import equipment' });
  }
});

// GET /api/equipment/:id/history - Get equipment history
router.get('/:id/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await equipmentService.getEquipmentHistory(req.params.id, limit);
    res.json(history);
  } catch (error) {
    console.error('Error fetching equipment history:', error);
    res.status(500).json({ error: 'Failed to fetch equipment history' });
  }
});

// POST /api/equipment/:id/history - Add equipment history
router.post('/:id/history', async (req, res) => {
  try {
    const history = await equipmentService.addEquipmentHistory(req.params.id, req.body);
    res.status(201).json(history);
  } catch (error) {
    console.error('Error adding equipment history:', error);
    res.status(500).json({ error: 'Failed to add equipment history' });
  }
});

// GET /api/equipment/:id/warranty - Get equipment warranty
router.get('/:id/warranty', async (req, res) => {
  try {
    const warranty = await equipmentService.getEquipmentWithWarranty(req.params.id);
    res.json(warranty);
  } catch (error) {
    console.error('Error fetching equipment warranty:', error);
    res.status(500).json({ error: 'Failed to fetch equipment warranty' });
  }
});

// GET /api/equipment/:id/maintenance - Get maintenance history
router.get('/:id/maintenance', async (req, res) => {
  try {
    const history = await equipmentService.getEquipmentMaintenanceHistory(req.params.id);
    res.json(history);
  } catch (error) {
    console.error('Error fetching maintenance history:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance history' });
  }
});

export default router;
