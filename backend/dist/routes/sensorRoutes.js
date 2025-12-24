"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sensorService_1 = require("../services/sensorService");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        if (!req.body.rack_id || !req.body.type) {
            return res.status(400).json({ error: 'rack_id and type are required' });
        }
        const sensor = await sensorService_1.SensorService.createSensor(req.body);
        return res.status(201).json(sensor);
    }
    catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: errorMessage });
    }
});
router.get('/', async (_req, res) => {
    try {
        const sensors = await sensorService_1.SensorService.getAllSensors(true);
        return res.json(sensors);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch sensors' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const sensor = await sensorService_1.SensorService.getSensorById(req.params.id);
        if (!sensor) {
            return res.status(404).json({ error: 'Sensor not found' });
        }
        return res.json(sensor);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch sensor' });
    }
});
router.put('/:id/value', async (req, res) => {
    try {
        const { value } = req.body;
        if (value === undefined) {
            return res.status(400).json({ error: 'value is required' });
        }
        const sensor = await sensorService_1.SensorService.updateSensorValue(req.params.id, value);
        return res.json(sensor);
    }
    catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update sensor';
        return res.status(500).json({ error: errorMessage });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await sensorService_1.SensorService.deleteSensor(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Sensor not found' });
        }
        return res.json({ message: 'Sensor deleted successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to delete sensor' });
    }
});
exports.default = router;
//# sourceMappingURL=sensorRoutes.js.map