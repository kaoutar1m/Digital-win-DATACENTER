import { Router, Request, Response } from 'express';
import { SensorService } from '../services/sensorService';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.body.rack_id || !req.body.type) {
      return res.status(400).json({ error: 'rack_id and type are required' });
    }

    const sensor = await SensorService.createSensor(req.body);
    return res.status(201).json(sensor);

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: errorMessage });
  }
});

router.get('/', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const sensors = await SensorService.getAllSensors(true);
    return res.json(sensors);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const sensor = await SensorService.getSensorById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    return res.json(sensor);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch sensor' });
  }
});

router.put('/:id/value', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: 'value is required' });
    }
    const sensor = await SensorService.updateSensorValue(req.params.id, value);
    return res.json(sensor);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update sensor';
    return res.status(500).json({ error: errorMessage });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const deleted = await SensorService.deleteSensor(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    return res.json({ message: 'Sensor deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete sensor' });
  }
});

export default router;