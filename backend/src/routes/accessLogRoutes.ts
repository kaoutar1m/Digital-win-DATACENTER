import { Router } from 'express';
import { AccessLogService } from '../services/accessLogService';

const router = Router();
const accessLogService = new AccessLogService();

// GET /api/access-logs - Get access logs with filters
router.get('/', async (req, res) => {
  try {
    const {
      user_id,
      zone_id,
      action,
      success,
      biometric_type,
      start_date,
      end_date,
      limit,
      offset
    } = req.query;

    const filters: any = {};

    if (user_id) filters.user_id = user_id;
    if (zone_id) filters.zone_id = zone_id;
    if (action) filters.action = action;
    if (success !== undefined) filters.success = success === 'true';
    if (biometric_type) filters.biometric_type = biometric_type;
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);

    const logs = await accessLogService.getAccessLogs(filters);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({ error: 'Failed to fetch access logs' });
  }
});

// GET /api/access-logs/:id - Get access log by ID
router.get('/:id', async (req, res) => {
  try {
    const log = await accessLogService.getAccessLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Access log not found' });
    }
    res.json(log);
  } catch (error) {
    console.error('Error fetching access log:', error);
    res.status(500).json({ error: 'Failed to fetch access log' });
  }
});

// POST /api/access-logs - Create new access log entry
router.post('/', async (req, res) => {
  try {
    const log = await accessLogService.createAccessLog(req.body);
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating access log:', error);
    res.status(500).json({ error: 'Failed to create access log' });
  }
});

// GET /api/access-logs/user/:userId - Get access logs for specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { start_date, end_date, limit } = req.query;
    const logs = await accessLogService.getUserAccessLogs(
      req.params.userId,
      start_date as string,
      end_date as string,
      limit ? parseInt(limit as string) : undefined
    );
    res.json(logs);
  } catch (error) {
    console.error('Error fetching user access logs:', error);
    res.status(500).json({ error: 'Failed to fetch user access logs' });
  }
});

// GET /api/access-logs/zone/:zoneId - Get access logs for specific zone
router.get('/zone/:zoneId', async (req, res) => {
  try {
    const { start_date, end_date, limit } = req.query;
    const logs = await accessLogService.getZoneAccessLogs(
      req.params.zoneId,
      start_date as string,
      end_date as string,
      limit ? parseInt(limit as string) : undefined
    );
    res.json(logs);
  } catch (error) {
    console.error('Error fetching zone access logs:', error);
    res.status(500).json({ error: 'Failed to fetch zone access logs' });
  }
});

// GET /api/access-logs/statistics - Get access log statistics
router.get('/statistics/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const stats = await accessLogService.getAccessStatistics(
      start_date as string,
      end_date as string
    );
    res.json(stats);
  } catch (error) {
    console.error('Error fetching access statistics:', error);
    res.status(500).json({ error: 'Failed to fetch access statistics' });
  }
});

// GET /api/access-logs/security-events - Get security events
router.get('/security-events', async (req, res) => {
  try {
    const { severity, resolved, start_date, end_date } = req.query;
    const filters: any = {};

    if (severity) filters.severity = severity;
    if (resolved !== undefined) filters.resolved = resolved === 'true';
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;

    const events = await accessLogService.getSecurityEvents(filters);
    res.json(events);
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({ error: 'Failed to fetch security events' });
  }
});

// POST /api/access-logs/security-events - Create security event
router.post('/security-events', async (req, res) => {
  try {
    const event = await accessLogService.createSecurityEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating security event:', error);
    res.status(500).json({ error: 'Failed to create security event' });
  }
});

// PUT /api/access-logs/security-events/:id/resolve - Resolve security event
router.put('/security-events/:id/resolve', async (req, res) => {
  try {
    const { resolved_by, notes } = req.body;
    const event = await accessLogService.resolveSecurityEvent(
      req.params.id,
      resolved_by,
      notes
    );
    if (!event) {
      return res.status(404).json({ error: 'Security event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error resolving security event:', error);
    res.status(500).json({ error: 'Failed to resolve security event' });
  }
});

// GET /api/access-logs/biometric-stats - Get biometric authentication statistics
router.get('/biometric-stats', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const stats = await accessLogService.getBiometricStats(
      start_date as string,
      end_date as string
    );
    res.json(stats);
  } catch (error) {
    console.error('Error fetching biometric stats:', error);
    res.status(500).json({ error: 'Failed to fetch biometric stats' });
  }
});

export default router;
