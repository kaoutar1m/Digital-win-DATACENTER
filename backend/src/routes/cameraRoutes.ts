import { Router } from 'express';
import { CameraService } from '../services/cameraService';

const router = Router();
const cameraService = new CameraService();

// GET /api/cameras - Get all cameras
router.get('/', async (req, res) => {
  try {
    const { zone_id, status, type } = req.query;
    const filters: any = {};

    if (zone_id) filters.zone_id = zone_id;
    if (status) filters.status = status;
    if (type) filters.type = type;

    const cameras = await cameraService.getAllCameras(filters);
    res.json(cameras);
  } catch (error) {
    console.error('Error fetching cameras:', error);
    res.status(500).json({ error: 'Failed to fetch cameras' });
  }
});

// GET /api/cameras/:id - Get camera by ID
router.get('/:id', async (req, res) => {
  try {
    const camera = await cameraService.getCameraById(req.params.id);
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    res.json(camera);
  } catch (error) {
    console.error('Error fetching camera:', error);
    res.status(500).json({ error: 'Failed to fetch camera' });
  }
});

// POST /api/cameras - Create new camera
router.post('/', async (req, res) => {
  try {
    const camera = await cameraService.createCamera(req.body);
    res.status(201).json(camera);
  } catch (error) {
    console.error('Error creating camera:', error);
    res.status(500).json({ error: 'Failed to create camera' });
  }
});

// PUT /api/cameras/:id - Update camera
router.put('/:id', async (req, res) => {
  try {
    const camera = await cameraService.updateCamera(req.params.id, req.body);
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    res.json(camera);
  } catch (error) {
    console.error('Error updating camera:', error);
    res.status(500).json({ error: 'Failed to update camera' });
  }
});

// DELETE /api/cameras/:id - Delete camera
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await cameraService.deleteCamera(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    res.json({ message: 'Camera deleted successfully' });
  } catch (error) {
    console.error('Error deleting camera:', error);
    res.status(500).json({ error: 'Failed to delete camera' });
  }
});

// GET /api/cameras/:id/detections - Get camera detections
router.get('/:id/detections', async (req, res) => {
  try {
    const { type, start_date, end_date } = req.query;
    const detections = await cameraService.getCameraDetections(
      req.params.id,
      type as string,
      start_date as string,
      end_date as string
    );
    res.json(detections);
  } catch (error) {
    console.error('Error fetching camera detections:', error);
    res.status(500).json({ error: 'Failed to fetch camera detections' });
  }
});

// POST /api/cameras/:id/ptz - Control PTZ camera
router.post('/:id/ptz', async (req, res) => {
  try {
    const { action, pan, tilt, zoom } = req.body;
    const result = await cameraService.controlPTZ(req.params.id, { action, pan, tilt, zoom });
    res.json(result);
  } catch (error) {
    console.error('Error controlling PTZ:', error);
    res.status(500).json({ error: 'Failed to control PTZ' });
  }
});

// POST /api/cameras/:id/record - Start/stop recording
router.post('/:id/record', async (req, res) => {
  try {
    const { action } = req.body; // 'start' or 'stop'
    const result = await cameraService.controlRecording(req.params.id, action);
    res.json(result);
  } catch (error) {
    console.error('Error controlling recording:', error);
    res.status(500).json({ error: 'Failed to control recording' });
  }
});

export default router;
