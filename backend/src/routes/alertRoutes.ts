import { Router, Request, Response, NextFunction } from 'express';
import pool from '../services/database';
import Joi from 'joi';

const router = Router();

const alertSchema = Joi.object({
  sensor_id: Joi.string().uuid().optional(),
  rack_id: Joi.string().uuid().optional(),
  type: Joi.string()
    .valid('temperature', 'humidity', 'power', 'smoke', 'motion', 'door', 'security', 'access')
    .required(),
  message: Joi.string().min(5).max(500).required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium')
});

const alertUpdateSchema = Joi.object({
  resolved: Joi.boolean().required()
});

// GET all alerts
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { resolved, severity, rack_id, start_date, end_date } = req.query;

    let query = `
      SELECT a.*
      FROM alerts a
      WHERE 1=1
    `;

    const params: unknown[] = [];
    let i = 1;

    if (resolved === 'true' || resolved === 'false') {
      query += ` AND a.resolved = $${i++}`;
      params.push(resolved === 'true');
    }

    if (severity) {
      query += ` AND a.severity = $${i++}`;
      params.push(severity);
    }

    if (rack_id) {
      query += ` AND a.rack_id = $${i++}`;
      params.push(rack_id);
    }

    if (start_date) {
      query += ` AND a.created_at >= $${i++}`;
      params.push(new Date(start_date as string));
    }

    if (end_date) {
      query += ` AND a.created_at <= $${i++}`;
      params.push(new Date(end_date as string));
    }

    query += ` ORDER BY a.created_at DESC`;

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

    const { sensor_id, rack_id, type, message, severity } = value;

    if (!sensor_id && !rack_id) {
      return res.status(400).json({ error: 'sensor_id or rack_id is required' });
    }

    const result = await pool.query(
      `INSERT INTO alerts (sensor_id, rack_id, type, message, severity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sensor_id ?? null, rack_id ?? null, type, message, severity]
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
