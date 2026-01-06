import { Router, Request, Response, NextFunction } from 'express';
import pool from '../services/database';
import Joi from 'joi';

const router = Router();

const alertSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string()
    .valid('temperature', 'humidity', 'power', 'smoke', 'motion', 'door', 'security', 'access', 'network', 'hardware', 'software', 'environmental')
    .required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  source: Joi.string().max(100).optional(),
  zone_id: Joi.string().uuid().optional(),
  equipment_id: Joi.string().max(100).optional(),
  metadata: Joi.object().optional()
});

const alertUpdateSchema = Joi.object({
  status: Joi.string().valid('active', 'acknowledged', 'resolved', 'escalated').optional(),
  acknowledged: Joi.boolean().optional(),
  acknowledged_by: Joi.string().uuid().optional(),
  resolved_at: Joi.date().optional(),
  metadata: Joi.object().optional()
});

// GET all alerts with advanced filtering
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const {
      status, severity, type, zone_id, equipment_id, source,
      acknowledged, start_date, end_date, search, limit = '50', offset = '0'
    } = req.query;

    let query = `
      SELECT a.*, z.name as zone_name, e.type as equipment_type
      FROM alerts a
      LEFT JOIN zones z ON a.zone_id = z.id
      LEFT JOIN equipment e ON a.equipment_id = e.id
      WHERE 1=1
    `;

    const params: unknown[] = [];
    let i = 1;

    if (status) {
      query += ` AND a.status = $${i++}`;
      params.push(status);
    }

    if (severity) {
      query += ` AND a.severity = $${i++}`;
      params.push(severity);
    }

    if (type) {
      query += ` AND a.type = $${i++}`;
      params.push(type);
    }

    if (zone_id) {
      query += ` AND a.zone_id = $${i++}`;
      params.push(zone_id);
    }

    if (equipment_id) {
      query += ` AND a.equipment_id = $${i++}`;
      params.push(equipment_id);
    }

    if (source) {
      query += ` AND a.source = $${i++}`;
      params.push(source);
    }

    if (acknowledged === 'true' || acknowledged === 'false') {
      query += ` AND a.acknowledged = $${i++}`;
      params.push(acknowledged === 'true');
    }

    if (start_date) {
      query += ` AND a.created_at >= $${i++}`;
      params.push(new Date(start_date as string));
    }

    if (end_date) {
      query += ` AND a.created_at <= $${i++}`;
      params.push(new Date(end_date as string));
    }

    if (search) {
      query += ` AND (a.title ILIKE $${i++} OR a.description ILIKE $${i++} OR a.type ILIKE $${i++})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${i++} OFFSET $${i++}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST create alert
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { error, value } = alertSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { title, description, type, severity, source, zone_id, equipment_id, metadata } = value;

    const result = await pool.query(
      `INSERT INTO alerts (title, description, type, severity, source, zone_id, equipment_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description || null, type, severity, source || null, zone_id || null, equipment_id || null, metadata || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT update alert
router.put('/:id', async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { error, value } = alertUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const result = await pool.query(
    `UPDATE alerts
     SET resolved = $1, resolved_at = CASE WHEN $1 THEN NOW() ELSE NULL END
     WHERE id = $2
     RETURNING *`,
    [value.resolved, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  return res.json(result.rows[0]);
});

// DELETE alert
router.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
  const result = await pool.query(
    'DELETE FROM alerts WHERE id = $1 RETURNING *',
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  return res.json({ message: 'Alert deleted' });
});

export default router;
