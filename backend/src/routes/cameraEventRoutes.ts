import { Router } from 'express';
import { CameraEventService } from '../services/cameraEventService';

const router = Router();

// GET /api/camera-events/:cameraId - Get events for a specific camera
router.get('/:cameraId', async (req, res) => {
  try {
    const { cameraId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const events = await CameraEventService.getEventsByCamera(cameraId, limit);
    res.json(events);
  } catch (error) {
    console.error('Error fetching camera events:', error);
    res.status(500).json({ error: 'Failed to fetch camera events' });
  }
});

// POST /api/camera-events - Create a new camera event
router.post('/', async (req, res) => {
  try {
    const eventData = req.body;
    const event = await CameraEventService.createEvent(eventData);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating camera event:', error);
    res.status(500).json({ error: 'Failed to create camera event' });
  }
});

// PUT /api/camera-events/:eventId/acknowledge - Acknowledge an event
router.put('/:eventId/acknowledge', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    const success = await CameraEventService.acknowledgeEvent(eventId, userId);
    if (success) {
      res.json({ message: 'Event acknowledged successfully' });
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    console.error('Error acknowledging camera event:', error);
    res.status(500).json({ error: 'Failed to acknowledge camera event' });
  }
});

// GET /api/camera-events/unacknowledged - Get all unacknowledged events
router.get('/unacknowledged/all', async (req, res) => {
  try {
    const events = await CameraEventService.getUnacknowledgedEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching unacknowledged events:', error);
    res.status(500).json({ error: 'Failed to fetch unacknowledged events' });
  }
});

// GET /api/camera-events/severity/:severity - Get events by severity
router.get('/severity/:severity', async (req, res) => {
  try {
    const { severity } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const events = await CameraEventService.getEventsBySeverity(severity, limit);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events by severity:', error);
    res.status(500).json({ error: 'Failed to fetch events by severity' });
  }
});

export default router;
