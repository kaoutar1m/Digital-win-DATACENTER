import request from 'supertest';
import express from 'express';
import { Client } from 'pg';
import { setupTestDatabase, teardownTestDatabase } from '../setup';
import sensorRoutes from '../../src/routes/sensorRoutes';

describe('Sensor Routes', () => {
  let app: express.Application;
  let client: Client;

  beforeAll(async () => {
    client = await setupTestDatabase();

    // Insert test data
    await client.query(`
      INSERT INTO zones (id, name, security_level, color, position) VALUES
      ('zone-1', 'Zone A', 'public', '#FF0000', '{"x": 0, "y": 0, "z": 0}')
    `);

    await client.query(`
      INSERT INTO racks (id, zone_id, name, position) VALUES
      ('rack-1', 'zone-1', 'Rack A1', '{"x": 0, "y": 0, "z": 0}')
    `);

    await client.query(`
      INSERT INTO sensors (id, rack_id, type, value, threshold) VALUES
      ('sensor-1', 'rack-1', 'temperature', 25.5, 30.0),
      ('sensor-2', 'rack-1', 'humidity', 60.0, 80.0)
    `);

    app = express();
    app.use(express.json());
    app.use('/api/sensors', sensorRoutes);
  });

  afterAll(async () => {
    await teardownTestDatabase(client);
  });

  describe('GET /api/sensors', () => {
    it('should return all sensors', async () => {
      const response = await request(app).get('/api/sensors');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/sensors/:id', () => {
    it('should return a sensor by id', async () => {
      const response = await request(app).get('/api/sensors/sensor-1');
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('sensor-1');
      expect(response.body.type).toBe('temperature');
    });

    it('should return 404 for non-existent sensor', async () => {
      const response = await request(app).get('/api/sensors/non-existent');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/sensors', () => {
    it('should create a new sensor', async () => {
      const newSensor = {
        rack_id: 'rack-1',
        type: 'voltage',
        value: 220.0,
        threshold: 250.0
      };

      const response = await request(app)
        .post('/api/sensors')
        .send(newSensor);

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('voltage');
      expect(response.body.value).toBe(220.0);
    });

    it('should return 400 for invalid data', async () => {
      const invalidSensor = {
        type: 'temperature'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/sensors')
        .send(invalidSensor);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/sensors/:id', () => {
    it('should update an existing sensor', async () => {
      const updates = { value: 26.0, threshold: 32.0 };
      const response = await request(app)
        .put('/api/sensors/sensor-1')
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.value).toBe(26.0);
      expect(response.body.threshold).toBe(32.0);
    });

    it('should return 404 for non-existent sensor', async () => {
      const updates = { value: 30.0 };
      const response = await request(app)
        .put('/api/sensors/non-existent')
        .send(updates);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sensors/:id', () => {
    it('should delete an existing sensor', async () => {
      const response = await request(app).delete('/api/sensors/sensor-2');
      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app).get('/api/sensors/sensor-2');
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent sensor', async () => {
      const response = await request(app).delete('/api/sensors/non-existent');
      expect(response.status).toBe(404);
    });
  });
});
